import { db } from "@/db/db"
import { racesTable, circuitsTable } from "@/db/schema"
import { eq, gt, sql } from "drizzle-orm"
import { NextResponse } from "next/server"
import {
  getWeatherForRaceAction,
  shouldUpdateWeatherAction,
  storeRaceWeatherAction
} from "@/actions/db/race-weather-actions"

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

export async function GET() {
  try {
    // Get all upcoming races
    const races = await db
      .select({
        id: racesTable.id,
        name: racesTable.name,
        date: racesTable.date,
        weekendStart: racesTable.weekendStart,
        weekendEnd: racesTable.weekendEnd,
        circuit: {
          latitude: sql<number>`CAST(${circuitsTable.latitude} AS float)`,
          longitude: sql<number>`CAST(${circuitsTable.longitude} AS float)`
        }
      })
      .from(racesTable)
      .innerJoin(circuitsTable, eq(racesTable.circuitId, circuitsTable.id))
      .where(gt(racesTable.date, new Date()))

    const updates = await Promise.all(
      races.map(async (race: RaceWithCircuit) => {
        if (!race.weekendStart || !race.weekendEnd) {
          return {
            raceId: race.id,
            status: "skipped",
            reason: "Missing weekend dates"
          }
        }

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

        // Add a day before and after the weekend
        const startDate = new Date(race.weekendStart)
        startDate.setDate(startDate.getDate() - 1)
        const endDate = new Date(race.weekendEnd)
        endDate.setDate(endDate.getDate() + 1)

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
