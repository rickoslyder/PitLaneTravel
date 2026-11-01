export type RaceTiming = "upcoming" | "past"

/** UTC midnight for the calendar day that contains `now`. */
export function startOfUtcDay(now: Date): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
}

export function raceIsOnOrAfter(raceDateIso: string, asOfIso: string): boolean {
  const raceTime = new Date(raceDateIso).getTime()
  const asOfTime = new Date(asOfIso).getTime()
  if (!Number.isFinite(raceTime) || !Number.isFinite(asOfTime)) return false
  return raceTime >= asOfTime
}

/**
 * Upcoming is date >= asOf, oldest first. Past is everything before asOf,
 * newest first. `asOf` is a fixed instant from the server so SSR and the
 * browser filter the same rows.
 */
export function racesForTiming<T extends { date: string }>(
  races: readonly T[],
  timing: RaceTiming,
  asOfIso: string
): T[] {
  const ordered = [...races].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  const selected = ordered.filter(race => {
    const upcoming = raceIsOnOrAfter(race.date, asOfIso)
    return timing === "upcoming" ? upcoming : !upcoming
  })
  return timing === "past" ? selected.reverse() : selected
}
