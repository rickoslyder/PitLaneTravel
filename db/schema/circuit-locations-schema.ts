import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  numeric
} from "drizzle-orm/pg-core"
import { circuitsTable } from "./circuits-schema"
import { relations } from "drizzle-orm"

export const locationTypeEnum = pgEnum("location_type", [
  "circuit",
  "city_center",
  "parking",
  "fan_zone",
  "transport_hub",
  "airport"
])

export const circuitLocationsTable = pgTable(
  "circuit_locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    circuitId: uuid("circuit_id")
      .references(() => circuitsTable.id, { onDelete: "cascade" })
      .notNull(),
    type: locationTypeEnum("type").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    address: text("address"),
    placeId: text("place_id"),
    latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
    longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
    distanceFromCircuit: numeric("distance_from_circuit", {
      precision: 10,
      scale: 2
    }),
    timezone: text("timezone"),
    transferTime: text("transfer_time"),
    airportCode: text("airport_code"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  table => ({
    circuitIdPlaceIdIdx: {
      name: "circuit_locations_circuit_id_place_id_key",
      unique: true,
      columns: [table.circuitId, table.placeId]
    },
    typeIdx: {
      name: "idx_circuit_locations_type",
      columns: [table.type]
    },
    airportCodeIdx: {
      name: "idx_circuit_locations_airport_code",
      columns: [table.airportCode]
    },
    circuitIdTypeIdx: {
      name: "idx_circuit_locations_circuit_id_type",
      columns: [table.circuitId, table.type]
    }
  })
)

export const circuitLocationsRelations = relations(
  circuitLocationsTable,
  ({ one }) => ({
    circuit: one(circuitsTable, {
      fields: [circuitLocationsTable.circuitId],
      references: [circuitsTable.id]
    })
  })
)

export type InsertCircuitLocation = typeof circuitLocationsTable.$inferInsert
export type SelectCircuitLocation = typeof circuitLocationsTable.$inferSelect
