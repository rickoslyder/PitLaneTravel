"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { HeroSection } from "@/components/races/HeroSection"
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
  const [{ userId }, racesResult, ticketedRaceIds] = await Promise.all([
    auth(),
    getRacesAction(),
    listRaceIdsWithTicketListingsAction()
  ])

  const races = racesResult.data ?? []
  const coveragePromise = getPublicCoverageSummariesAction(
    races.map(race => race.id)
  )

  if (userId) {
    // return redirect("/login")
    const { data: profile } = await getProfileByUserIdAction(userId)
    if (!profile) {
      return redirect("/signup")
    }
  }

  const coverageResult = await coveragePromise
  const coverageMap = coverageResult.isSuccess
    ? coverageByRaceId(coverageResult.data)
    : {}

  return (
    <div className="flex-1 space-y-8 p-4 pt-0" data-races-listing="">
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
      <RacesPage
        initialRaces={races}
        coverageByRaceId={coverageMap}
        asOfIso={startOfUtcDay(new Date()).toISOString()}
        ticketedRaceIds={ticketedRaceIds ?? undefined}
      />
    </div>
  )
}
