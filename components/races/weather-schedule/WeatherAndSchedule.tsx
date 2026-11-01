"use client"

import { RaceWithDetails } from "@/types/race"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { raceWeekendSessions } from "@/lib/race-weekend-sessions"
import { Cloud, CloudRain, CloudSun, Sun, Umbrella, Wind } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { raceWeatherTable } from "@/db/schema"
import { getRaceWeatherAction } from "@/actions/db/race-weather-actions"
import { Toggle } from "@/components/ui/toggle"

interface WeatherAndScheduleProps {
  race: RaceWithDetails
}

interface WeatherData {
  metric: (typeof raceWeatherTable.$inferSelect)[]
  us: (typeof raceWeatherTable.$inferSelect)[]
}

const getWeatherIcon = (conditions: string) => {
  const condition = conditions.toLowerCase()
  if (condition.includes("clear") || condition.includes("sunny")) {
    return <Sun className="size-6" />
  }
  if (
    condition.includes("partly cloudy") ||
    condition.includes("mostly cloudy")
  ) {
    return <CloudSun className="size-6" />
  }
  if (condition.includes("cloudy") || condition.includes("overcast")) {
    return <Cloud className="size-6" />
  }
  if (
    condition.includes("rain") ||
    condition.includes("drizzle") ||
    condition.includes("shower")
  ) {
    return <CloudRain className="size-6" />
  }
  return <Sun className="size-6" />
}

export function WeatherAndSchedule({ race }: WeatherAndScheduleProps) {
  const [weather, setWeather] = useState<WeatherData>({ metric: [], us: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useFahrenheit, setUseFahrenheit] = useState(false)
  const [useMiles, setUseMiles] = useState(false)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!race.weekend_start || !race.weekend_end) {
          setError("No weekend dates available")
          return
        }

        // Fetch both unit systems
        const [metricResponse, usResponse] = await Promise.all([
          getRaceWeatherAction(
            race.id,
            new Date(race.weekend_start),
            new Date(race.weekend_end),
            "metric"
          ),
          getRaceWeatherAction(
            race.id,
            new Date(race.weekend_start),
            new Date(race.weekend_end),
            "us"
          )
        ])

        if (!metricResponse.isSuccess || !usResponse.isSuccess) {
          setError("Failed to fetch weather data")
          return
        }

        setWeather({
          metric: metricResponse.data || [],
          us: usResponse.data || []
        })
      } catch (err) {
        console.error("Error fetching weather:", err)
        setError("Failed to fetch weather data")
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [race])

  // Get the weather data for the current unit system
  const currentWeather = useFahrenheit ? weather.us : weather.metric

  const sessions = raceWeekendSessions(new Date(race.date))
  const showWeather = !loading && !error && currentWeather.length > 0

  return (
    <div className="space-y-8">
      {showWeather && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Weather Forecast</CardTitle>
              <div className="flex items-center gap-4">
                <Toggle
                  pressed={useFahrenheit}
                  onPressedChange={setUseFahrenheit}
                  aria-label="Toggle temperature unit"
                  className="hover:border-primary data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border-2"
                >
                  <span className="font-medium">
                    °{useFahrenheit ? "F" : "C"}
                  </span>
                </Toggle>
                <Toggle
                  pressed={useMiles}
                  onPressedChange={setUseMiles}
                  aria-label="Toggle distance unit"
                  className="hover:border-primary data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border-2"
                >
                  <span className="font-medium">
                    {useMiles ? "mph" : "km/h"}
                  </span>
                </Toggle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              {currentWeather.map((day, index) => (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <div className="text-muted-foreground text-sm">
                      {format(new Date(day.date), "EEEE")}
                    </div>
                    <div className="font-medium">
                      {format(new Date(day.date), "MMM d")}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    {getWeatherIcon(day.conditions)}
                    <div className="text-2xl font-bold">
                      {day.temp}°{useFahrenheit ? "F" : "C"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Umbrella className="size-4" />
                        Rain
                      </div>
                      <div>{day.precipProb}%</div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Wind className="size-4" />
                        Wind
                      </div>
                      <div>
                        {useMiles
                          ? `${Math.round(Number(day.windSpeed) * 0.621371)} mph`
                          : `${day.windSpeed} km/h`}
                      </div>
                    </div>

                    <div className="bg-muted h-1 rounded-full">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{
                          width: `${day.humidity}%`
                        }}
                      />
                    </div>
                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <span>Humidity</span>
                      <span>{day.humidity}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Race Weekend Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessions.map(session => (
            <div key={session.description} className="flex items-center gap-2">
              <div className="bg-primary/10 size-2 rounded-full" />
              <span>{format(session.date, "EEE, MMM d")}</span>
              <span>-</span>
              <span>{session.description}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
