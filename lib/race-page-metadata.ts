import { brand } from "@/config/brand"
import { seriesPageLabel } from "@/lib/series"
import type { Metadata } from "next"

export interface RacePageMetadataInput {
  raceName: string
  series?: {
    slug?: string | null
    name?: string | null
    shortName?: string | null
    short_name?: string | null
  } | null
  circuitName?: string | null
  location?: string | null
}

export function raceWeekendGuideTitle(
  raceName: string,
  seriesLabel: string | null
): string {
  const guide = seriesLabel
    ? `${seriesLabel} Race Weekend Guide`
    : "Race Weekend Guide"
  return `${raceName}: ${guide} | ${brand.name}`
}

export function raceWeekendGuideDescription(input: {
  raceName: string
  seriesLabel: string | null
  circuitName?: string | null
  location?: string | null
}): string {
  const circuitName = input.circuitName?.trim() || "the circuit"
  const location = input.location?.trim()
  const locationInfo = location ? ` in ${location}` : ""
  const weekend = input.seriesLabel
    ? `${input.seriesLabel} weekend`
    : "race weekend"
  return `Plan your ${input.raceName} experience at ${circuitName}${locationInfo}. Get tickets, find flights & accommodation, and discover local attractions for an unforgettable ${weekend}.`
}

export function raceHistoryIntro(seriesLabel: string | null): string {
  const subject = seriesLabel ? `this ${seriesLabel} race` : "this race"
  return `Explore the fascinating history and memorable moments of ${subject}.`
}

/** Title, description, and Open Graph copy for a single race page. */
export function buildRacePageMetadata(
  input: RacePageMetadataInput
): Pick<Metadata, "title" | "description" | "openGraph"> {
  const seriesLabel = seriesPageLabel(input.series)
  const title = raceWeekendGuideTitle(input.raceName, seriesLabel)
  const description = raceWeekendGuideDescription({
    raceName: input.raceName,
    seriesLabel,
    circuitName: input.circuitName,
    location: input.location
  })
  return {
    title,
    description,
    openGraph: {
      title,
      description
    }
  }
}
