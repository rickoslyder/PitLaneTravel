/*
<ai_context>
Provider-keyed external identifiers for races and circuits. Keeping these out of the
core tables lets multiple data providers (openf1, and future MotoGP/IndyCar/WEC/FE
sources) coexist without provider-specific columns or global unique constraints on the
core tables.

Migration path: the legacy openf1 columns on races/circuits remain for one release and
are backfilled into these tables (provider = "openf1"), then dropped.
</ai_context>
*/

import { pgTable, text, uuid, timestamp, unique } from "drizzle-orm/pg-core"
import { racesTable } from "./races-schema"
import { circuitsTable } from "./circuits-schema"

export const raceExternalIdsTable = pgTable(
  "race_external_ids",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    raceId: uuid("race_id")
      .references(() => racesTable.id, { onDelete: "cascade" })
      .notNull(),
    provider: text("provider").notNull(), // "openf1"
    // "meeting" | "session" | "event" — the kind of external key this row holds.
    kind: text("kind").notNull().default("event"),
    externalKey: text("external_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  table => ({
    uniqProviderKey: unique().on(table.provider, table.kind, table.externalKey)
  })
)

export const circuitExternalIdsTable = pgTable(
  "circuit_external_ids",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    circuitId: uuid("circuit_id")
      .references(() => circuitsTable.id, { onDelete: "cascade" })
      .notNull(),
    provider: text("provider").notNull(),
    externalKey: text("external_key").notNull(),
    // Optional human-friendly provider name (e.g. openf1 short name).
    externalName: text("external_name"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  table => ({
    uniqProviderKey: unique().on(table.provider, table.externalKey)
  })
)

export type InsertRaceExternalId = typeof raceExternalIdsTable.$inferInsert
export type SelectRaceExternalId = typeof raceExternalIdsTable.$inferSelect
export type InsertCircuitExternalId = typeof circuitExternalIdsTable.$inferInsert
export type SelectCircuitExternalId = typeof circuitExternalIdsTable.$inferSelect
