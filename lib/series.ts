/*
<ai_context>
Series-aware naming and slug helpers. Replaces the F1-only assumptions that were baked
into the app (hardcoded "Grand Prix" and slugs ending in a specific season year).
</ai_context>
*/

import type { SelectSeries } from "@/db/schema/series-schema"

/** A minimal series shape — accepts either a DB row or a config definition. */
export interface SeriesLike {
  name: string
  shortName: string
  slug: string
  eventNoun: string
}

/**
 * Format the display name for a single event. Prefers an explicit race name when it is
 * already a full title; otherwise composes "{Location} {eventNoun} {season}".
 *
 * F1:      "Monaco Grand Prix 2026"
 * FE:      "Berlin E-Prix 2026"
 * WEC:     "6 Hours of Spa 2026" (pass the full name through)
 */
export function formatEventName(
  series: SeriesLike | null | undefined,
  race: {
    name?: string | null
    country?: string | null
    season?: number | null
  }
): string {
  if (race.name && race.name.trim().length > 0) return race.name
  const noun = series?.eventNoun ?? "Grand Prix"
  const place = race.country ?? ""
  const year = race.season ? ` ${race.season}` : ""
  return `${place} ${noun}${year}`.trim()
}

/** Lowercase, hyphenated, ascii-safe slug fragment. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

/**
 * Series-aware race slug: "{event}-{series.slug}-{season}", e.g.
 * "monaco-grand-prix-f1-2026". Existing F1 slugs are preserved via redirects, so this
 * is only used when minting new content.
 */
export function buildRaceSlug(
  series: SeriesLike | null | undefined,
  race: {
    name?: string | null
    country?: string | null
    season?: number | null
  }
): string {
  const base = slugify(formatEventName(series, { ...race, season: undefined }))
  const seriesPart = series?.slug ? `-${series.slug}` : ""
  const seasonPart = race.season ? `-${race.season}` : ""
  return `${base}${seriesPart}${seasonPart}`
}

/**
 * Best-effort extraction of the season year from a race slug or name. Series-agnostic:
 * matches any 4-digit year 2020–2099 rather than assuming a specific season.
 */
export function extractSeasonFromSlug(slug: string): number | null {
  const match = slug.match(/20[2-9]\d/)
  return match ? Number(match[0]) : null
}

/**
 * Public series label used in race-page titles, descriptions, and headings.
 * Formula E's stored short name is "FE"; the public label is "Formula E".
 */
const SERIES_DISPLAY_NAME_BY_SLUG: Record<string, string> = {
  f1: "F1",
  "formula-e": "Formula E",
  motogp: "MotoGP",
  indycar: "IndyCar",
  wec: "WEC"
}

const SERIES_DISPLAY_NAME_BY_SHORT: Record<string, string> = {
  f1: "F1",
  fe: "Formula E",
  "formula e": "Formula E",
  motogp: "MotoGP",
  indycar: "IndyCar",
  wec: "WEC"
}

export interface SeriesDisplayInput {
  slug?: string | null
  name?: string | null
  shortName?: string | null
  short_name?: string | null
}

export function seriesDisplayName(
  series: SeriesDisplayInput | null | undefined
): string | null {
  if (!series) return null
  const slug = series.slug?.trim().toLowerCase()
  if (slug && SERIES_DISPLAY_NAME_BY_SLUG[slug]) {
    return SERIES_DISPLAY_NAME_BY_SLUG[slug]
  }
  const short = (series.shortName ?? series.short_name)?.trim().toLowerCase()
  if (short && SERIES_DISPLAY_NAME_BY_SHORT[short]) {
    return SERIES_DISPLAY_NAME_BY_SHORT[short]
  }
  const name = series.name?.trim().toLowerCase()
  if (name === "formula 1" || name === "formula one") return "F1"
  if (name === "formula e") return "Formula E"
  if (name === "motogp") return "MotoGP"
  if (name === "indycar") return "IndyCar"
  if (name === "wec" || name === "world endurance championship") return "WEC"
  return null
}

/** Convert a DB series row to the minimal SeriesLike shape. */
export function toSeriesLike(series: SelectSeries): SeriesLike {
  return {
    name: series.name,
    shortName: series.shortName,
    slug: series.slug,
    eventNoun: series.eventNoun
  }
}

/**
 * Plural of a series' event noun. Motorsport nouns don't take a naive "+s":
 * the plural of "Grand Prix" is "Grands Prix", and "E-Prix" is invariant.
 */
export function pluralizeEventNoun(eventNoun: string): string {
  const noun = eventNoun.trim()
  const lower = noun.toLowerCase()
  if (lower === "grand prix") return "Grands Prix"
  // "E-Prix", "Prix" and similar French-derived nouns are unchanged in the plural.
  if (lower.endsWith("prix")) return noun
  if (/(s|x|z|ch|sh)$/i.test(noun)) return `${noun}es`
  return `${noun}s`
}
