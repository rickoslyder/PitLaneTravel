"use client"

import { RaceWithDetails } from "@/types/race"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import {
  CalendarDays,
  Calendar,
  Flag,
  MapPin,
  Plane,
  Share2,
  Star,
  Ticket,
  Trophy,
  Timer,
  Clock,
  ScrollText,
  ArrowRight
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useState } from "react"
import { FlightSearch } from "./travel/FlightSearch"
import { TicketSection } from "./tickets/TicketSection"
import { WeatherAndSchedule } from "./weather-schedule/WeatherAndSchedule"
import { ReviewSection } from "./reviews/ReviewSection"
import { RaceItinerary } from "./RaceItinerary"
import { RaceCountdown } from "./race-countdown/RaceCountdown"
import { SelectCircuitLocation } from "@/db/schema"
import { TripPlannerButton } from "@/components/trip-planner-button"
import { auth } from "@clerk/nextjs/server"
import { sendGTMEvent, YouTubeEmbed } from "@next/third-parties/google"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import {
  SelectRaceHistory,
  TimelineEvent,
  RecordBreaker,
  MemorableMoment
} from "@/db/schema/race-history-schema"

interface RaceDetailsPageProps {
  /** The race to display */
  race: RaceWithDetails
  /** The user's existing trip ID for this race, if any */
  existingTripId?: string
  /** The current user's ID */
  userId?: string | null
  /** The race's history data */
  history?: SelectRaceHistory
}

