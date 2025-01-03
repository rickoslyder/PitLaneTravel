import { db } from "@/db/db"
import { currencyRatesTable } from "@/db/schema/currency-rates-schema"
import { NextResponse } from "next/server"
import { SUPPORTED_CURRENCIES } from "@/config/currencies"

const PRIMARY_API_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1"
const FALLBACK_API_URL = "https://latest.currency-api.pages.dev/v1"

async function fetchWithFallback(currency: string) {
  try {
    // Try primary URL first
    const response = await fetch(
      `${PRIMARY_API_URL}/currencies/${currency.toLowerCase()}.json`
    )
    if (response.ok) {
      return await response.json()
    }
    console.log(`Primary API failed for ${currency}, trying fallback...`)

    // Try fallback URL if primary fails
    const fallbackResponse = await fetch(
      `${FALLBACK_API_URL}/currencies/${currency.toLowerCase()}.json`
    )
    if (!fallbackResponse.ok) {
      throw new Error(`Both primary and fallback APIs failed for ${currency}`)
    }
    return await fallbackResponse.json()
  } catch (error) {
    throw new Error(
      `Failed to fetch rates for ${currency}: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

export async function GET() {
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
      const response = await fetch(
        `${PRIMARY_API_URL}/currencies/${currency.code.toLowerCase()}.json`
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch rates for ${currency.code}: ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log(`Got data for ${currency.code}:`, data)

      if (!data[currency.code.toLowerCase()]) {
        throw new Error(`Invalid response format for ${currency.code}`)
      }

      ratesByBase[currency.code] = data[currency.code.toLowerCase()]
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

        const now = new Date()
        await tx
          .insert(currencyRatesTable)
          .values({
            id: `${fromCurrency}-${toCurrency}`,
            fromCurrency,
            toCurrency,
            rate: exchangeRate.toString(),
            lastUpdated: now,
            lastFetchSuccess: now,
            lastFetchError: null
          })
          .onConflictDoUpdate({
            target: currencyRatesTable.id,
            set: {
              rate: exchangeRate.toString(),
              lastUpdated: now,
              lastFetchSuccess: now,
              lastFetchError: null
            }
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
