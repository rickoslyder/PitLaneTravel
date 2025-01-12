"use server"

import { auth } from "@clerk/nextjs/server"
import {
  getRaceByIdAction,
  getRaceBySlugAction
} from "@/actions/db/races-actions"
import { getRaceHistoryAction } from "@/actions/db/race-history-actions"
import { notFound } from "next/navigation"
import { RaceHistoryPage } from "@/components/races/RaceHistoryPage"
import { Metadata } from "next"

interface RaceHistoryPageProps {
  params: Promise<{
    id: string
  }>
}

// Helper function to reduce code duplication
async function getRaceData(id: string) {
  // If identifier ends in 2025, try slug first
  let raceResult
  if (id.endsWith("2025")) {
    raceResult = await getRaceBySlugAction(id)
    if (!raceResult.isSuccess) {
      raceResult = await getRaceByIdAction(id)
    }
  } else {
    // For other cases, try ID first
    raceResult = await getRaceByIdAction(id)
    if (!raceResult.isSuccess) {
      raceResult = await getRaceBySlugAction(id)
    }
  }

  if (!raceResult.isSuccess) {
    return null
  }

  const historyResult = await getRaceHistoryAction(raceResult.data.id)
  if (!historyResult.isSuccess) {
    return null
  }

  return {
    race: raceResult.data,
    history: historyResult.data
  }
}

export async function generateMetadata({
  params
}: RaceHistoryPageProps): Promise<Metadata> {
  const { id } = await params
  const data = await getRaceData(id)

  if (!data) {
    return {
      title: "Race History | PitLane Travel",
      description:
        "Explore the history and memorable moments of this Formula 1 race"
    }
  }

  return {
    title:
      data.history.metaTitle || `${data.race.name} History | PitLane Travel`,
    description:
      data.history.metaDescription ||
      `Discover the rich history, memorable moments, and fascinating facts about the ${data.race.name}. Explore past winners, records, and iconic moments.`
  }
}

export default async function RaceHistoryRoute({
  params
}: RaceHistoryPageProps) {
  const { id } = await params
  const { userId } = await auth()

  const data = await getRaceData(id)
  if (!data) {
    return notFound()
  }

  return (
    <div className="container py-8">
      <RaceHistoryPage race={data.race} history={data.history} />
    </div>
  )
}
