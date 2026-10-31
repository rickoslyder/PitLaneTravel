import { circuitsTable, racesTable } from "@/db/schema"
import { eq, gt, sql } from "drizzle-orm"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import type * as schema from "@/db/schema"

type UpcomingRaceQuery = Pick<PostgresJsDatabase<typeof schema>, "select">

export function selectUpcomingRaces(database: UpcomingRaceQuery, now: Date) {
  return database
    .select({
      id: racesTable.id,
      name: racesTable.name,
      date: racesTable.date,
      weekendStart: racesTable.weekendStart,
      weekendEnd: racesTable.weekendEnd,
      circuit: {
        latitude: sql<number>`CAST(${circuitsTable.latitude} AS float)`,
        longitude: sql<number>`CAST(${circuitsTable.longitude} AS float)`
      }
    })
    .from(racesTable)
    .innerJoin(circuitsTable, eq(racesTable.circuitId, circuitsTable.id))
    .where(gt(racesTable.date, now))
}
