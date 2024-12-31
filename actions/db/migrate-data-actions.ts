"use server"

import { db } from "@/db/db"
import { circuitsTable } from "@/db/schema/circuits-schema"
import { racesTable } from "@/db/schema/races-schema"
import { savedItinerariesTable } from "@/db/schema/saved-itineraries-schema"
import { ticketsTable } from "@/db/schema/tickets-schema"
import { ticketPricingTable } from "@/db/schema/ticket-pricing-schema"
import { airportsTable } from "@/db/schema/airports-schema"
import { circuitDetailsTable } from "@/db/schema/circuit-details-schema"
import { podiumResultsTable } from "@/db/schema/podium-results-schema"
import { localAttractionsTable } from "@/db/schema/local-attractions-schema"
import { supportingSeriesTable } from "@/db/schema/supporting-series-schema"
import { activitiesTable } from "@/db/schema/activities-schema"
import { ActionState } from "@/types"
import { sql } from "drizzle-orm"

export interface DatabaseDump {
  races: Array<{
    id: number
    circuit: string
    name: string
    date: string
    city?: string
    country: string
    latitude: string
    longitude: string
    description?: string
    image_url?: string
    transport_info?: {
      mrt?: string
      taxi?: string
    }
    weather_info?: {
      humidity?: string
      rainfall?: string
      averageTemp?: string
    }
    nearest_airports?: Array<{
      code: string
      name: string
      distance: string
      transferTime: string
    }>
    circuit_info?: {
      length: number
      corners: number
      drsZones: number
      lapRecord?: {
        time: string
        year: number
        driver: string
      }
    }
    last_year_podium?: Array<{
      team: string
      driver: string
      position: number
    }>
    track_map_url?: string
    status?: string
    slug?: string
    local_attractions?: Array<{
      name: string
      description: string
    }>
    availability?: string
    price?: number
    season?: string
    supporting_series?: Array<{
      round: number
      series: string
    }>
    is_sprint_weekend?: boolean
    weekend_start?: string
    weekend_end?: string
  }>
  saved_itineraries: Array<{
    id: number
    user_id: string
    race_id: string
    name: string
    activities: Array<{
      id: number
  name: string
      type: string
      price?: {
        amount: number
        currency: string
      }
      rating?: number
      category?: string
      distance?: string
      duration?: string
      location?: {
        lat: number
        lng: number
      }
      timeSlot?: string
      description?: string
      visitDuration?: string
    }>
  date: string
    share_token: string | null
  }>
  tickets: Array<{
    id: number
    race_id: string
    title?: string
    description?: string
    ticket_type?: string
    availability?: "available" | "sold_out" | "low_stock" | "pending"
    days_included?: {
      thursday?: boolean
      friday?: boolean
      saturday?: boolean
      sunday?: boolean
    }
    is_child_ticket?: boolean
    reseller_url?: string
    price?: string
  }>
}

const databaseDump: DatabaseDump = require("../../database_dump.json")

