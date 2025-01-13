"use client"

import { RaceWithDetails } from "@/types/race"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flag, Plane, Star, Ticket, CalendarDays, Calendar } from "lucide-react"
import { useState } from "react"
import { TicketSection } from "./tickets/TicketSection"
import { WeatherAndSchedule } from "./weather-schedule/WeatherAndSchedule"
import { ReviewSection } from "./reviews/ReviewSection"
import { RaceItinerary } from "./RaceItinerary"
import { RaceCountdown } from "./race-countdown/RaceCountdown"
import { sendGTMEvent } from "@next/third-parties/google"
import { SelectRaceHistory } from "@/db/schema/race-history-schema"
import { RaceHero } from "./hero/RaceHero"
import { RaceInfoTab } from "./tabs/RaceInfoTab"
import { TravelTab } from "./tabs/TravelTab"

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

  sendGTMEvent({
    event: "view_item",
    user_data: {
      external_id: userId ?? null
    },
    x_fb_ud_external_id: userId ?? null,
    x_fb_cd_content_ids: [race.id],
    x_fb_cd_content_category: "race",
    items: [
      {
        item_name: race.name,
        quantity: 1,
        item_category: "race",
        item_brand: "F1"
      }
    ]
  })

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <RaceHero
        race={race}
        userId={userId}
        existingTripId={existingTripId}
        onTabChange={setActiveTab}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <RaceCountdown raceDate={race.date} />

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6 sm:space-y-8"
        >
          <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-14 z-40 -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
              <TabsList className="w-full flex-nowrap overflow-x-auto">
                <TabsTrigger value="info" className="min-w-max flex-1">
                  <Flag className="mr-2 size-4" />
                  Information
                </TabsTrigger>
                <TabsTrigger value="tickets" className="min-w-max flex-1">
                  <Ticket className="mr-2 size-4" />
                  Tickets
                </TabsTrigger>
                <TabsTrigger value="travel" className="min-w-max flex-1">
                  <Plane className="mr-2 size-4" />
                  Travel
                </TabsTrigger>
                <TabsTrigger value="schedule" className="min-w-max flex-1">
                  <CalendarDays className="mr-2 size-4" />
                  Schedule
                </TabsTrigger>
                <TabsTrigger value="reviews" className="min-w-max flex-1">
                  <Star className="mr-2 size-4" />
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="itinerary" className="min-w-max flex-1">
                  <Calendar className="mr-2 size-4" />
                  Itinerary
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="info">
            <RaceInfoTab race={race} history={history} />
          </TabsContent>

          <TabsContent value="tickets">
            <TicketSection race={race} />
          </TabsContent>

          <TabsContent value="travel">
            <TravelTab race={race} />
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
