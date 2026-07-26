/*
<ai_context>
The RaceDataProvider abstraction. Each racing series is served by exactly one provider,
resolved via the registry by the series' `dataProvider` slug. Providers are
capability-flagged: a provider that cannot supply live session status simply reports
`supportsLiveStatus: false` and the callers (cron jobs, status routes) skip it.

"manual" is the universal fallback: all data comes from the admin CMS and race status is
derived from the stored weekend time window rather than a live feed.
</ai_context>
*/

import type { SelectRace } from "@/db/schema/races-schema"

export type RaceStatusValue = "upcoming" | "in_progress" | "completed" | "cancelled"

export interface RaceDataProvider {
  /** Registry slug, e.g. "openf1", "manual". Matches series.dataProvider. */
  readonly slug: string
  /** Whether this provider can report live race/session status. */
  readonly supportsLiveStatus: boolean

  /**
   * Refresh the status of a single race (and any provider-known sessions). Returns the
   * new status, or null when the provider made no determination.
   */
  updateRaceStatus(race: SelectRace): Promise<RaceStatusValue | null>
}
