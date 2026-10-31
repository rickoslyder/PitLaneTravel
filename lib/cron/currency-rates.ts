import { currencyRatesTable } from "@/db/schema/currency-rates-schema"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import type * as schema from "@/db/schema"

const PRIMARY_API_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1"
const FALLBACK_API_URL = "https://latest.currency-api.pages.dev/v1"
const FETCH_TIMEOUT_MS = 8000

type CurrencyWriter = Pick<PostgresJsDatabase<typeof schema>, "insert">

export async function fetchCurrencyDocument(
  currency: string
): Promise<Record<string, unknown>> {
  const code = currency.toLowerCase()
  const urls = [
    `${PRIMARY_API_URL}/currencies/${code}.json`,
    `${FALLBACK_API_URL}/currencies/${code}.json`
  ]
  let lastError = "Unknown error"

  for (const [index, url] of urls.entries()) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
      })
      if (!response.ok) {
        lastError = `${response.status} ${response.statusText}`.trim()
        if (index === 0) {
          console.log(
            `Primary currency API failed for ${currency}, trying fallback...`
          )
        }
        continue
      }

      const data: unknown = await response.json()
      if (!data || typeof data !== "object") {
        lastError = "Invalid response format"
        continue
      }
      return data as Record<string, unknown>
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown error"
      if (index === 0) {
        console.log(
          `Primary currency API failed for ${currency}, trying fallback...`
        )
      }
    }
  }

  throw new Error(`Failed to fetch rates for ${currency}: ${lastError}`)
}

export async function upsertCurrencyRate(
  database: CurrencyWriter,
  input: {
    fromCurrency: string
    toCurrency: string
    rate: string
    at: Date
  }
): Promise<void> {
  const id = `${input.fromCurrency}-${input.toCurrency}`
  await database
    .insert(currencyRatesTable)
    .values({
      id,
      fromCurrency: input.fromCurrency,
      toCurrency: input.toCurrency,
      rate: input.rate,
      lastUpdated: input.at,
      lastFetchSuccess: input.at,
      lastFetchError: null
    })
    .onConflictDoUpdate({
      target: currencyRatesTable.id,
      set: {
        rate: input.rate,
        lastUpdated: input.at,
        lastFetchSuccess: input.at,
        lastFetchError: null
      }
    })
}
