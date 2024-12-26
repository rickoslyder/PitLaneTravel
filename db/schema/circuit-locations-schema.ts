import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  numeric
} from "drizzle-orm/pg-core"
import { circuitsTable } from "./circuits-schema"

export const locationTypeEnum = pgEnum("location_type", [
  "circuit",
  "city_center",
  "parking",
  "fan_zone",
  "transport_hub"
])

export const circuitLocationsTable = pgTable("circuit_locations", {
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertCircuitLocation = typeof circuitLocationsTable.$inferInsert
export type SelectCircuitLocation = typeof circuitLocationsTable.$inferSelect
