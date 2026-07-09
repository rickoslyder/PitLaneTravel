"use server"

import { notFound } from "next/navigation"
import Link from "next/link"
import { Metadata } from "next"
import { getSeriesBySlugAction } from "@/actions/db/series-actions"
import { getRacesAction } from "@/actions/db/races-actions"
import { RaceGrid } from "@/components/races/RaceGrid"

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
  return {
    title: `${series.name} Travel & Tickets | PitLane Travel`,
    description: `Plan your ${series.name} trips: the full calendar, ${series.eventNoun} tickets, grandstand guides, flights and accommodation. ${series.description ?? ""}`.trim(),
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
  const { isSuccess, data: series } = await getSeriesBySlugAction(slug)
  if (!isSuccess || !series) return notFound()

  const { data: races } = await getRacesAction({ series: slug })
  const upcoming = (races ?? []).filter(r => r.status !== "completed")

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-8">
      <header
        className="rounded-2xl p-8 text-white"
        style={{
          background: `linear-gradient(135deg, ${series.accentColor ?? "#e10600"}, #111)`
        }}
      >
        <p className="text-sm font-medium uppercase tracking-wide opacity-80">
          {series.seasonLabel ?? series.governingBody}
        </p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
          {series.name} Travel
        </h1>
        {series.description && (
          <p className="mt-3 max-w-2xl text-white/90">{series.description}</p>
        )}
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Upcoming {series.eventNoun}s</h2>
          <Link href="/races" className="text-sm text-primary hover:underline">
            View full calendar →
          </Link>
        </div>

        {upcoming.length > 0 ? (
          <RaceGrid races={upcoming} viewType="grid" />
        ) : (
          <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
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
