import { raceHasFinished, type FinishedRaceInput } from "@/lib/finished-race"
import { SITE_ORIGIN } from "@/lib/site-metadata"

export { SITE_ORIGIN }

/**
 * Indexable static paths.
 *
 * /packages is intentionally absent. Flight packages stay unlisted before
 * launch, and app/packages/page.tsx is noindex,follow. Listing the URL here
 * would ask crawlers to index a page we told them not to index.
 */
export const SITEMAP_STATIC_PATHS = [
  "/",
  "/races",
  "/races/map",
  "/races/compare",
  "/circuits/grandstands",
  "/flights",
  "/hotels",
  "/transport",
  "/about",
  "/faq",
  "/contact",
  "/help",
  "/cancellation",
  "/privacy",
  "/terms"
] as const

export type SitemapStaticPath = (typeof SITEMAP_STATIC_PATHS)[number]

type StaticRouteMeta = {
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly"
  priority: number
}

export const SITEMAP_STATIC_ROUTE_META: Record<
  SitemapStaticPath,
  StaticRouteMeta
> = {
  "/": { changeFrequency: "daily", priority: 1 },
  "/races": { changeFrequency: "daily", priority: 1 },
  "/races/map": { changeFrequency: "weekly", priority: 0.9 },
  "/races/compare": { changeFrequency: "weekly", priority: 0.8 },
  "/circuits/grandstands": { changeFrequency: "weekly", priority: 0.9 },
  "/flights": { changeFrequency: "daily", priority: 0.8 },
  "/hotels": { changeFrequency: "weekly", priority: 0.7 },
  "/transport": { changeFrequency: "weekly", priority: 0.7 },
  "/about": { changeFrequency: "monthly", priority: 0.6 },
  "/faq": { changeFrequency: "monthly", priority: 0.6 },
  "/contact": { changeFrequency: "monthly", priority: 0.5 },
  "/help": { changeFrequency: "monthly", priority: 0.5 },
  "/cancellation": { changeFrequency: "yearly", priority: 0.3 },
  "/privacy": { changeFrequency: "yearly", priority: 0.3 },
  "/terms": { changeFrequency: "yearly", priority: 0.3 }
}

export function staticSitemapUrl(path: SitemapStaticPath): string {
  return path === "/" ? SITE_ORIGIN : `${SITE_ORIGIN}${path}`
}

/**
 * A race detail URL belongs in the sitemap when it has a slug, is not
 * cancelled, and has not finished. Finished weekends drop off on purpose:
 * raceHasFinished treats status "completed", a past weekend end, or a missing
 * weekend end plus 24 hours after the race date as finished. The race-detail
 * count falls as rounds end. That is this filter, not a missing URL.
 */
export function isSitemapIndexableRace(
  race: { slug: string | null } & FinishedRaceInput,
  now: Date
): boolean {
  if (!race.slug) return false
  if (race.status === "cancelled") return false
  return !raceHasFinished(race, now)
}
