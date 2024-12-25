"use client"

import { Race } from "@/types/race"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import {
  CalendarDays,
  Flag,
  MapPin,
  Share2,
  Ticket,
  Plane,
  Star,
  Calendar
} from "lucide-react"
import { WeatherAndSchedule } from "@/components/races/weather-schedule/WeatherAndSchedule"
import { RaceCountdown } from "@/components/races/race-countdown/RaceCountdown"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RaceItinerary } from "./RaceItinerary"
import { ReviewSection } from "./reviews/ReviewSection"
import { TicketSection } from "./tickets/TicketSection"
import { useState } from "react"
import { toast } from "sonner"
import { FlightSearch } from "./travel/FlightSearch"

interface RaceDetailsPageProps {
  /** The race to display */
  race: Race
}

export function RaceDetailsPage({ race }: RaceDetailsPageProps) {
  const [activeTab, setActiveTab] = useState("info")
  const raceDate = new Date(race.date)
  const weekendStart = race.weekend_start ? new Date(race.weekend_start) : null
  const weekendEnd = race.weekend_end ? new Date(race.weekend_end) : null

  const getAvailabilityColor = (availability: Race["availability"]) => {
    switch (availability) {
      case "available":
        return "bg-green-500/10 text-green-500"
      case "sold_out":
        return "bg-red-500/10 text-red-500"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500"
      case "low_stock":
        return "bg-orange-500/10 text-orange-500"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getAvailabilityText = (availability: Race["availability"]) => {
    switch (availability) {
      case "available":
        return "Available"
      case "sold_out":
        return "Sold Out"
      case "pending":
        return "Coming Soon"
      case "low_stock":
        return "Low Stock"
      default:
        return "Unknown"
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: race.name,
      text: `Check out the ${race.name} on ${format(raceDate, "MMM d, yyyy")}`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success("Link copied to clipboard!")
      }
    } catch (error) {
      console.error("Error sharing:", error)
      toast.error("Failed to share")
    }
  }

  return (
    <div className="min-h-screen">
      <div className="bg-background relative overflow-hidden py-24">
        <div className="absolute inset-0 -z-10 size-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]">
          <div className="bg-primary absolute inset-x-0 top-0 -z-10 m-auto size-[310px] rounded-full opacity-20 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <Badge
                variant="secondary"
                className={getAvailabilityColor(race.availability)}
              >
                {getAvailabilityText(race.availability)}
              </Badge>
              {race.is_sprint_weekend && (
                <Badge variant="secondary">Sprint Weekend</Badge>
              )}
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
              {race.name}
            </h1>

            <div className="text-muted-foreground mt-6 flex flex-wrap items-center justify-center gap-4 text-lg">
              <div className="flex items-center gap-1">
                <MapPin className="size-5" />
                <span>
                  {race.circuit?.location}, {race.country}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarDays className="size-5" />
                <span>
                  {weekendStart && weekendEnd
                    ? `${format(weekendStart, "MMM d")} - ${format(
                        weekendEnd,
                        "MMM d, yyyy"
                      )}`
                    : format(raceDate, "MMM d, yyyy")}
                </span>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-[#E10600] hover:bg-[#FF0800]"
                onClick={() => setActiveTab("tickets")}
              >
                <Ticket className="mr-2 size-4" />
                Book Now
              </Button>
              <Button size="lg" variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 size-4" />
                Share
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-12 lg:px-8">
        <RaceCountdown raceDate={race.date} />

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-6 lg:w-[800px]">
            <TabsTrigger value="info">
              <Flag className="mr-2 size-4" />
              Information
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <Ticket className="mr-2 size-4" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="travel">
              <Plane className="mr-2 size-4" />
              Travel
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <CalendarDays className="mr-2 size-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Star className="mr-2 size-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="itinerary">
              <Calendar className="mr-2 size-4" />
              Itinerary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-8">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h2>About the Race</h2>
              <p>{race.description}</p>

              {race.circuit_info && (
                <>
                  <h2>Circuit Information</h2>
                  <div className="not-prose grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border p-4">
                      <div className="text-muted-foreground text-sm">
                        Track Length
                      </div>
                      <div className="mt-1 text-2xl font-semibold">
                        {race.circuit_info.length} km
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-muted-foreground text-sm">
                        Number of Corners
                      </div>
                      <div className="mt-1 text-2xl font-semibold">
                        {race.circuit_info.corners}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-muted-foreground text-sm">
                        DRS Zones
                      </div>
                      <div className="mt-1 text-2xl font-semibold">
                        {race.circuit_info.drsZones}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-muted-foreground text-sm">
                        Lap Record
                      </div>
                      <div className="mt-1 space-y-1">
                        <div className="text-2xl font-semibold">
                          {race.circuit_info.lapRecord.time}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {race.circuit_info.lapRecord.driver} (
                          {race.circuit_info.lapRecord.year})
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-8">
            <TicketSection race={race} />
          </TabsContent>

          <TabsContent value="travel" className="space-y-8">
            <FlightSearch
              race={race}
              nearestAirports={race.nearest_airports || []}
            />
            <div className="grid gap-6 md:grid-cols-2">
              {race.transport_info && (
                <Card>
                  <CardHeader>
                    <CardTitle>Public Transport</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Train</h4>
                        <p className="text-muted-foreground">
                          {race.transport_info.train}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Bicycle</h4>
                        <p className="text-muted-foreground">
                          {race.transport_info.bicycle}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {race.nearest_airports && race.nearest_airports.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Nearest Airports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {race.nearest_airports.map(airport => (
                        <div key={airport.code}>
                          <h4 className="font-medium">{airport.name}</h4>
                          <div className="text-muted-foreground space-y-1">
                            <p>Distance: {airport.distance}</p>
                            <p>Transfer Time: {airport.transferTime}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <WeatherAndSchedule race={race} />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewSection raceId={race.id} />
          </TabsContent>

          <TabsContent value="itinerary">
            <RaceItinerary race={race} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
