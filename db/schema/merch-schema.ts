/*
<ai_context>
Defines the database schema for merchandise.
</ai_context>
*/

import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { racesTable } from "./races-schema"

export const merchCategoryEnum = pgEnum("merch_category", [
  "clothing",
  "accessories",
  "memorabilia",
  "collectibles",
  "other"
])

export const merchTable = pgTable("merch", {
  id: uuid("id").defaultRandom().primaryKey(),
  raceId: uuid("race_id")
    .references(() => racesTable.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: merchCategoryEnum("category").notNull(),
  price: text("price").notNull(),
  currency: text("currency").notNull().default("USD"),
  imageUrl: text("image_url"),
  purchaseUrl: text("purchase_url"),
  inStock: text("in_stock").notNull().default("available"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertMerch = typeof merchTable.$inferInsert
export type SelectMerch = typeof merchTable.$inferSelect
