import { db } from "@/db/db"
import { NextResponse } from "next/server"
import {
  getWeatherForRaceAction,
  shouldUpdateWeatherAction,
  storeRaceWeatherAction
} from "@/actions/db/race-weather-actions"
import { verifyCronRequest } from "@/lib/cron"
import { forecastBounds } from "@/lib/cron/forecast-window"
import { selectUpcomingRaces } from "@/lib/cron/upcoming-races"

interface RaceWithCircuit {
  id: string
  name: string
  date: Date
  weekendStart: Date | null
  weekendEnd: Date | null
  circuit: {
    latitude: number
    longitude: number
  } | null
}

export const maxDuration = 60

export async function GET(req: Request) {
  const denied = verifyCronRequest(req)
  if (denied) return denied

  try {
    // Get all upcoming races
    const races = await selectUpcomingRaces(db, new Date())

    const updates = await Promise.all(
      races.map(async (race: RaceWithCircuit) => {
        if (!race.circuit?.latitude || !race.circuit?.longitude) {
          return {
            raceId: race.id,
            status: "skipped",
            reason: "Missing circuit coordinates"
          }
        }

        // Check if we need to update this race's weather
        const { isSuccess, data: needsUpdate } =
          await shouldUpdateWeatherAction(race.id, new Date(race.date))

        if (!isSuccess || !needsUpdate) {
          return {
            raceId: race.id,
            status: "skipped",
            reason: "No update needed"
          }
        }

        const { startDate, endDate } = forecastBounds(race)

        const updates = []

        // Fetch and store weather data for both unit systems
        for (const unitGroup of ["us", "metric"] as const) {
          // Fetch new weather data
          const weatherResponse = await getWeatherForRaceAction(
            race.id,
            race.circuit.latitude,
            race.circuit.longitude,
            startDate,
            endDate,
            unitGroup
          )

          if (!weatherResponse.isSuccess) {
            updates.push({
              unitGroup,
              status: "error",
              reason: "Failed to fetch weather data"
            })
            continue
          }

          // Store the weather data
          const storeResponse = await storeRaceWeatherAction(
            race.id,
            weatherResponse.data.days,
            unitGroup
          )

          if (!storeResponse.isSuccess) {
            updates.push({
              unitGroup,
              status: "error",
              reason: "Failed to store weather data"
            })
            continue
          }

          updates.push({
            unitGroup,
            status: "success",
            reason: "Weather data updated successfully"
          })
        }

        return {
          raceId: race.id,
          status: updates.every(u => u.status === "success")
            ? "updated"
            : "partial",
          reason: updates.map(u => `${u.unitGroup}: ${u.status}`).join(", ")
        }
      })
    )

    return NextResponse.json(
      {
        success: true,
        message: "Weather update completed",
        updates
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating weather:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update weather data"
      },
      { status: 500 }
    )
  }
}
