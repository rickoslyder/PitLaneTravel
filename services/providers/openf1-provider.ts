/*
<ai_context>
RaceDataProvider adapter over the existing OpenF1 integration (Formula 1 only).
Delegates to services/openf1/RaceMapper, which reads the race's OpenF1 session key and
syncs status from the live OpenF1 feed.
</ai_context>
*/

import type { SelectRace } from "@/db/schema/races-schema"
import { RaceMapper } from "@/services/openf1/race-mapper"
import type { RaceDataProvider, RaceStatusValue } from "./types"

export class OpenF1Provider implements RaceDataProvider {
  readonly slug = "openf1"
  readonly supportsLiveStatus = true

  private mapper = new RaceMapper()

  async updateRaceStatus(race: SelectRace): Promise<RaceStatusValue | null> {
    if (!race.openf1SessionKey) return null
    const ok = await this.mapper.updateRaceStatus(race)
    // RaceMapper writes the status itself; report no separate determination on failure.
    return ok ? null : null
  }
}
