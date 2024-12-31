"use server"

import { auth } from "@clerk/nextjs/server"
import { getRaceByIdAction } from "@/actions/db/races-actions"
import { getCircuitWithDetailsAction } from "@/actions/db/circuits-actions"
import { getUserTripForRaceAction } from "@/actions/db/trips-actions"
import { notFound } from "next/navigation"
import { RaceDetailsPage } from "@/components/races/RaceDetailsPage"
import LocalAttractions from "@/components/races/LocalAttractions"
import { RaceWithDetails } from "@/types/race"

interface RacePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function RacePage({ params }: RacePageProps) {
  const resolvedParams = await params
  const { userId } = await auth()

  const raceResult = await getRaceByIdAction(resolvedParams.id)
  if (!raceResult.isSuccess) {
    return notFound()
  }

  const circuitResult = await getCircuitWithDetailsAction(
    raceResult.data.circuit_id
  )
  if (!circuitResult.isSuccess) {
    return notFound()
  }

  // Get user's existing trip for this race if they're logged in
  let existingTripId: string | undefined
  if (userId) {
    const tripResult = await getUserTripForRaceAction(userId, resolvedParams.id)
    if (tripResult.isSuccess && tripResult.data) {
      existingTripId = tripResult.data.id
    }
  }

  // Convert to RaceWithDetails
  const raceWithDetails: RaceWithDetails = {
    ...raceResult.data,
    status: raceResult.data.status,
    circuit: circuitResult.data
      ? {
          id: circuitResult.data.id,
          name: circuitResult.data.name,
          location: circuitResult.data.location,
          country: circuitResult.data.country,
          latitude: Number(circuitResult.data.latitude),
          longitude: Number(circuitResult.data.longitude),
          image_url: circuitResult.data.imageUrl,
          openf1_key: circuitResult.data.openf1Key,
          openf1_short_name: circuitResult.data.openf1ShortName,
          timezone_id: circuitResult.data.timezoneId,
          timezone_name: circuitResult.data.timezoneName,
          created_at: circuitResult.data.createdAt.toISOString(),
          updated_at: circuitResult.data.updatedAt.toISOString(),
          details: circuitResult.data.details
            ? {
                id: circuitResult.data.details.id,
                circuit_id: circuitResult.data.details.circuitId,
                length: Number(circuitResult.data.details.length),
                corners: circuitResult.data.details.corners,
                drs_zones: circuitResult.data.details.drsZones,
                lap_record_time: circuitResult.data.details.lapRecordTime,
                lap_record_year: circuitResult.data.details.lapRecordYear,
                lap_record_driver: circuitResult.data.details.lapRecordDriver,
                created_at: circuitResult.data.details.createdAt.toISOString(),
                updated_at: circuitResult.data.details.updatedAt.toISOString()
              }
            : undefined,
          locations: circuitResult.data.locations?.map(location => ({
            ...location,
            created_at: location.createdAt.toISOString(),
            updated_at: location.updatedAt.toISOString()
          })),
          local_attractions: circuitResult.data.local_attractions?.map(
            attraction => ({
              id: attraction.id,
              circuit_id: attraction.circuitId,
              name: attraction.name,
              description: attraction.description,
              latitude: attraction.latitude
                ? Number(attraction.latitude)
                : null,
              longitude: attraction.longitude
                ? Number(attraction.longitude)
                : null,
              distance_from_circuit: attraction.distance_from_circuit
                ? Number(attraction.distance_from_circuit)
                : null,
              distance_from_city: attraction.distance_from_city
                ? Number(attraction.distance_from_city)
                : null,
              estimated_duration: attraction.estimated_duration || null,
              recommended_times: attraction.recommended_times || null,
              booking_required: attraction.booking_required || false,
              price_range: attraction.price_range || null,
              f1_relevance: attraction.f1_relevance || null,
              peak_times: attraction.peak_times || null,
              created_at: attraction.createdAt.toISOString(),
              updated_at: attraction.updatedAt.toISOString()
            })
          ),
          transport_info: circuitResult.data.transport_info?.map(info => ({
            id: info.id,
            circuit_id: info.circuitId,
            type: info.type,
            name: info.name,
            description: info.description,
            options: info.options,
            created_at: info.createdAt.toISOString(),
            updated_at: info.updatedAt.toISOString()
          }))
        }
      : null
  }

  return (
    <div className="container space-y-8 py-8">
      <RaceDetailsPage
        race={raceWithDetails}
        userId={userId}
        existingTripId={existingTripId}
      />
      <LocalAttractions circuit={circuitResult.data} />
    </div>
  )
}
