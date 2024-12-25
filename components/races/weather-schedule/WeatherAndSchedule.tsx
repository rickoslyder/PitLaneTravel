"use client"

import { Race } from "@/types/race"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Cloud, CloudRain, Sun, Wind } from "lucide-react"

interface WeatherAndScheduleProps {
  /** The race to display weather and schedule for */
  race: Race
}

export function WeatherAndSchedule({ race }: WeatherAndScheduleProps) {
  const getWeatherIcon = (conditions: string) => {
    const lowerConditions = conditions.toLowerCase()
    if (lowerConditions.includes("rain")) {
      return <CloudRain className="size-6" />
    }
    if (lowerConditions.includes("cloud")) {
      return <Cloud className="size-6" />
    }
    if (lowerConditions.includes("wind")) {
      return <Wind className="size-6" />
    }
    return <Sun className="size-6" />
  }

  return (
    <Tabs defaultValue="schedule" className="space-y-8">
      <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
        <TabsTrigger value="schedule">Race Schedule</TabsTrigger>
        <TabsTrigger value="weather">Weather Forecast</TabsTrigger>
      </TabsList>

      <TabsContent value="schedule" className="space-y-6">
        <div className="grid gap-4">
          {race.schedule?.practice_1 && (
            <div className="rounded-lg border p-4">
              <div className="font-semibold">Practice 1</div>
              <div className="text-muted-foreground mt-1 text-sm">
                {format(
                  new Date(race.schedule.practice_1.date),
                  "EEEE, MMMM d"
                )}{" "}
                at {format(new Date(race.schedule.practice_1.time), "h:mm a")}
              </div>
            </div>
          )}

          {race.schedule?.practice_2 && (
            <div className="rounded-lg border p-4">
              <div className="font-semibold">Practice 2</div>
              <div className="text-muted-foreground mt-1 text-sm">
                {format(
                  new Date(race.schedule.practice_2.date),
                  "EEEE, MMMM d"
                )}{" "}
                at {format(new Date(race.schedule.practice_2.time), "h:mm a")}
              </div>
            </div>
          )}

          {race.schedule?.practice_3 && (
            <div className="rounded-lg border p-4">
              <div className="font-semibold">Practice 3</div>
              <div className="text-muted-foreground mt-1 text-sm">
                {format(
                  new Date(race.schedule.practice_3.date),
                  "EEEE, MMMM d"
                )}{" "}
                at {format(new Date(race.schedule.practice_3.time), "h:mm a")}
              </div>
            </div>
          )}

          {race.schedule?.qualifying && (
            <div className="rounded-lg border p-4">
              <div className="font-semibold">Qualifying</div>
              <div className="text-muted-foreground mt-1 text-sm">
                {format(
                  new Date(race.schedule.qualifying.date),
                  "EEEE, MMMM d"
                )}{" "}
                at {format(new Date(race.schedule.qualifying.time), "h:mm a")}
              </div>
            </div>
          )}

          {race.schedule?.sprint && (
            <div className="rounded-lg border p-4">
              <div className="font-semibold">Sprint Race</div>
              <div className="text-muted-foreground mt-1 text-sm">
                {format(new Date(race.schedule.sprint.date), "EEEE, MMMM d")} at{" "}
                {format(new Date(race.schedule.sprint.time), "h:mm a")}
              </div>
            </div>
          )}

          {race.schedule?.race && (
            <div className="rounded-lg border p-4">
              <div className="font-semibold">Race</div>
              <div className="text-muted-foreground mt-1 text-sm">
                {format(new Date(race.schedule.race.date), "EEEE, MMMM d")} at{" "}
                {format(new Date(race.schedule.race.time), "h:mm a")}
              </div>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="weather" className="space-y-6">
        {race.weather_info ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                {getWeatherIcon(race.weather_info.conditions)}
                <div className="font-semibold">Conditions</div>
              </div>
              <div className="mt-1 text-2xl font-semibold">
                {race.weather_info.conditions}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="text-muted-foreground text-sm">Temperature</div>
              <div className="mt-1 text-2xl font-semibold">
                {race.weather_info.temperature}°C
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="text-muted-foreground text-sm">Precipitation</div>
              <div className="mt-1 text-2xl font-semibold">
                {race.weather_info.precipitation}%
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="text-muted-foreground text-sm">Wind Speed</div>
              <div className="mt-1 text-2xl font-semibold">
                {race.weather_info.wind_speed} km/h
              </div>
            </div>

            {race.weather_info.airTemperature && (
              <div className="rounded-lg border p-4">
                <div className="text-muted-foreground text-sm">
                  Air Temperature
                </div>
                <div className="mt-1 text-2xl font-semibold">
                  {race.weather_info.airTemperature}°C
                </div>
              </div>
            )}

            {race.weather_info.trackTemperature && (
              <div className="rounded-lg border p-4">
                <div className="text-muted-foreground text-sm">
                  Track Temperature
                </div>
                <div className="mt-1 text-2xl font-semibold">
                  {race.weather_info.trackTemperature}°C
                </div>
              </div>
            )}

            <div className="rounded-lg border p-4">
              <div className="text-muted-foreground text-sm">Humidity</div>
              <div className="mt-1 text-2xl font-semibold">
                {race.weather_info.humidity}%
              </div>
            </div>

            {race.weather_info.visibility && (
              <div className="rounded-lg border p-4">
                <div className="text-muted-foreground text-sm">Visibility</div>
                <div className="mt-1 text-2xl font-semibold">
                  {race.weather_info.visibility}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground rounded-lg border p-4 text-center">
            Weather information not available yet
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
