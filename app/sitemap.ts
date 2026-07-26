import type { MetadataRoute } from "next"
import { db } from "@/db/db"
import { racesTable, seriesTable } from "@/db/schema"
import { eq, isNotNull, and, ne } from "drizzle-orm"

const BASE_URL = "https://www.pitlanetravel.com"

/**
 * Sitemap generated from the database at build time, so new races and championships
 * appear without anyone remembering to re-run a script. Auth-gated routes (trips,
 * bookings, budget) and cancelled races are deliberately excluded.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/races`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/races/map`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/races/compare`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/circuits/grandstands`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/flights`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/hotels`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/transport`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/packages`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/help`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/pricing`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 }
  ]

  try {
    const [series, races] = await Promise.all([
      db
        .select({ slug: seriesTable.slug })
        .from(seriesTable)
        .where(eq(seriesTable.isActive, true)),
      db
        .select({ slug: racesTable.slug, updatedAt: racesTable.updatedAt })
        .from(racesTable)
        .where(
          and(isNotNull(racesTable.slug), ne(racesTable.status, "cancelled"))
        )
    ])

    return [
      ...staticRoutes,
      ...series.map(s => ({
        url: `${BASE_URL}/series/${s.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.9
      })),
      ...races.flatMap(r => [
        {
          url: `${BASE_URL}/races/${r.slug}`,
          lastModified: r.updatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.9
        },
        {
          url: `${BASE_URL}/races/${r.slug}/history`,
          changeFrequency: "monthly" as const,
          priority: 0.6
        }
      ])
    ]
  } catch (error) {
    // A DB outage must not fail the build; serve the static routes at minimum.
    console.error("[sitemap] failed to load dynamic routes:", error)
    return staticRoutes
  }
}
