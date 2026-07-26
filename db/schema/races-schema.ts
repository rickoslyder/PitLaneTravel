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
  integer,
  uniqueIndex
} from "drizzle-orm/pg-core"
import { relations, sql } from "drizzle-orm"
import { circuitsTable } from "./circuits-schema"
import { seriesTable } from "./series-schema"

export const raceStatusEnum = pgEnum("race_status", [
  "in_progress",
  "upcoming",
  "completed",
  "cancelled"
])

export const racesTable = pgTable("races", {
  id: uuid("id").defaultRandom().primaryKey(),
  circuitId: uuid("circuit_id")
    .references(() => circuitsTable.id, { onDelete: "cascade" })
    .notNull(),
  // The championship this race belongs to. Nullable during migration; backfilled to the
  // Formula 1 series and then enforced NOT NULL (see db/migrations).
  seriesId: uuid("series_id").references(() => seriesTable.id, {
    onDelete: "restrict"
  }),
  name: text("name").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  season: integer("season").notNull(),
  // Current position in the season's run calendar. Uniqueness is enforced only among
  // non-cancelled races (partial index), so a cancelled race can keep the slot it was
  // meant to occupy without blocking the race that actually runs in that position.
  round: integer("round").notNull(),
  // The originally-published round number, when it differs from `round` (e.g. a race that
  // was cancelled or shuffled mid-season). Null means the race runs in its original slot.
  plannedRound: integer("planned_round"),
  country: text("country").notNull(),
  description: text("description"),
  // Populated when status is "cancelled": why the race is not taking place.
  cancellationReason: text("cancellation_reason"),
  weekendStart: timestamp("weekend_start", { withTimezone: true }),
  weekendEnd: timestamp("weekend_end", { withTimezone: true }),
  status: raceStatusEnum("status").default("upcoming").notNull(),
  slug: text("slug"),
  isSprintWeekend: boolean("is_sprint_weekend").default(false).notNull(),
  // OpenF1 integration fields
  openf1MeetingKey: integer("openf1_meeting_key").unique(),
  openf1SessionKey: integer("openf1_session_key").unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
}, table => ({
  // A season's round numbers are unique among races that actually run; cancelled races
  // are excluded so they can keep the slot they were meant to occupy. Declared here (not
  // only in the SQL migration) so `drizzle-kit push` treats it as intentional.
  seriesSeasonRoundActiveIdx: uniqueIndex("races_series_season_round_active_idx")
    .on(table.seriesId, table.season, table.round)
    .where(sql`${table.status} <> 'cancelled'`)
}))

export const racesRelations = relations(racesTable, ({ one }) => ({
  circuit: one(circuitsTable, {
    fields: [racesTable.circuitId],
    references: [circuitsTable.id]
  }),
  series: one(seriesTable, {
    fields: [racesTable.seriesId],
    references: [seriesTable.id]
  })
}))

export type InsertRace = typeof racesTable.$inferInsert
export type SelectRace = typeof racesTable.$inferSelect
