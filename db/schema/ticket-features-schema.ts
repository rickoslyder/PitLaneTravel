import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp
} from "drizzle-orm/pg-core"

export const featureCategoryEnum = pgEnum("feature_category", [
  "access",
  "hospitality",
  "experience"
])

export const featureTypeEnum = pgEnum("feature_type", [
  "included",
  "optional",
  "upgrade"
])

export const ticketFeaturesTable = pgTable("ticket_features", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  category: featureCategoryEnum("category").notNull().default("access"),
  featureType: featureTypeEnum("feature_type").notNull().default("included"),
  icon: text("icon"),
  displayPriority: integer("display_priority").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  updatedBy: text("updated_by")
})

export type InsertTicketFeature = typeof ticketFeaturesTable.$inferInsert
export type SelectTicketFeature = typeof ticketFeaturesTable.$inferSelect
