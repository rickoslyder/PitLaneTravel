/*
<ai_context>
The universal fallback RaceDataProvider. All race data is entered via the admin CMS;
status is derived from the stored weekend window (upcoming → in_progress → completed)
instead of a live feed. Used by every series without an automated data source
(Formula E, MotoGP, IndyCar, WEC, ... until dedicated providers exist).
</ai_context>
*/

import { db } from "@/db/db"
import { racesTable, SelectRace } from "@/db/schema/races-schema"
import { eq } from "drizzle-orm"
import type { RaceDataProvider, RaceStatusValue } from "./types"

export class ManualProvider implements RaceDataProvider {
  readonly slug = "manual"
  readonly supportsLiveStatus = false

  /** Derive status from the race's stored time window. */
  deriveStatus(race: SelectRace, now: Date = new Date()): RaceStatusValue {
    if (race.status === "cancelled") return "cancelled"
    const start = race.weekendStart ?? race.date
    // Fall back to end-of-race-day when no weekend end is stored.
    const end =
      race.weekendEnd ?? new Date(new Date(race.date).getTime() + 24 * 60 * 60 * 1000)
    if (now < start) return "upcoming"
    if (now > end) return "completed"
    return "in_progress"
  }

  async updateRaceStatus(race: SelectRace): Promise<RaceStatusValue | null> {
    const next = this.deriveStatus(race)
    if (next !== race.status) {
      await db
        .update(racesTable)
        .set({ status: next, updatedAt: new Date() })
        .where(eq(racesTable.id, race.id))
    }
    return next
  }
}
