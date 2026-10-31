"use server"

import { notFound } from "next/navigation"
import Link from "next/link"
import { Metadata } from "next"
import { getSeriesBySlugAction } from "@/actions/db/series-actions"
import { pluralizeEventNoun } from "@/lib/series"
import { getRacesAction } from "@/actions/db/races-actions"
import { isActiveRaceStatus } from "@/lib/race-status"
import { RaceGrid } from "@/components/races/RaceGrid"
import { getPublicCoverageSummariesAction } from "@/actions/db/public-coverage-actions"
import { coverageByRaceId } from "@/lib/public-coverage"
import { withFormulaELondonVenueNote } from "@/config/formula-e-london"
import { SeriesBadge } from "@/components/series/series-badge"

interface SeriesPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params
}: SeriesPageProps): Promise<Metadata> {
  const { slug } = await params
  const { isSuccess, data: series } = await getSeriesBySlugAction(slug)
  if (!isSuccess || !series) {
    return { title: "Series | PitLane Travel" }
  }
  const description = withFormulaELondonVenueNote(slug, series.description)

  return {
    title: `${series.name} Travel & Tickets | PitLane Travel`,
    description:
      `Plan your ${series.name} trips: the full calendar, ${series.eventNoun} tickets, grandstand guides, flights and accommodation. ${description}`.trim(),
    keywords: [
      `${series.name} travel`,
      `${series.name} tickets`,
      `${series.shortName} calendar`,
      `${series.name} grandstands`
    ]
  }
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { slug } = await params
  const { isSuccess, data: series, message } = await getSeriesBySlugAction(slug)

  // Distinguish "no such series" from "the database is down": returning 404 during an
  // outage tells search engines the page is gone and gets it deindexed.
  if (!isSuccess && message !== "Series not found") {
    throw new Error(`Failed to load series "${slug}": ${message}`)
  }
  // A deactivated championship must not keep serving a public page.
  if (!series || !series.isActive) return notFound()

  const seriesDescription = withFormulaELondonVenueNote(
    series.slug,
    series.description
  )

  const { data: races } = await getRacesAction({
    series: slug,
    excludeCancelled: true
  })
  const upcoming = (races ?? []).filter(r => isActiveRaceStatus(r.status))
  const coverageResult = await getPublicCoverageSummariesAction(
    upcoming.map(race => race.id)
  )
  const coverageMap = coverageResult.isSuccess
    ? coverageByRaceId(coverageResult.data)
    : {}

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-8">
      <header className="border-border bg-card rounded-2xl border p-8">
        <div className="flex flex-wrap items-center gap-3">
          <SeriesBadge
            label={series.shortName}
            accentColor={series.accentColor}
          />
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
            {series.seasonLabel ?? series.governingBody}
          </p>
        </div>
        <h1 className="text-foreground mt-3 text-3xl font-bold sm:text-4xl">
          {series.name} Travel
        </h1>
        {seriesDescription && (
          <p className="text-muted-foreground mt-3 max-w-2xl">
            {seriesDescription}
          </p>
        )}
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Upcoming {pluralizeEventNoun(series.eventNoun)}
          </h2>
          <Link href="/races" className="text-primary text-sm hover:underline">
            View full calendar →
          </Link>
        </div>

        {upcoming.length > 0 ? (
          <RaceGrid
            races={upcoming}
            viewType="grid"
            coverageByRaceId={coverageMap}
          />
        ) : (
          <div className="text-muted-foreground rounded-lg border border-dashed p-10 text-center">
            The {series.name} calendar is being finalised. Check back soon or
            browse the{" "}
            <Link href="/races" className="text-primary hover:underline">
              full race calendar
            </Link>
            .
          </div>
        )}
      </section>
    </div>
  )
}
