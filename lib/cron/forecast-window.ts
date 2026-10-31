/**
 * Inclusive forecast window for one race, expanded by one UTC day on each side.
 *
 * 2026 catalogue rows have a race date and circuit coordinates but null
 * weekend bounds. Skipping those rows made the weather cron a no-op after the
 * last 2025 weekend that still had bounds stored.
 */
export function forecastBounds(race: {
  date: Date | string
  weekendStart: Date | string | null
  weekendEnd: Date | string | null
}): { startDate: Date; endDate: Date } {
  const startDate = new Date(race.weekendStart ?? race.date)
  const endDate = new Date(race.weekendEnd ?? race.date)
  startDate.setUTCDate(startDate.getUTCDate() - 1)
  endDate.setUTCDate(endDate.getUTCDate() + 1)
  if (endDate < startDate) {
    return { startDate: endDate, endDate: startDate }
  }
  return { startDate, endDate }
}
