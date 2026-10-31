import { db } from "@/db/db"
import { currencyRatesTable } from "@/db/schema/currency-rates-schema"
import { NextResponse } from "next/server"
import { SUPPORTED_CURRENCIES } from "@/config/currencies"
import { verifyCronRequest } from "@/lib/cron"
import {
  fetchCurrencyDocument,
  upsertCurrencyRate
} from "@/lib/cron/currency-rates"

export async function GET(req: Request) {
  const denied = verifyCronRequest(req)
  if (denied) return denied

  try {
    // Create all possible currency pairs
    const pairs = SUPPORTED_CURRENCIES.flatMap(fromCurrency =>
      SUPPORTED_CURRENCIES.filter(
        toCurrency => toCurrency.code !== fromCurrency.code
      ).map(toCurrency => ({
        fromCurrency: fromCurrency.code,
        toCurrency: toCurrency.code
      }))
    )

    // Fetch rates for each base currency
    const ratesByBase: Record<string, Record<string, number>> = {}

    for (const currency of SUPPORTED_CURRENCIES) {
      console.log(`Fetching rates for ${currency.code}...`)
      const data = await fetchCurrencyDocument(currency.code)
      const rates = data[currency.code.toLowerCase()]

      if (!rates || typeof rates !== "object") {
        throw new Error(`Invalid response format for ${currency.code}`)
      }

      ratesByBase[currency.code] = rates as Record<string, number>
      console.log(`Got rates for ${currency.code}`)
    }

    // Update rates in database
    await db.transaction(async tx => {
      for (const pair of pairs) {
        const { fromCurrency, toCurrency } = pair
        const exchangeRate = ratesByBase[fromCurrency][toCurrency.toLowerCase()]

        if (!exchangeRate) {
          console.error(`Missing rate for ${fromCurrency}-${toCurrency}`)
          continue
        }

        await upsertCurrencyRate(tx, {
          fromCurrency,
          toCurrency,
          rate: exchangeRate.toString(),
          at: new Date()
        })
      }
    })

    return NextResponse.json({ message: "Exchange rates updated successfully" })
  } catch (error) {
    console.error("Error updating exchange rates:", error)

    // Update all rates to mark the error
    try {
      const now = new Date()
      await db.update(currencyRatesTable).set({
        lastFetchError:
          error instanceof Error ? error.message : "Unknown error",
        lastUpdated: now
      })
    } catch (dbError) {
      console.error("Failed to update error status:", dbError)
    }

    return NextResponse.json(
      { error: "Failed to update exchange rates" },
      { status: 500 }
    )
  }
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
