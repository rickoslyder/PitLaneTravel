"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { RacesPage } from "@/components/races/RacesPage"
import { getRacesAction } from "@/actions/db/races-actions"
import { getProfileByUserIdAction } from "@/actions/db/profiles-actions"
import { getPublicCoverageSummariesAction } from "@/actions/db/public-coverage-actions"
import { coverageByRaceId } from "@/lib/public-coverage"

export default async function RacesServerPage() {
  const { userId } = await auth()

  if (userId) {
    // return redirect("/login")
    const { data: profile } = await getProfileByUserIdAction(userId)
    if (!profile) {
      return redirect("/signup")
    }
  }

  const { data: races } = await getRacesAction()
  const coverageResult = await getPublicCoverageSummariesAction(
    (races ?? []).map(race => race.id)
  )
  const coverageMap = coverageResult.isSuccess
    ? coverageByRaceId(coverageResult.data)
    : {}

  return (
    <div className="flex-1 p-4 pt-0">
      <RacesPage
        initialRaces={races ?? []}
        coverageByRaceId={coverageMap}
      />
    </div>
  )
}
