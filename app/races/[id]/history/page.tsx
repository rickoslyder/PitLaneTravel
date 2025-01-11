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

export async function generateMetadata({
  params
}: RaceHistoryPageProps): Promise<Metadata> {
  const { id } = await params

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
    return {
      title: "Race History",
      description: "History of the race"
    }
  }

  const raceHistoryResult = await getRaceHistoryAction(raceResult.data.id)
  if (!raceHistoryResult.isSuccess) {
    return {
      title: "Race History",
      description: "History of the race"
    }
  }

  return {
    title: raceHistoryResult.data.metaTitle || "Race History",
    description: raceHistoryResult.data.metaDescription || "History of the race"
  }
}

export default async function RaceHistoryRoute({
  params
}: RaceHistoryPageProps) {
  const { id } = await params
  const { userId } = await auth()

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
    return notFound()
  }

  const historyResult = await getRaceHistoryAction(raceResult.data.id)
  if (!historyResult.isSuccess) {
    return notFound()
  }

  return (
    <div className="container py-8">
      <RaceHistoryPage race={raceResult.data} history={historyResult.data} />
    </div>
  )
}
