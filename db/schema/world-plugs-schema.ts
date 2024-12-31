import { pgTable, text, timestamp, serial } from "drizzle-orm/pg-core"

export const worldPlugsTable = pgTable("world_plugs", {
  id: serial("id").primaryKey(),
  countryCode: text("country_code").notNull(),
  frequency: text("frequency").notNull(),
  name: text("name").notNull(),
  plugType: text("plug_type").notNull(),
  voltage: text("voltage").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertWorldPlug = typeof worldPlugsTable.$inferInsert
export type SelectWorldPlug = typeof worldPlugsTable.$inferSelect
