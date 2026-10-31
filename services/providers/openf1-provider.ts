/*
<ai_context>
RaceDataProvider adapter over the existing OpenF1 integration (Formula 1 only).
Delegates to services/openf1/RaceMapper, which reads the race's OpenF1 session key and
syncs status from the live OpenF1 feed.
</ai_context>
*/

import { db } from "@/db/db"
import { racesTable, type SelectRace } from "@/db/schema/races-schema"
import { deriveRaceStatus } from "@/lib/race-status"
import { RaceMapper } from "@/services/openf1/race-mapper"
import { eq } from "drizzle-orm"
import type { RaceDataProvider, RaceStatusValue } from "./types"

/**
 * F1 2026 rows have no OpenF1 session key, so the live feed cannot move them.
 * Fall back to the same date window the rest of the app uses. A session key
 * still goes to OpenF1; this returns null in that case.
 */
export function deriveStatusWithoutOpenF1Session(
  race: SelectRace,
  now: Date
): RaceStatusValue | null {
  if (race.openf1SessionKey != null) return null
  return deriveRaceStatus(race, now)
}

export class OpenF1Provider implements RaceDataProvider {
  readonly slug = "openf1"
  readonly supportsLiveStatus = true

  private mapper = new RaceMapper()

  async updateRaceStatus(race: SelectRace): Promise<RaceStatusValue | null> {
    const derived = deriveStatusWithoutOpenF1Session(race, new Date())
    if (derived == null) {
      await this.mapper.updateRaceStatus(race)
      // RaceMapper writes the status itself.
      return null
    }
    if (derived !== race.status) {
      await db
        .update(racesTable)
        .set({ status: derived, updatedAt: new Date() })
        .where(eq(racesTable.id, race.id))
    }
    return derived
  }
}
