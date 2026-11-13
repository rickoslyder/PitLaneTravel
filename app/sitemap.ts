import type { MetadataRoute } from "next"
import { db } from "@/db/db"
import {
  circuitsTable,
  grandstandsTable,
  raceHistoryTable,
  racesTable,
  seriesTable
} from "@/db/schema"
import { and, eq, isNotNull, ne } from "drizzle-orm"
import { listGuides } from "@/lib/guides"
import {
  isSitemapIndexableRace,
  SITEMAP_STATIC_PATHS,
  SITEMAP_STATIC_ROUTE_META,
  SITE_ORIGIN,
  staticSitemapUrl
} from "@/lib/sitemap-routes"
import { slugify } from "@/lib/series"

const BASE_URL = SITE_ORIGIN

// Read the live races table on each request. A build-time snapshot, or the
// previous daily ISR window (`revalidate = 86400`), kept a calendar import out
// of the sitemap until the next deploy or the next revalidation. force-dynamic
// picks up new rows with no code change. Finished races are still omitted.
export const dynamic = "force-dynamic"

/**
 * Sitemap from the live database. Auth-gated routes (trips, bookings, budget)
 * and cancelled races are deliberately excluded. Finished races are excluded
 * by isSitemapIndexableRace. There is no season, series, or row limit.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static paths live in lib/sitemap-routes.ts. /packages is omitted there:
  // the page stays noindex,follow until flight packages launch.
  const staticRoutes: MetadataRoute.Sitemap = SITEMAP_STATIC_PATHS.map(
    path => ({
      url: staticSitemapUrl(path),
      changeFrequency: SITEMAP_STATIC_ROUTE_META[path].changeFrequency,
      priority: SITEMAP_STATIC_ROUTE_META[path].priority
    })
  )

  const guideRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/guides`, changeFrequency: "weekly", priority: 0.7 },
    ...listGuides().map(guide => ({
      url: `${BASE_URL}/guides/${guide.slug}`,
      lastModified: guide.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6
    }))
  ]

  try {
    const [series, races, racesWithHistory, guidedCircuits] = await Promise.all(
      [
        db
          .select({ slug: seriesTable.slug })
          .from(seriesTable)
          .where(eq(seriesTable.isActive, true)),
        db
          .select({
            slug: racesTable.slug,
            updatedAt: racesTable.updatedAt,
            status: racesTable.status,
            date: racesTable.date,
            weekendEnd: racesTable.weekendEnd
          })
          .from(racesTable)
          .where(
            and(isNotNull(racesTable.slug), ne(racesTable.status, "cancelled"))
          ),
        // Only races with a history record: /races/<slug>/history 404s without one.
        db
          .selectDistinct({ slug: racesTable.slug })
          .from(raceHistoryTable)
          .innerJoin(racesTable, eq(raceHistoryTable.raceId, racesTable.id)),
        // Only circuits that actually have a guide get a page worth indexing.
        db
          .selectDistinct({ name: circuitsTable.name })
          .from(circuitsTable)
          .innerJoin(
            grandstandsTable,
            eq(grandstandsTable.circuitId, circuitsTable.id)
          )
      ]
    )

    const now = new Date()
    // Finished weekends leave the sitemap on purpose via raceHasFinished
    // (see isSitemapIndexableRace). The race-detail count falls as rounds end.
    const indexableRaces = races.filter(race =>
      isSitemapIndexableRace(
        {
          slug: race.slug,
          status: race.status,
          date: race.date,
          weekendEnd: race.weekendEnd
        },
        now
      )
    )
    const indexableSlugs = new Set(indexableRaces.map(race => race.slug))
    const finishedSlugs = new Set(
      races
        .filter(race => race.slug && !indexableSlugs.has(race.slug))
        .map(race => race.slug)
    )

    return [
      ...staticRoutes,
      ...guideRoutes,
      ...series.map(s => ({
        url: `${BASE_URL}/series/${s.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.9
      })),
      ...guidedCircuits.map(c => ({
        url: `${BASE_URL}/circuits/${slugify(c.name)}/grandstands`,
        changeFrequency: "monthly" as const,
        priority: 0.8
      })),
      ...indexableRaces.map(r => ({
        url: `${BASE_URL}/races/${r.slug}`,
        lastModified: r.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.9
      })),
      // Only races that actually have a history record — the page 404s otherwise, and a
      // sitemap full of 404s damages crawl trust.
      ...racesWithHistory
        .filter(r => r.slug && !finishedSlugs.has(r.slug))
        .map(r => ({
          url: `${BASE_URL}/races/${r.slug}/history`,
          changeFrequency: "monthly" as const,
          priority: 0.6
        }))
    ]
  } catch (error) {
    // A DB outage must not fail the build; serve the static routes at minimum.
    console.error("[sitemap] failed to load dynamic routes:", error)
    return [...staticRoutes, ...guideRoutes]
  }
}
