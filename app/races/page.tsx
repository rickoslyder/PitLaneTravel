"use server"

import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { HeroSection } from "@/components/races/HeroSection"
import { RacesCriticalCss } from "@/components/races/races-critical-css"
import { RacesPage } from "@/components/races/RacesPage"
import { getRacesAction } from "@/actions/db/races-actions"
import { listRaceIdsWithTicketListingsAction } from "@/actions/db/ticket-listing-actions"
import { getProfileByUserIdAction } from "@/actions/db/profiles-actions"
import { getPublicCoverageSummariesAction } from "@/actions/db/public-coverage-actions"
import { coverageByRaceId } from "@/lib/public-coverage"
import { startOfUtcDay } from "@/lib/race-calendar-window"
import { buildWebPageJsonLd, serializeJsonLd } from "@/lib/site-metadata"
import {
  metadata as racesMetadata,
  racesPageDescription,
  racesPageTitle
} from "./metadata"

// This module is "use server", so Next rejects a non-async `metadata` export.
// Race detail uses the same generateMetadata shape. The object, including the
// PR 122/125 canonical and Open Graph fields, stays in ./metadata.
export async function generateMetadata() {
  return racesMetadata
}

export default async function RacesServerPage() {
  // Profile redirect stays ahead of the shell. The race query does not:
  // the h1 is the LCP element, and it can paint before the calendar rows load.
  const { userId } = await auth()
  if (userId) {
    // return redirect("/login")
    const { data: profile } = await getProfileByUserIdAction(userId)
    if (!profile) {
      return redirect("/signup")
    }
  }

  return (
    <>
      <RacesCriticalCss />
      <div className="flex-1 space-y-4 p-4 pt-0" data-races-listing="">
        <meta name="description" content={racesPageDescription} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(
              buildWebPageJsonLd({
                name: racesPageTitle,
                description: racesPageDescription,
                pathname: "/races"
              })
            )
          }}
        />
        <div className="bg-background" data-races-listing-hero="">
          <HeroSection />
        </div>
        <Suspense fallback={null}>
          <RacesListing />
        </Suspense>
      </div>
    </>
  )
}

async function RacesListing() {
  const [racesResult, ticketedRaceIds] = await Promise.all([
    getRacesAction(),
    listRaceIdsWithTicketListingsAction()
  ])
  const races = racesResult.data ?? []
  const coverageResult = await getPublicCoverageSummariesAction(
    races.map(race => race.id)
  )
  const coverageMap = coverageResult.isSuccess
    ? coverageByRaceId(coverageResult.data)
    : {}

  return (
    <RacesPage
      initialRaces={races}
      coverageByRaceId={coverageMap}
      asOfIso={startOfUtcDay(new Date()).toISOString()}
      ticketedRaceIds={ticketedRaceIds ?? undefined}
    />
  )
}
