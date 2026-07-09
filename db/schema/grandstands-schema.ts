/*
<ai_context>
Grandstands: named seating areas at a circuit, with the view/price/comfort attributes
fans actually compare when choosing tickets. Series-agnostic — a grandstand belongs to a
circuit, and circuits are shared across series.
</ai_context>
*/

import {
  pgTable,
  text,
  uuid,
  integer,
  boolean,
  timestamp,
  numeric
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { circuitsTable } from "./circuits-schema"

export const grandstandsTable = pgTable("grandstands", {
  id: uuid("id").defaultRandom().primaryKey(),
  circuitId: uuid("circuit_id")
    .references(() => circuitsTable.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  // 1-5 subjective view quality.
  viewRating: integer("view_rating"),
  covered: boolean("covered").default(false).notNull(),
  hasBigScreen: boolean("has_big_screen").default(false).notNull(),
  // "budget" | "mid" | "premium" — coarse price band for at-a-glance comparison.
  priceTier: text("price_tier"),
  // Rough typical price (in priceCurrency) for sorting/estimates; not a live quote.
  typicalPrice: numeric("typical_price", { precision: 10, scale: 2 }),
  priceCurrency: text("price_currency").default("GBP"),
  bestFor: text("best_for"), // "Overtaking action", "Podium & pit lane", ...
  pros: text("pros").array(),
  cons: text("cons").array(),
  viewsOf: text("views_of").array(), // corners/sections visible, e.g. ["Turn 1", "Pit straight"]
  sunExposure: text("sun_exposure"), // "morning" | "afternoon" | "shaded" | "full"
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export const grandstandsRelations = relations(grandstandsTable, ({ one }) => ({
  circuit: one(circuitsTable, {
    fields: [grandstandsTable.circuitId],
    references: [circuitsTable.id]
  })
}))

export type InsertGrandstand = typeof grandstandsTable.$inferInsert
export type SelectGrandstand = typeof grandstandsTable.$inferSelect
