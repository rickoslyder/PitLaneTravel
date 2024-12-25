/*
<ai_context>
Defines the database schema for races.

Relationships:
- One-to-many with circuits (each race belongs to one circuit)
- One-to-many with tickets (each race can have multiple tickets)
- One-to-many with meetups (each race can have multiple meetups)
- One-to-many with reviews (each race can have multiple reviews)
- One-to-many with supporting series (each race can have multiple supporting series)
- One-to-many with saved itineraries (each race can have multiple saved itineraries)
- One-to-many with tips (each race can have multiple tips)
- One-to-many with trips (each race can have multiple trips)
</ai_context>
*/

import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer
} from "drizzle-orm/pg-core"
import { circuitsTable } from "./circuits-schema"

export const raceStatusEnum = pgEnum("race_status", [
  "live",
  "upcoming",
  "completed",
  "cancelled"
])

export const racesTable = pgTable("races", {
  id: uuid("id").defaultRandom().primaryKey(),
  circuitId: uuid("circuit_id")
    .references(() => circuitsTable.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  season: integer("season").notNull(),
  round: integer("round").notNull(),
  country: text("country").notNull(),
  description: text("description"),
  weekendStart: timestamp("weekend_start", { withTimezone: true }),
  weekendEnd: timestamp("weekend_end", { withTimezone: true }),
  status: raceStatusEnum("status").default("upcoming").notNull(),
  slug: text("slug"),
  isSprintWeekend: boolean("is_sprint_weekend").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertRace = typeof racesTable.$inferInsert
export type SelectRace = typeof racesTable.$inferSelect