export function RaceDetailsPage({
  race,
  existingTripId,
  userId,
  history
}: RaceDetailsPageProps) {
  const [activeTab, setActiveTab] = useState("info")
  const raceDate = new Date(race.date)
  const weekendStart = race.weekend_start ? new Date(race.weekend_start) : null
  const weekendEnd = race.weekend_end ? new Date(race.weekend_end) : null

  const getStatusColor = (status: RaceWithDetails["status"]) => {
    switch (status) {
      case "in_progress":
        return "bg-green-500/10 text-green-500"
      case "upcoming":
        return "bg-blue-500/10 text-blue-500"
      case "completed":
        return "bg-gray-500/10 text-gray-500"
      case "cancelled":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: RaceWithDetails["status"]) => {
    switch (status) {
      case "in_progress":
        return "Live"
      case "upcoming":
        return "Upcoming"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
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

  sendGTMEvent({
    event: "view_item",
    user_data: {
      external_id: userId ?? null
    },
    x_fb_ud_external_id: userId ?? null,
    items: [
      {
        item_name: race.name,
        quantity: 1,
        // price: 123.45,
        item_category: "race",
        item_brand: "F1"
      }
    ]
  })

  return (
    <div className="min-h-screen">
      <div className="relative h-[60vh] w-full overflow-hidden">
        {race.circuit?.image_url ? (
          <div className="absolute inset-0">
            <img
              src={race.circuit.image_url}
              alt={race.name}
              className="size-full object-cover"
            />
            <div className="from-background via-background/50 absolute inset-0 bg-gradient-to-t to-transparent" />
          </div>
        ) : (
          <div className="from-primary/20 to-background absolute inset-0 bg-gradient-to-b" />
        )}

        <div className="absolute inset-0 -z-10 size-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]">
          <div className="bg-primary absolute inset-x-0 top-0 -z-10 m-auto size-[310px] rounded-full opacity-20 blur-[100px]" />
        </div>

        <div className="container relative flex h-full items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <Badge
                variant="secondary"
                className={cn(getStatusColor(race.status), "backdrop-blur-md")}
              >
                {getStatusText(race.status)}
              </Badge>
              {race.is_sprint_weekend && (
                <Badge variant="secondary" className="backdrop-blur-md">
                  Sprint Weekend
                </Badge>
              )}
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white backdrop-blur-sm sm:text-6xl">
              {race.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-lg text-white/90 backdrop-blur-sm">
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
              <TripPlannerButton
                race={race}
                userId={userId}
                existingTripId={existingTripId}
              />
              <Button
                size="lg"
                variant="outline"
                onClick={handleShare}
                className="bg-white/10 backdrop-blur-md hover:bg-white/20"
              >
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
          <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-14 z-40 -mx-6 px-6 py-4 backdrop-blur">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">
                <Flag className="mr-2 size-4" />
                Information
              </TabsTrigger>
              <TabsTrigger value="tickets" className="flex-1">
                <Ticket className="mr-2 size-4" />
                Tickets
              </TabsTrigger>
              <TabsTrigger value="travel" className="flex-1">
                <Plane className="mr-2 size-4" />
                Travel
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex-1">
                <CalendarDays className="mr-2 size-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1">
                <Star className="mr-2 size-4" />
                Reviews
              </TabsTrigger>
              <TabsTrigger value="itinerary" className="flex-1">
                <Calendar className="mr-2 size-4" />
                Itinerary
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="info" className="space-y-8">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h2>About the Race</h2>
              <ReactMarkdown
                className="prose prose-gray dark:prose-invert max-w-none"
                remarkPlugins={[remarkGfm]}
              >
                {race.description || ""}
              </ReactMarkdown>

              <h2>Circuit History</h2>
              <div className="not-prose grid grid-cols-1 gap-8 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Clock className="text-primary size-5" />
                      <CardTitle>Timeline</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative space-y-4 pl-6">
                      <div className="bg-border/50 absolute inset-y-0 left-2 w-px" />

                      {history?.timeline.map(
                        (event: TimelineEvent, index: number) => (
                          <div key={index} className="relative">
                            <div className="bg-primary absolute -left-6 top-1.5 size-3 rounded-full" />
                            <div className="space-y-1">
                              <div className="text-muted-foreground text-sm">
                                {event.year}
                              </div>
                              <div>{event.title}</div>
                              {event.description && (
                                <div className="text-muted-foreground text-sm">
                                  {event.description}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ScrollText className="text-primary size-5" />
                      <CardTitle>Notable Moments</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold">Record Breakers</h4>
                      <div className="mt-2 space-y-2">
                        {history?.recordBreakers.map(
                          (record: RecordBreaker, index: number) => (
                            <div key={index} className="rounded-lg border p-3">
                              <div className="text-sm font-medium">
                                {record.title}
                              </div>
                              <div className="text-muted-foreground mt-1">
                                {record.description}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold">Memorable Moments</h4>
                      <div className="mt-2 space-y-4">
                        {history?.memorableMoments.map(
                          (moment: MemorableMoment, index: number) => (
                            <div key={index}>
                              <div className="text-sm font-medium">
                                {moment.year}: {moment.title}
                              </div>
                              <div className="text-muted-foreground mt-1">
                                {moment.description}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {history && (
                <div className="mt-8 flex justify-center">
                  <Link href={`/races/${race.id}/history`}>
                    <Button variant="outline" size="lg" className="gap-2">
                      Read Full History
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              )}

              {race.circuit?.details && (
                <>
                  <h2>Circuit Information</h2>
                  <div className="not-prose grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Card className="overflow-hidden">
                      <CardHeader>
                        <CardTitle>Track Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="text-muted-foreground text-sm">
                              Length
                            </div>
                            <div className="flex items-baseline gap-1">
                              <div className="text-3xl font-bold">
                                {race.circuit.details.length}
                              </div>
                              <div className="text-muted-foreground">km</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-muted-foreground text-sm">
                              Corners
                            </div>
                            <div className="flex items-baseline gap-1">
                              <div className="text-3xl font-bold">
                                {race.circuit.details.corners}
                              </div>
                              <div className="text-muted-foreground">turns</div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-muted-foreground text-sm">
                            DRS Zones
                          </div>
                          <div className="flex items-center gap-2">
                            {Array.from({
                              length: race.circuit.details.drs_zones
                            }).map((_, i) => (
                              <div
                                key={i}
                                className="bg-primary/20 border-primary/30 h-8 w-12 rounded-md border"
                              />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-muted-foreground text-sm">
                            Track Characteristics
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col items-center rounded-lg border p-2">
                              <div className="text-primary text-xl">70%</div>
                              <div className="text-muted-foreground text-xs">
                                Full Throttle
                              </div>
                            </div>
                            <div className="flex flex-col items-center rounded-lg border p-2">
                              <div className="text-primary text-xl">44</div>
                              <div className="text-muted-foreground text-xs">
                                Gear Changes
                              </div>
                            </div>
                            <div className="flex flex-col items-center rounded-lg border p-2">
                              <div className="text-primary text-xl">320</div>
                              <div className="text-muted-foreground text-xs">
                                Top Speed km/h
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Lap Record</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
                            <Trophy className="text-primary size-8" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold">
                              {race.circuit.details.lap_record_time}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {race.circuit.details.lap_record_driver} (
                              {race.circuit.details.lap_record_year})
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="text-muted-foreground text-sm">
                              Sector Times
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <div className="h-1 rounded-full bg-purple-500/20" />
                                <div className="text-center text-xs">
                                  Sector 1
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="h-1 rounded-full bg-green-500/20" />
                                <div className="text-center text-xs">
                                  Sector 2
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="h-1 rounded-full bg-yellow-500/20" />
                                <div className="text-center text-xs">
                                  Sector 3
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-muted-foreground text-sm">
                              Speed Zones
                            </div>
                            <div className="relative h-8 rounded-lg border">
                              <div className="bg-primary/20 absolute inset-y-0 left-0 w-[70%] rounded-l-lg" />
                              <div className="bg-primary/10 absolute inset-y-0 right-0 w-[30%] rounded-r-lg" />
                            </div>
                            <div className="flex justify-between text-xs">
                              <span>High Speed</span>
                              <span>Medium Speed</span>
                              <span>Low Speed</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              <h2>Previous Race Results & Highlights</h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <YouTubeEmbed
                  videoid="gYzVprg_NNs"
                  // params="controls=0"
                  width={560}
                  height={315}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-8">
            <TicketSection race={race} />
          </TabsContent>

          <TabsContent value="travel" className="space-y-8">
            <FlightSearch
              race={race}
              nearestAirports={
                race.circuit?.locations?.filter(
                  (loc): loc is SelectCircuitLocation =>
                    (loc.type === "airport" &&
                      typeof loc.address === "string") ||
                    loc.address === null
                ) || []
              }
              onSearch={async searchParams => {
                const response = await fetch("/api/flights/search", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(searchParams)
                })
                const data = await response.json()
                if (!response.ok)
                  throw new Error(data.error || "Failed to search flights")
                return data.offers
              }}
            />
            <div className="grid gap-6 md:grid-cols-2">
              {race.circuit?.transport_info &&
                race.circuit.transport_info.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Transport Options</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {race.circuit.transport_info.map(transport => (
                          <div key={transport.id}>
                            <h4 className="font-medium">{transport.name}</h4>
                            {transport.description && (
                              <p className="text-muted-foreground">
                                {transport.description}
                              </p>
                            )}
                            {transport.options &&
                              transport.options.length > 0 && (
                                <ul className="text-muted-foreground mt-2 list-inside list-disc">
                                  {transport.options.map((option, index) => (
                                    <li key={index}>{option}</li>
                                  ))}
                                </ul>
                              )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {race.circuit?.locations &&
                race.circuit.locations.filter(loc => loc.type === "airport")
                  .length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Nearest Airports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {race.circuit.locations
                          .filter(
                            (loc): loc is SelectCircuitLocation =>
                              (loc.type === "airport" &&
                                typeof loc.address === "string") ||
                              loc.address === null
                          )
                          .map(airport => (
                            <div key={airport.placeId || airport.id}>
                              <h4 className="font-medium">{airport.name}</h4>
                              <div className="text-muted-foreground space-y-1">
                                <p>Distance: {airport.distanceFromCircuit}km</p>
                                <p>Transfer Time: {airport.description}</p>
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
