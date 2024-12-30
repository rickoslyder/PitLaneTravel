"use server"

import { auth } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import { getTripAction } from "@/actions/db/trips-actions"
import { getRaceByIdAction } from "@/actions/db/races-actions"
import { getCircuitWithDetailsAction } from "@/actions/db/circuits-actions"
import { TripDetails } from "./_components/trip-details"
import { RaceWithDetails, LocalAttraction, TransportInfo } from "@/types/race"
import { SelectCircuitLocation, SelectLocalAttraction } from "@/db/schema"

interface TripPageProps {
  params: Promise<{
    id: string
  }>
}

interface FlightDetails {
  departure: string | null
  arrival: string | null
  layovers: string[]
  bookingReference: string | null
  ticketNumbers?: string[]
  baggageAllowance?: string | null
}

interface Flights {
  outbound: FlightDetails | null
  return: FlightDetails | null
}

interface Accommodation {
  name: string | null
  location: string | null
  roomType: string | null
  checkIn: string | null
  checkOut: string | null
  bookingReference: string | null
  confirmationCode: string | null
}

export default async function TripPage({ params }: TripPageProps) {
  const { id } = await params
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const tripResult = await getTripAction(id, userId)
  if (!tripResult.isSuccess) {
    return notFound()
  }

  const raceResult = await getRaceByIdAction(tripResult.data.raceId)
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
          locations: circuitResult.data.locations?.map(
            (location: SelectCircuitLocation) => ({
              id: location.id,
              circuitId: location.circuitId,
              type: location.type,
              name: location.name,
              description: location.description,
              address: location.address,
              placeId: location.placeId,
              latitude: location.latitude,
              longitude: location.longitude,
              distanceFromCircuit: location.distanceFromCircuit,
              timezone: location.timezone,
              createdAt: location.createdAt,
              updatedAt: location.updatedAt
            })
          ),
          local_attractions: circuitResult.data.local_attractions?.map(
            (attraction: SelectLocalAttraction) => ({
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
              estimated_duration: attraction.estimated_duration,
              recommended_times: attraction.recommended_times,
              booking_required: attraction.booking_required ?? false,
              price_range: attraction.price_range,
              f1_relevance: attraction.f1_relevance,
              peak_times:
                (attraction.peak_times as Record<string, any> | null) ?? null,
              created_at: attraction.createdAt.toISOString(),
              updated_at: attraction.updatedAt.toISOString()
            })
          ),
          transport_info: circuitResult.data.transport_info?.map(
            (transport: TransportInfo) => ({
              id: transport.id,
              circuit_id: transport.circuit_id,
              type: transport.type,
              name: transport.name,
              description: transport.description,
              options: transport.options,
              created_at: transport.created_at,
              updated_at: transport.updated_at
            })
          )
        }
      : undefined
  }

  // Parse JSONB fields
  const trip = {
    ...tripResult.data,
    flights: tripResult.data.flights as Flights | null,
    accommodation: tripResult.data.accommodation as Accommodation | null,
    transportationNotes: tripResult.data.transportationNotes,
    packingList: tripResult.data.packingList || [],
    customNotes: tripResult.data.customNotes as Record<string, any>
  }

  return (
    <div className="container py-8">
      <TripDetails trip={trip} race={raceWithDetails} userId={userId} />
    </div>
  )
}
