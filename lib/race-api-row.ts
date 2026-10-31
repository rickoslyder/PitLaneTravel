/** Keep the series slug on a race row returned by GET /api/races. */
export function raceRowWithSeries<T extends object>(
  race: T,
  seriesSlug: string | null | undefined
): T & { series: { slug: string } | null } {
  const slug = seriesSlug?.trim()
  return {
    ...race,
    series: slug ? { slug } : null
  }
}
