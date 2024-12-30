"use client"

import { RaceWithDetails } from "@/types/race"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import {
  Cloud,
  CloudRain,
  CloudSun,
  Flag,
  Sun,
  Timer,
  Umbrella,
  Wind
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
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

interface EventSchedule {
  day: string
  date: Date
  events: {
    time: string
    name: string
    duration: string
    type: "practice" | "qualifying" | "sprint" | "race" | "other"
  }[]
}

// This would come from your database in a real app
const SAMPLE_SCHEDULE: EventSchedule[] = [
  {
    day: "Thursday",
    date: new Date(),
    events: [
      {
        time: "14:00",
        name: "Track Walk",
        duration: "1h",
        type: "other"
      },
      {
        time: "16:00",
        name: "Pit Lane Walk",
        duration: "2h",
        type: "other"
      }
    ]
  },
  {
    day: "Friday",
    date: new Date(Date.now() + 86400000),
    events: [
      {
        time: "13:30",
        name: "Practice 1",
        duration: "1h",
        type: "practice"
      },
      {
        time: "17:00",
        name: "Qualifying",
        duration: "1h",
        type: "qualifying"
      }
    ]
  },
  {
    day: "Saturday",
    date: new Date(Date.now() + 172800000),
    events: [
      {
        time: "12:30",
        name: "Practice 2",
        duration: "1h",
        type: "practice"
      },
      {
        time: "16:30",
        name: "Sprint Race",
        duration: "1h",
        type: "sprint"
      }
    ]
  },
  {
    day: "Sunday",
    date: new Date(Date.now() + 259200000),
    events: [
      {
        time: "15:00",
        name: "Race",
        duration: "2h",
        type: "race"
      }
    ]
  }
]

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

const getEventColor = (type: EventSchedule["events"][0]["type"]) => {
  switch (type) {
    case "practice":
      return "bg-blue-500/10 text-blue-500"
    case "qualifying":
      return "bg-purple-500/10 text-purple-500"
    case "sprint":
      return "bg-orange-500/10 text-orange-500"
    case "race":
      return "bg-red-500/10 text-red-500"
    default:
      return "bg-gray-500/10 text-gray-500"
  }
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

        console.log("Weather data:", {
          metric: metricResponse.data,
          us: usResponse.data
        })

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

  return (
    <div className="space-y-8">
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
                <span className="font-medium">{useMiles ? "mph" : "km/h"}</span>
              </Toggle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-8">
              Loading weather data...
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center justify-center py-8 text-red-500">
              {error}
            </div>
          )}

          {!loading && !error && currentWeather.length > 0 && (
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
          )}

          {!loading && !error && currentWeather.length === 0 && (
            <div className="text-muted-foreground flex items-center justify-center py-8">
              No weather data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Race Weekend Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="daily">Daily View</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-8">
              {SAMPLE_SCHEDULE.map((day, dayIndex) => (
                <div key={day.day} className="relative">
                  {dayIndex < SAMPLE_SCHEDULE.length - 1 && (
                    <div className="bg-muted absolute left-[19px] top-[40px] h-[calc(100%+2rem)] w-[2px]" />
                  )}
                  <div className="mb-4">
                    <div className="font-medium">{day.day}</div>
                    <div className="text-muted-foreground text-sm">
                      {format(day.date, "MMMM d, yyyy")}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {day.events.map((event, eventIndex) => (
                      <motion.div
                        key={event.time}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay:
                            (dayIndex * day.events.length + eventIndex) * 0.1
                        }}
                        className="flex gap-4"
                      >
                        <div className="relative">
                          <div
                            className={cn(
                              "border-background size-10 rounded-full border-4",
                              getEventColor(event.type)
                            )}
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{event.name}</div>
                            <div className="text-muted-foreground flex items-center gap-1 text-sm">
                              <Timer className="size-4" />
                              {event.duration}
                            </div>
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {event.time}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="daily">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {SAMPLE_SCHEDULE.map(day => (
                  <Card key={day.day}>
                    <CardHeader>
                      <CardTitle className="text-lg">{day.day}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {day.events.map(event => (
                        <div
                          key={event.time}
                          className={cn(
                            "rounded-lg p-3",
                            getEventColor(event.type)
                          )}
                        >
                          <div className="font-medium">{event.name}</div>
                          <div className="mt-1 flex items-center justify-between text-sm">
                            <span>{event.time}</span>
                            <span>{event.duration}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