export async function migrateDataAction(): Promise<ActionState<void>> {
  try {
    // Start a transaction
    return await db.transaction(async (tx) => {
      // 1. First migrate circuits from races data
      const uniqueCircuits = new Map()
      databaseDump.races.forEach((race) => {
        uniqueCircuits.set(race.circuit, {
          name: race.circuit,
          location: race.city || race.circuit,
          country: race.country,
          latitude: sql`${race.latitude}::numeric`,
          longitude: sql`${race.longitude}::numeric`
        })
      })

      // Insert circuits
      const circuitInserts = []
      for (const [circuitName, circuit] of uniqueCircuits.entries()) {
        const [insertedCircuit] = await tx
          .insert(circuitsTable)
          .values(circuit)
          .returning()
        
        circuitInserts.push(insertedCircuit)

        // Find the race data for this circuit to get the related info
        const raceWithCircuitInfo = databaseDump.races.find(r => r.circuit === circuitName)
        if (raceWithCircuitInfo) {
          // Insert nearest airports
          if (raceWithCircuitInfo.nearest_airports) {
            for (const airport of raceWithCircuitInfo.nearest_airports) {
              await tx.insert(airportsTable).values({
                circuitId: insertedCircuit.id,
                code: airport.code,
                name: airport.name,
                distance: sql`${airport.distance}::decimal`,
                transferTime: airport.transferTime,
                // Use circuit's coordinates as a fallback since we don't have airport coordinates
                latitude: sql`${raceWithCircuitInfo.latitude}::decimal`,
                longitude: sql`${raceWithCircuitInfo.longitude}::decimal`
              })
            }
          }

          // Insert circuit details
          if (raceWithCircuitInfo.circuit_info) {
            await tx.insert(circuitDetailsTable).values({
              circuitId: insertedCircuit.id,
              length: sql`${raceWithCircuitInfo.circuit_info.length}::decimal`,
              corners: raceWithCircuitInfo.circuit_info.corners,
              drsZones: raceWithCircuitInfo.circuit_info.drsZones,
              lapRecordTime: raceWithCircuitInfo.circuit_info.lapRecord?.time,
              lapRecordYear: raceWithCircuitInfo.circuit_info.lapRecord?.year,
              lapRecordDriver: raceWithCircuitInfo.circuit_info.lapRecord?.driver
            })
          }

          // Insert last year's podium results
          if (raceWithCircuitInfo.last_year_podium) {
            for (const result of raceWithCircuitInfo.last_year_podium) {
              await tx.insert(podiumResultsTable).values({
                circuitId: insertedCircuit.id,
                position: result.position,
                driver: result.driver,
                team: result.team,
                year: new Date().getFullYear() - 1 // Last year
              })
            }
          }

          // Insert local attractions
          if (raceWithCircuitInfo.local_attractions) {
            for (const attraction of raceWithCircuitInfo.local_attractions) {
              await tx.insert(localAttractionsTable).values({
                circuitId: insertedCircuit.id,
                name: attraction.name,
                description: attraction.description
              })
            }
          }
        }
      }

      // Create circuit ID mapping
      const circuitIdMap = new Map(
        circuitInserts.map((c) => [c.name, c.id])
      )

      // 2. Migrate races
      const raceInserts = []
      const raceIdMap = new Map() // Map old ID to new UUID
      for (const race of databaseDump.races) {
        const circuitId = circuitIdMap.get(race.circuit)
        if (!circuitId) {
          throw new Error(`Circuit ID not found for ${race.circuit}`)
        }

        // Extract season and round from race data
        const season = new Date(race.date).getFullYear()
        // For simplicity, using the race ID as the round number
        const round = race.id

        const [insertedRace] = await tx.insert(racesTable).values({
          circuitId,
          name: race.name,
          date: new Date(race.date),
          season,
          round: sql`${round}::integer`,
          country: race.country,
          status: race.status as "in_progress" | "upcoming" | "completed" | "cancelled",
          slug: race.slug || null,
          isSprintWeekend: race.is_sprint_weekend || false
        }).returning()
        
        raceInserts.push(insertedRace)
        raceIdMap.set(race.id, insertedRace.id)

        // Insert supporting series
        if (race.supporting_series) {
          for (const series of race.supporting_series) {
            await tx.insert(supportingSeriesTable).values({
              raceId: insertedRace.id,
              series: series.series,
              round: series.round
            })
          }
        }
      }

      // 3. Migrate saved itineraries
      for (const itinerary of databaseDump.saved_itineraries) {
        const raceId = raceIdMap.get(parseInt(itinerary.race_id))
        if (!raceId) {
          throw new Error(`Race ID not found for itinerary ${itinerary.id} (race_id: ${itinerary.race_id})`)
        }

        // Insert itinerary
        const [insertedItinerary] = await tx.insert(savedItinerariesTable).values({
          userId: itinerary.user_id,
          name: itinerary.name,
          description: `Itinerary for ${itinerary.name}`,
          raceId: raceId,
          itinerary: itinerary.activities
        }).returning()

        // Insert activities
        for (const activity of itinerary.activities) {
          await tx.insert(activitiesTable).values({
            itineraryId: insertedItinerary.id,
            name: activity.name,
            type: activity.type,
            priceAmount: activity.price?.amount ? sql`${activity.price.amount}::decimal` : null,
            priceCurrency: activity.price?.currency,
            rating: activity.rating ? sql`${activity.rating}::decimal` : null,
            category: activity.category,
            distance: activity.distance,
            duration: activity.duration,
            locationLat: activity.location?.lat ? sql`${activity.location.lat}::decimal` : null,
            locationLng: activity.location?.lng ? sql`${activity.location.lng}::decimal` : null,
            timeSlot: activity.timeSlot,
            description: activity.description,
            visitDuration: activity.visitDuration
          })
        }
      }

      // 4. Migrate tickets and related data
      for (const ticket of databaseDump.tickets) {
        const raceId = raceIdMap.get(parseInt(ticket.race_id))
        if (!raceId) {
          throw new Error(`Race ID not found for ticket ${ticket.id} (race_id: ${ticket.race_id})`)
        }

        // Insert ticket
        const [insertedTicket] = await tx.insert(ticketsTable).values({
          raceId,
          title: ticket.title || "General Admission",
          description: ticket.description || "Standard ticket",
          ticketType: ticket.ticket_type || "general",
          availability: ticket.availability || "available",
          daysIncluded: {
            thursday: false,
            friday: true,
            saturday: true,
            sunday: true,
            ...ticket.days_included
          },
          isChildTicket: ticket.is_child_ticket || false,
          resellerUrl: ticket.reseller_url || ""
        }).returning()

        // Insert ticket pricing if available
        if (ticket.price) {
          await tx.insert(ticketPricingTable).values({
            ticketId: insertedTicket.id,
            price: sql`${ticket.price}::numeric`,
            currency: "USD",
            validFrom: new Date()
          })
        }
    }

    return {
      isSuccess: true,
      message: "Data migration completed successfully",
      data: undefined
    }
    })
  } catch (error: any) {
    console.error("Migration error:", error)
    return {
      isSuccess: false,
      message: `Migration failed: ${error.message}`,
      data: undefined
    }
  }
} 