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
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  unique,
  boolean
} from "drizzle-orm/pg-core"
import { circuitsTable } from "./circuits-schema"
import { sql } from "drizzle-orm"
import { raceStatus } from "./enums"

export const racesTable = pgTable(
  "races",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    circuitId: uuid("circuit_id")
      .references(() => circuitsTable.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    date: timestamp("date", { withTimezone: true, mode: "string" }).notNull(),
    season: integer("season").notNull(),
    round: integer("round").notNull(),
    country: text("country").notNull(),
    status: raceStatus("status").default("upcoming").notNull(),
    slug: text("slug"),
    isSprintWeekend: boolean("is_sprint_weekend").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
  },
  table => ({
    // Each round number should be unique within a season
    seasonRoundUnique: unique().on(table.season, table.round)
  })
)

export type InsertRace = typeof racesTable.$inferInsert
export type SelectRace = typeof racesTable.$inferSelect
