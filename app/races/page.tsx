"use server"

import { getAuthedUserId } from "@/lib/auth"
import { redirect } from "next/navigation"
import { HeroSection } from "@/components/races/HeroSection"
import { RaceTrail } from "@/components/races/race-trail"
import { RacesCriticalCss } from "@/components/races/races-critical-css"
import { RacesPage } from "@/components/races/RacesPage"
import { racesIndexTrail } from "@/lib/race-trail"
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
  // The calendar is in this response, not a later suspense slot. The shell
  // footer stays outside <main>, after the grid, so it is not painted above it.
  const userId = await getAuthedUserId()
  if (userId) {
    // return redirect("/login")
    const { data: profile } = await getProfileByUserIdAction(userId)
    if (!profile) {
      return redirect("/signup")
    }
  }

  const listing = await loadRacesListing()

  return (
    <>
      <RacesCriticalCss />
      <div className="flex-1 space-y-4 p-4 pt-0" data-races-listing="">
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
        <RaceTrail items={racesIndexTrail} />
        <div className="bg-background" data-races-listing-hero="">
          <HeroSection />
        </div>
        {listing}
      </div>
    </>
  )
}

async function loadRacesListing() {
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
