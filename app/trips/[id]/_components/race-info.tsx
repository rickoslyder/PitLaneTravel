"use client"

import { RaceWithDetails } from "@/types/race"
import { Calendar, MapPin, Timer } from "lucide-react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { TimezoneInfo } from "./timezone-info"

interface RaceInfoProps {
  race: RaceWithDetails
}

export function RaceInfo({ race }: RaceInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="text-muted-foreground flex flex-wrap items-center gap-6"
    >
      <div className="flex items-center gap-2">
        <Calendar className="text-primary size-5" />
        <span>
          {race.date ? format(new Date(race.date), "MMM d, yyyy") : "TBD"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <MapPin className="text-primary size-5" />
        <span>
          {race.circuit?.location}, {race.country}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Timer className="text-primary size-5" />
        <span>Race Day</span>
      </div>
      <TimezoneInfo
        timezoneId={race.circuit?.timezone_id}
        timezoneName={race.circuit?.timezone_name}
      />
    </motion.div>
  )
}
