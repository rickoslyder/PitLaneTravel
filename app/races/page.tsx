"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { HeroSection } from "@/components/races/HeroSection"
import { RacesPage } from "@/components/races/RacesPage"
import { getRacesAction } from "@/actions/db/races-actions"
import { getProfileByUserIdAction } from "@/actions/db/profiles-actions"
import { getPublicCoverageSummariesAction } from "@/actions/db/public-coverage-actions"
import { coverageByRaceId } from "@/lib/public-coverage"
import { startOfUtcDay } from "@/lib/race-calendar-window"
import { buildWebPageJsonLd, serializeJsonLd } from "@/lib/site-metadata"
import { racesPageDescription, racesPageTitle } from "./metadata"

export default async function RacesServerPage() {
  const [{ userId }, racesResult] = await Promise.all([
    auth(),
    getRacesAction()
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
    <div className="flex-1 space-y-8 p-4 pt-0">
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
      <div className="bg-background">
        <HeroSection />
      </div>
      <RacesPage
        initialRaces={races}
        coverageByRaceId={coverageMap}
        asOfIso={startOfUtcDay(new Date()).toISOString()}
      />
    </div>
  )
}
