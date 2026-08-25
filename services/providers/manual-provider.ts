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
import { deriveRaceStatus } from "@/lib/race-status"
import { eq } from "drizzle-orm"
import type { RaceDataProvider, RaceStatusValue } from "./types"

export class ManualProvider implements RaceDataProvider {
  readonly slug = "manual"
  readonly supportsLiveStatus = false

  /** Derive status from the race's stored time window. */
  deriveStatus(race: SelectRace, now: Date = new Date()): RaceStatusValue {
    return deriveRaceStatus(race, now)
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
