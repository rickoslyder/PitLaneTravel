import {
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  boolean
} from "drizzle-orm/pg-core"

export const currencyRatesTable = pgTable(
  "currency_rates",
  {
    id: text("id").primaryKey(), // Format: USD-EUR
    fromCurrency: text("from_currency").notNull(),
    toCurrency: text("to_currency").notNull(),
    rate: numeric("rate", { precision: 20, scale: 10 }).notNull(),
    lastUpdated: timestamp("last_updated", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastFetchSuccess: timestamp("last_fetch_success", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastFetchError: text("last_fetch_error"),
    isActive: boolean("is_active").default(true).notNull()
  },
  table => ({
    currencyPairIdx: uniqueIndex("currency_pair_idx").on(
      table.fromCurrency,
      table.toCurrency
    )
  })
)

export type InsertCurrencyRate = typeof currencyRatesTable.$inferInsert
export type SelectCurrencyRate = typeof currencyRatesTable.$inferSelect
