import { racesTable } from "@/db/schema"
import { and, lte, notInArray, sql, type SQL } from "drizzle-orm"

/**
 * Races whose stored status can still move, and whose weekend (or race date)
 * starts before the horizon.
 *
 * The horizon must be an ISO string cast to timestamptz. drizzle-orm 0.33
 * with postgres-js 3.4.4 replaces the timestamptz serializer with an identity
 * function, so a raw `sql` fragment compared to a JS Date throws
 * ERR_INVALID_ARG_TYPE and the daily cron 500s before it updates anything.
 */
export function racesDueForStatusUpdate(startHorizon: Date): SQL {
  return and(
    notInArray(racesTable.status, ["completed", "cancelled"]),
    lte(
      sql`coalesce(${racesTable.weekendStart}, ${racesTable.date})`,
      sql`${startHorizon.toISOString()}::timestamptz`
    )
  )!
}

export function statusCronEmptyEvaluationWarning(
  evaluated: number,
  startHorizon: Date
): string | null {
  if (evaluated > 0) return null
  return `[update-sessions] staleness warning: evaluated 0 races (horizon ${startHorizon.toISOString()}). Stored statuses were not updated.`
}
