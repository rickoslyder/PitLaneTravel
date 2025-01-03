"use server"

import { db } from "@/db/db"
import { currencyRatesTable, SelectCurrencyRate } from "@/db/schema/currency-rates-schema"
import { ActionState } from "@/types"
import { eq, and, desc } from "drizzle-orm"

export async function getExchangeRateAction(
  fromCurrency: string,
  toCurrency: string
): Promise<ActionState<number>> {
  try {
    if (fromCurrency === toCurrency) {
      return { isSuccess: true, message: "Same currency", data: 1 }
    }

    const [rate] = await db
      .select()
      .from(currencyRatesTable)
      .where(
        eq(currencyRatesTable.id, `${fromCurrency}-${toCurrency}`)
      )

    if (!rate) {
      // Try reverse rate
      const [reverseRate] = await db
        .select()
        .from(currencyRatesTable)
        .where(
          eq(currencyRatesTable.id, `${toCurrency}-${fromCurrency}`)
        )

      if (!reverseRate) {
        return { isSuccess: false, message: "Exchange rate not found" }
      }

      return {
        isSuccess: true,
        message: "Exchange rate found (reverse)",
        data: 1 / Number(reverseRate.rate)
      }
    }

    return {
      isSuccess: true,
      message: "Exchange rate found",
      data: Number(rate.rate)
    }
  } catch (error) {
    console.error("Error getting exchange rate:", error)
    return { isSuccess: false, message: "Failed to get exchange rate" }
  }
}

export async function convertPriceAction(
  price: number,
  fromCurrency: string,
  toCurrency: string
): Promise<ActionState<{ price: number; rate: number }>> {
  try {
    const rateResult = await getExchangeRateAction(fromCurrency, toCurrency)
    if (!rateResult.isSuccess) {
      return { isSuccess: false, message: rateResult.message }
    }

    return {
      isSuccess: true,
      message: "Price converted successfully",
      data: {
        price: price * rateResult.data,
        rate: rateResult.data
      }
    }
  } catch (error) {
    console.error("Error converting price:", error)
    return { isSuccess: false, message: "Failed to convert price" }
  }
}

export async function getSupportedCurrenciesAction(): Promise<ActionState<string[]>> {
  try {
    const rates = await db
      .select({
        fromCurrency: currencyRatesTable.fromCurrency,
        toCurrency: currencyRatesTable.toCurrency
      })
      .from(currencyRatesTable)

    const currencies = new Set<string>()
    rates.forEach(rate => {
      currencies.add(rate.fromCurrency)
      currencies.add(rate.toCurrency)
    })

    return {
      isSuccess: true,
      message: "Supported currencies retrieved",
      data: Array.from(currencies).sort()
    }
  } catch (error) {
    console.error("Error getting supported currencies:", error)
    return { isSuccess: false, message: "Failed to get supported currencies" }
  }
}

export async function getAllExchangeRatesAction(): Promise<ActionState<SelectCurrencyRate[]>> {
  try {
    const rates = await db
      .select()
      .from(currencyRatesTable)
      .where(eq(currencyRatesTable.isActive, true))
      .orderBy(desc(currencyRatesTable.lastUpdated))

    return {
      isSuccess: true,
      message: "Exchange rates retrieved successfully",
      data: rates
    }
  } catch (error) {
    console.error("Error getting exchange rates:", error)
    return { isSuccess: false, message: "Failed to get exchange rates" }
  }
}

export async function manuallyUpdateExchangeRatesAction(): Promise<ActionState<void>> {
  try {
    const response = await fetch("/api/cron/update-exchange-rates")
    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to update exchange rates")
    }

    return {
      isSuccess: true,
      message: "Exchange rates updated successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error updating exchange rates:", error)
    return { isSuccess: false, message: "Failed to update exchange rates" }
  }
} 