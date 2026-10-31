import { seriesDisplayName, type SeriesDisplayInput } from "@/lib/series"

export const RACE_PAGE_NOT_FOUND_TITLE = "Race Details | PitLane Travel"

export const RACE_PAGE_NOT_FOUND_DESCRIPTION =
  "Get comprehensive information about this race weekend, including circuit details, local attractions, and travel tips."

export const RACE_HISTORY_NOT_FOUND_TITLE = "Race History | PitLane Travel"

export const RACE_HISTORY_NOT_FOUND_DESCRIPTION =
  "Explore the history and memorable moments of this race."

export interface RacePageCopyInput {
  raceName: string
  series?: SeriesDisplayInput | null
  circuitName?: string | null
  circuitLocation?: string | null
}

export interface RacePageCopy {
  title: string
  description: string
  openGraph: {
    title: string
    description: string
  }
  /** Series label shown with the race-page heading. Null when the series is unknown. */
  seriesHeading: string | null
}

/**
 * Race-page document title, description, and Open Graph copy.
 * The title uses the race name. Series labels come from the race's series,
 * never a hardcoded "F1".
 */
export function buildRacePageMetadata(input: RacePageCopyInput): RacePageCopy {
  const title = `${input.raceName}: Race Weekend Guide`
  const seriesHeading = seriesDisplayName(input.series)
  const circuitName = input.circuitName?.trim() || "the circuit"
  const location = input.circuitLocation?.trim()
  const locationInfo = location ? ` in ${location}` : ""
  const weekendLabel = seriesHeading
    ? `${seriesHeading} weekend`
    : "race weekend"
  const description = `Plan your ${input.raceName} experience at ${circuitName}${locationInfo}. Get tickets, find flights & accommodation, and discover local attractions for an unforgettable ${weekendLabel}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description
    },
    seriesHeading
  }
}

export function buildRaceHistoryHeading(
  series: SeriesDisplayInput | null | undefined
): string {
  const seriesHeading = seriesDisplayName(series)
  if (!seriesHeading) {
    return "Explore the fascinating history and memorable moments of this race."
  }
  return `Explore the fascinating history and memorable moments of this ${seriesHeading} race.`
}

export function buildRaceHistoryDescription(input: {
  raceName: string
  series?: SeriesDisplayInput | null
  metaDescription?: string | null
}): string {
  const stored = input.metaDescription?.trim()
  if (stored) return stored
  const seriesHeading = seriesDisplayName(input.series)
  const seriesSuffix = seriesHeading ? ` (${seriesHeading})` : ""
  return `Discover the rich history, memorable moments, and fascinating facts about the ${input.raceName}${seriesSuffix}. Explore past winners, records, and iconic moments.`
}
