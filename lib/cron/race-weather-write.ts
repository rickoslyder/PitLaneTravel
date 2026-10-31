import { raceWeatherTable } from "@/db/schema"
import { and, eq, gte, lte } from "drizzle-orm"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import type * as schema from "@/db/schema"

type RaceWeatherWriter = Pick<
  PostgresJsDatabase<typeof schema>,
  "delete" | "insert"
>

export interface RaceWeatherDay {
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

/**
 * Replace stored days for one race and unit system.
 *
 * Date bounds are passed to typed timestamp columns. A raw `sql` fragment
 * compared with a JS Date throws ERR_INVALID_ARG_TYPE on drizzle-orm 0.33 +
 * postgres-js 3.4.4; these comparisons do not use that shape.
 */
export async function replaceRaceWeather(
  database: RaceWeatherWriter,
  raceId: string,
  weatherData: RaceWeatherDay[],
  unitGroup: "us" | "metric" = "metric"
): Promise<void> {
  if (weatherData.length === 0) return

  const dates = weatherData.map(day => new Date(day.datetime))
  await database
    .delete(raceWeatherTable)
    .where(
      and(
        eq(raceWeatherTable.raceId, raceId),
        eq(raceWeatherTable.unitGroup, unitGroup),
        gte(raceWeatherTable.date, dates[0]),
        lte(raceWeatherTable.date, dates[dates.length - 1])
      )
    )

  await database.insert(raceWeatherTable).values(
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
}
