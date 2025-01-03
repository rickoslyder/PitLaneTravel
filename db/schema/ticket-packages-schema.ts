import {
  boolean,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"
import { racesTable } from "./races-schema"

export const packageTypeEnum = pgEnum("package_type", [
  "weekend",
  "vip",
  "hospitality",
  "custom"
])

export const ticketPackagesTable = pgTable("ticket_packages", {
  id: serial("id").primaryKey(),
  raceId: uuid("race_id")
    .references(() => racesTable.id)
    .notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  packageType: packageTypeEnum("package_type").notNull().default("custom"),
  basePrice: numeric("base_price", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  currency: text("currency").notNull().default("USD"),
  maxQuantity: numeric("max_quantity").notNull().default("100"),
  validFrom: timestamp("valid_from", { withTimezone: true })
    .defaultNow()
    .notNull(),
  validTo: timestamp("valid_to", { withTimezone: true }),
  termsAndConditions: text("terms_and_conditions").notNull().default(""),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  updatedBy: text("updated_by")
})

export type InsertTicketPackage = typeof ticketPackagesTable.$inferInsert
export type SelectTicketPackage = typeof ticketPackagesTable.$inferSelect
