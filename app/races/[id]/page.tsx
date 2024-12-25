"use server"

import { RaceDetailsPage } from "@/components/races/RaceDetailsPage"
import { getRaceByIdAction } from "@/actions/db/races-actions"
import { notFound } from "next/navigation"
import { Race } from "@/types/race"

interface RaceDetailsRouteProps {
  params: {
    id: string
  }
}

export default async function RaceDetailsRoute({
  params
}: RaceDetailsRouteProps) {
  const { data: raceData } = await getRaceByIdAction(params.id)

  if (!raceData) {
    notFound()
  }

  // Convert DB race to frontend Race type
  const race: Race = {
    ...raceData,
    circuit: raceData.circuit
      ? {
          ...raceData.circuit
        }
      : undefined,
    created_at: raceData.created_at,
    updated_at: raceData.updated_at,
    date: raceData.date,
    status: raceData.status,
    slug: raceData.slug,
    is_sprint_weekend: raceData.is_sprint_weekend
  }

  return <RaceDetailsPage race={race} />
}
