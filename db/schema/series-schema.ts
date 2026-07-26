/*
<ai_context>
Defines the database schema for racing series (Formula 1, Formula E, MotoGP, IndyCar,
WEC, ...). This is the top-level championship a race belongs to.

NOTE: this is distinct from `supporting_series` (supporting-series-schema.ts), which
models support races *within* a single race weekend (e.g. F2/F3 on an F1 weekend).
</ai_context>
*/

import { pgTable, text, timestamp, uuid, boolean, integer } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { racesTable } from "./races-schema"

export const seriesTable = pgTable("series", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Display + identity
  name: text("name").notNull(), // "Formula 1"
  shortName: text("short_name").notNull(), // "F1"
  slug: text("slug").notNull().unique(), // "f1" — used in URLs and the provider registry
  governingBody: text("governing_body"), // "FIA"
  // Event naming: how a single event in this series is styled, e.g.
  // "Grand Prix" (F1), "ePrix" (Formula E), "Grand Prix" (MotoGP), "Race" (IndyCar),
  // "Round" / "6 Hours of ..." (WEC). Used by lib/series#formatEventName.
  eventNoun: text("event_noun").notNull().default("Grand Prix"),
  seasonLabel: text("season_label"), // "2026 FIA Formula One World Championship"
  // Presentation
  logoUrl: text("logo_url"),
  accentColor: text("accent_color"), // hex, for series-themed UI accents
  description: text("description"),
  // The live-data provider slug for this series (see services/providers). Defaults to
  // "manual" — data entered via the admin CMS with no automated feed.
  dataProvider: text("data_provider").notNull().default("manual"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export const seriesRelations = relations(seriesTable, ({ many }) => ({
  races: many(racesTable)
}))

export type InsertSeries = typeof seriesTable.$inferInsert
export type SelectSeries = typeof seriesTable.$inferSelect
