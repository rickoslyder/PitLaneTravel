"use client"

import { RaceWithDetails } from "@/types/race"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Info, MapPin } from "lucide-react"
import { format, addDays } from "date-fns"
import { motion } from "framer-motion"

interface TripInfoTabProps {
  race: RaceWithDetails
  description: string
}

export function TripInfoTab({ race, description }: TripInfoTabProps) {
  // Convert UTC dates to local dates for display
  const practiceDate = race.weekend_start ? new Date(race.weekend_start) : null
  const qualifyingDate = race.date ? addDays(new Date(race.date), -1) : null
  const raceDate = race.date ? new Date(race.date) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="group transition-all hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="text-primary size-5" />
            Trip Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>{description}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-medium">
                <Calendar className="text-primary size-4" />
                Race Weekend Schedule
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Practice:</span>
                  <span>
                    {practiceDate ? format(practiceDate, "MMM d, yyyy") : "TBD"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Qualifying:</span>
                  <span>
                    {qualifyingDate
                      ? format(qualifyingDate, "MMM d, yyyy")
                      : "TBD"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Race Day:</span>
                  <span className="text-primary font-medium">
                    {raceDate ? format(raceDate, "MMM d, yyyy") : "TBD"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-medium">
                <MapPin className="text-primary size-4" />
                Circuit Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Circuit:</span>
                  <span>{race.circuit?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Location:</span>
                  <span>{race.circuit?.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Country:</span>
                  <span>{race.country}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
