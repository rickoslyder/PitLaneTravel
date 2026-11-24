/**
 * Which photo a race card may show.
 *
 * `circuits.image_url` is Formula 1 photography of that venue. Every series
 * that shares the circuit used to inherit it, so a MotoGP or Formula E card
 * could show an F1 car. Those photos stay on F1 only.
 *
 * Licensed photos for other series are added in `RACE_SERIES_IMAGE_OVERRIDES`
 * (one event by race slug, or every season of a series at a circuit). A
 * per-race `raceImageUrl` wins over both when a caller has one. Nothing here
 * reads a new database column, so the cards work before any later migration.
 */

import { formatRaceCalendarDate } from "@/lib/race-datetime"
import { isMissingRaceImage } from "@/lib/race-image"
import { slugify } from "@/lib/series"

/** Series whose venue photo lives on `circuits.image_url`. */
export const CIRCUIT_PHOTO_SERIES_SLUG = "f1"

export type RaceSeriesImageOverride = {
  /** Public image URL. The image loader must already allow the host. */
  imageUrl: string
  /** One event. Checked before a series-and-circuit entry. */
  raceSlug?: string
  /** Championship slug, for example "motogp" or "formula-e". */
  seriesSlug?: string
  /** Circuit name. Required together with seriesSlug. */
  circuitName?: string
}

/**
 * Series-correct photos. Add a row when a licensed file is ready.
 * Leave this empty until then: non-F1 races use the designed card.
 *
 * @example
 * { raceSlug: "qatar-grand-prix-motogp-2027", imageUrl: "https://…" }
 * { seriesSlug: "formula-e", circuitName: "Circuit de Monaco", imageUrl: "https://…" }
 */
export const RACE_SERIES_IMAGE_OVERRIDES: readonly RaceSeriesImageOverride[] =
  []

export type RaceCardImageSource = {
  id?: string
  name?: string | null
  slug?: string | null
  country?: string | null
  date?: string | null
  /**
   * Optional per-race photo. Not selected from the database today.
   * When a later change passes it, it wins over the circuit photo.
   */
  raceImageUrl?: string | null
  series?: {
    slug?: string | null
    short_name?: string | null
    accent_color?: string | null
  } | null
  circuit?: {
    name?: string | null
    country?: string | null
    image_url?: string | null
    timezone_id?: string | null
  } | null
}

export type RaceCardFallback = {
  title: string
  circuitName: string | null
  series: string | null
  accentColor: string | null
  country: string | null
  dateLabel: string | null
  alt: string
}

export type RaceCardImage = {
  src: string | null
  alt: string
  fallback: RaceCardFallback
}

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function sameKey(left: string | null | undefined, right: string): boolean {
  const value = clean(left)
  if (!value) return false
  return slugify(value) === slugify(right)
}

/** True when this championship may use the shared venue photo. */
export function seriesUsesCircuitPhoto(
  series: RaceCardImageSource["series"]
): boolean {
  const slug = clean(series?.slug)?.toLowerCase()
  if (slug) return slug === CIRCUIT_PHOTO_SERIES_SLUG
  const shortName = clean(series?.short_name)?.toLowerCase()
  return shortName === CIRCUIT_PHOTO_SERIES_SLUG
}

function usableImage(src: string | null | undefined): string | null {
  const trimmed = clean(src)
  if (!trimmed || isMissingRaceImage(trimmed)) return null
  return trimmed
}

function matchingOverride(
  source: RaceCardImageSource,
  overrides: readonly RaceSeriesImageOverride[]
): string | null {
  const raceSlug = clean(source.slug)
  if (raceSlug) {
    const byRace = overrides.find(
      entry =>
        entry.raceSlug &&
        sameKey(entry.raceSlug, raceSlug) &&
        usableImage(entry.imageUrl)
    )
    if (byRace) return usableImage(byRace.imageUrl)
  }

  const seriesSlug = clean(source.series?.slug)
  const circuitName = clean(source.circuit?.name)
  if (!seriesSlug || !circuitName) return null
  const byCircuit = overrides.find(
    entry =>
      !entry.raceSlug &&
      entry.seriesSlug &&
      entry.circuitName &&
      sameKey(entry.seriesSlug, seriesSlug) &&
      sameKey(entry.circuitName, circuitName) &&
      usableImage(entry.imageUrl)
  )
  return byCircuit ? usableImage(byCircuit.imageUrl) : null
}

export function resolveRaceImage(
  source: RaceCardImageSource,
  overrides: readonly RaceSeriesImageOverride[] = RACE_SERIES_IMAGE_OVERRIDES
): string | null {
  const racePhoto = usableImage(source.raceImageUrl)
  if (racePhoto) return racePhoto
  const override = matchingOverride(source, overrides)
  if (override) return override
  if (!seriesUsesCircuitPhoto(source.series)) return null
  return usableImage(source.circuit?.image_url)
}

export function raceImageAlt(source: {
  name?: string | null
  country?: string | null
  dateLabel?: string | null
  series?: string | null
  circuitName?: string | null
}): string {
  const raceName = clean(source.name)
  const circuitName = clean(source.circuitName)
  const series = clean(source.series)
  const country = clean(source.country)
  const dateLabel = clean(source.dateLabel)
  const title = raceName || circuitName || "Race"
  const seriesAlreadyInTitle =
    series != null && title.toLowerCase().includes(series.toLowerCase())
  const headline =
    series && !seriesAlreadyInTitle ? `${series} ${title}` : title
  const at = circuitName && circuitName !== title ? ` at ${circuitName}` : ""
  const place = country ? `, ${country}` : ""
  const when = dateLabel ? `, ${dateLabel}` : ""
  return `${headline}${at}${place}${when}`
}

export function raceCardImage(
  source: RaceCardImageSource,
  overrides?: readonly RaceSeriesImageOverride[]
): RaceCardImage {
  const src = resolveRaceImage(source, overrides)
  const circuitName = clean(source.circuit?.name)
  const series = clean(source.series?.short_name)
  const country = clean(source.country) || clean(source.circuit?.country)
  const dateLabel = source.date
    ? clean(
        formatRaceCalendarDate(
          source.date,
          undefined,
          source.circuit?.timezone_id
        )
      )
    : null
  const title = clean(source.name) || circuitName || "Race"
  const alt = raceImageAlt({
    name: title,
    circuitName,
    series,
    country,
    dateLabel
  })
  return {
    src,
    alt,
    fallback: {
      title,
      circuitName: circuitName && circuitName !== title ? circuitName : null,
      series,
      accentColor: clean(source.series?.accent_color),
      country,
      dateLabel,
      alt
    }
  }
}

/** First card that can paint a series-correct photo. Designed cards are skipped. */
export function firstRaceIdWithImage(
  races: readonly RaceCardImageSource[]
): string | undefined {
  return races.find(race => race.id && resolveRaceImage(race))?.id
}
