"use server"

import { getRaceByIdAction } from "@/actions/db/races-actions"
import { getCircuitWithDetailsAction } from "@/actions/db/circuits-actions"
import { notFound } from "next/navigation"
import { RaceDetailsPage } from "@/components/races/RaceDetailsPage"
import LocalAttractions from "@/components/races/LocalAttractions"
import { RaceWithDetails } from "@/types/race"

interface RacePageProps {
  params: {
    id: string
  }
}

export default async function RacePage({ params }: RacePageProps) {
  const raceResult = await getRaceByIdAction(params.id)
  if (!raceResult.isSuccess) {
    return notFound()
  }

  const circuitResult = await getCircuitWithDetailsAction(
    raceResult.data.circuit_id
  )
  if (!circuitResult.isSuccess) {
    return notFound()
  }

  // Convert to RaceWithDetails
  const raceWithDetails: RaceWithDetails = {
    ...raceResult.data,
    status:
      raceResult.data.status === "in_progress"
        ? "live"
        : raceResult.data.status,
    circuit: circuitResult.data
      ? {
          id: circuitResult.data.id,
          name: circuitResult.data.name,
          location: circuitResult.data.location,
          country: circuitResult.data.country,
          latitude: Number(circuitResult.data.latitude),
          longitude: Number(circuitResult.data.longitude),
          image_url: circuitResult.data.imageUrl,
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
          airports: circuitResult.data.airports?.map(airport => ({
            id: airport.id,
            circuit_id: airport.circuitId,
            code: airport.code,
            name: airport.name,
            distance: airport.distance,
            transfer_time: airport.transferTime,
            created_at: airport.createdAt.toISOString(),
            updated_at: airport.updatedAt.toISOString()
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
      : undefined
  }

  return (
    <div className="container space-y-8 py-8">
      <RaceDetailsPage race={raceWithDetails} />
      <LocalAttractions circuit={circuitResult.data} />
    </div>
  )
}
