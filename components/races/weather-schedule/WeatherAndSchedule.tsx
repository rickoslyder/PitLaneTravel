"use client"

import { RaceWithDetails } from "@/types/race"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, addDays } from "date-fns"
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

interface WeatherAndScheduleProps {
  race: RaceWithDetails
}

interface WeatherData {
  date: Date
  temperature: number
  condition: "sunny" | "partly_cloudy" | "cloudy" | "rainy"
  precipitation: number
  windSpeed: number
  humidity: number
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

// This would come from your weather API in a real app
const SAMPLE_WEATHER: WeatherData[] = [
  {
    date: new Date(),
    temperature: 22,
    condition: "sunny",
    precipitation: 0,
    windSpeed: 12,
    humidity: 65
  },
  {
    date: addDays(new Date(), 1),
    temperature: 24,
    condition: "partly_cloudy",
    precipitation: 20,
    windSpeed: 15,
    humidity: 70
  },
  {
    date: addDays(new Date(), 2),
    temperature: 21,
    condition: "cloudy",
    precipitation: 40,
    windSpeed: 18,
    humidity: 75
  },
  {
    date: addDays(new Date(), 3),
    temperature: 23,
    condition: "rainy",
    precipitation: 80,
    windSpeed: 25,
    humidity: 85
  }
]

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
    date: addDays(new Date(), 1),
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
    date: addDays(new Date(), 2),
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
    date: addDays(new Date(), 3),
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

const getWeatherIcon = (condition: WeatherData["condition"]) => {
  switch (condition) {
    case "sunny":
      return <Sun className="size-6" />
    case "partly_cloudy":
      return <CloudSun className="size-6" />
    case "cloudy":
      return <Cloud className="size-6" />
    case "rainy":
      return <CloudRain className="size-6" />
    default:
      return null
  }
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
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Weather Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            {SAMPLE_WEATHER.map((weather, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <div className="text-muted-foreground text-sm">
                    {format(weather.date, "EEEE")}
                  </div>
                  <div className="font-medium">
                    {format(weather.date, "MMM d")}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  {getWeatherIcon(weather.condition)}
                  <div className="text-2xl font-bold">
                    {weather.temperature}°C
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-muted-foreground flex items-center gap-1">
                      <Umbrella className="size-4" />
                      Rain
                    </div>
                    <div>{weather.precipitation}%</div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-muted-foreground flex items-center gap-1">
                      <Wind className="size-4" />
                      Wind
                    </div>
                    <div>{weather.windSpeed} km/h</div>
                  </div>

                  <div className="bg-muted h-1 rounded-full">
                    <div
                      className="h-full rounded-full bg-sky-500"
                      style={{
                        width: `${weather.humidity}%`
                      }}
                    />
                  </div>
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span>Humidity</span>
                    <span>{weather.humidity}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
