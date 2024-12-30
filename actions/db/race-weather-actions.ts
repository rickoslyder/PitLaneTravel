"use server"

import { db } from "@/db/db"
import { raceWeatherTable } from "@/db/schema"
import { ActionState } from "@/types"
import { and, asc, desc, eq, gte, lte } from "drizzle-orm"
import { addDays, differenceInDays, isBefore } from "date-fns"

const VISUAL_CROSSING_API_KEY = process.env.VISUAL_CROSSING_API_KEY

interface WeatherDay {
  datetime: string
  tempmax: number
  tempmin: number
  temp: number
  feelslike: number
  dew: number
  humidity: number
  precip: number
  precipprob: number
  windspeed: number
  winddir: number
  pressure: number
  cloudcover: number
  visibility: number
  uvindex: number
  sunrise: string
  sunset: string
  conditions: string
  icon: string
}

interface WeatherResponse {
  days: WeatherDay[]
}

export async function getWeatherForRaceAction(
  raceId: string,
  lat: number,
  long: number,
  startDate: Date,
  endDate: Date,
  unitGroup: "us" | "metric" = "metric"
): Promise<ActionState<WeatherResponse>> {
  try {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${long}/${startDate.toISOString().split("T")[0]}/${endDate.toISOString().split("T")[0]}?key=${VISUAL_CROSSING_API_KEY}&contentType=json&unitGroup=${unitGroup}`

    console.log("Fetching weather from:", url)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      isSuccess: true,
      message: "Weather data fetched successfully",
      data
    }
  } catch (error) {
    console.error("Error fetching weather:", error)
    return { isSuccess: false, message: "Failed to fetch weather data" }
  }
}

export async function storeRaceWeatherAction(
  raceId: string,
  weatherData: WeatherDay[],
  unitGroup: "us" | "metric" = "metric"
): Promise<ActionState<void>> {
  try {
    // Delete existing weather data for this race and these dates
    const dates = weatherData.map(day => new Date(day.datetime))
    await db
      .delete(raceWeatherTable)
      .where(
        and(
          eq(raceWeatherTable.raceId, raceId),
          eq(raceWeatherTable.unitGroup, unitGroup),
          gte(raceWeatherTable.date, dates[0]),
          lte(raceWeatherTable.date, dates[dates.length - 1])
        )
      )

    // Insert new weather data
    await db.insert(raceWeatherTable).values(
      weatherData.map(day => ({
        raceId,
        date: new Date(day.datetime),
        tempMax: day.tempmax.toString(),
        tempMin: day.tempmin.toString(),
        temp: day.temp.toString(),
        feelsLike: day.feelslike.toString(),
        dew: day.dew?.toString(),
        humidity: day.humidity.toString(),
        precip: day.precip.toString(),
        precipProb: day.precipprob.toString(),
        windSpeed: day.windspeed.toString(),
        windDir: day.winddir?.toString(),
        pressure: day.pressure?.toString(),
        cloudCover: day.cloudcover?.toString(),
        visibility: day.visibility?.toString(),
        uvIndex: day.uvindex?.toString(),
        sunrise: day.sunrise,
        sunset: day.sunset,
        conditions: day.conditions,
        icon: day.icon,
        unitGroup
      }))
    )

    return {
      isSuccess: true,
      message: "Weather data stored successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error storing weather:", error)
    return { isSuccess: false, message: "Failed to store weather data" }
  }
}

export async function getRaceWeatherAction(
  raceId: string,
  startDate: Date,
  endDate: Date,
  unitGroup: "us" | "metric" = "metric"
): Promise<ActionState<typeof raceWeatherTable.$inferSelect[]>> {
  try {
    console.log("Getting weather for:", {
      raceId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      unitGroup
    })

    const weather = await db
      .select()
      .from(raceWeatherTable)
      .where(
        and(
          eq(raceWeatherTable.raceId, raceId),
          eq(raceWeatherTable.unitGroup, unitGroup),
          gte(raceWeatherTable.date, startDate),
          lte(raceWeatherTable.date, endDate)
        )
      )
      .orderBy(asc(raceWeatherTable.date))

    console.log("Found weather entries:", weather.length)
    return {
      isSuccess: true,
      message: "Weather data retrieved successfully",
      data: weather
    }
  } catch (error) {
    console.error("Error getting weather:", error)
    return { isSuccess: false, message: "Failed to get weather data" }
  }
}

export async function shouldUpdateWeatherAction(
  raceId: string,
  raceStartDate: Date
): Promise<ActionState<boolean>> {
  try {
    // Get the most recent weather update for this race
    const [latestWeather] = await db
      .select({ updatedAt: raceWeatherTable.updatedAt })
      .from(raceWeatherTable)
      .where(eq(raceWeatherTable.raceId, raceId))
      .orderBy(desc(raceWeatherTable.updatedAt))
      .limit(1)

    // If no weather data exists, we should update
    if (!latestWeather) {
      return { isSuccess: true, message: "No weather data exists", data: true }
    }

    const now = new Date()
    const daysUntilRace = differenceInDays(raceStartDate, now)

    // Determine update frequency based on time until race
    let updateInterval: number
    if (daysUntilRace <= 3) {
      updateInterval = 1 / 24 // Every hour
    } else if (daysUntilRace <= 14) {
      updateInterval = 0.25 // Every 6 hours
    } else if (daysUntilRace <= 30) {
      updateInterval = 1 // Every day
    } else {
      return { isSuccess: true, message: "No update needed", data: false }
    }

    // If last update was more than interval ago
    if (isBefore(latestWeather.updatedAt, addDays(now, -updateInterval))) {
      return { isSuccess: true, message: "Update needed", data: true }
    }

    return { isSuccess: true, message: "No update needed", data: false }
  } catch (error) {
    console.error("Error checking weather update:", error)
    return { isSuccess: false, message: "Failed to check weather update status" }
  }
} 