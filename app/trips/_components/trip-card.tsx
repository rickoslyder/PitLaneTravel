"use client"

import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Eye, EyeOff, Clock } from "lucide-react"
import { SelectTrip } from "@/db/schema"
import { formatDate } from "@/lib/utils"

interface TripCardProps {
  trip: SelectTrip & {
    race: {
      name: string
      date: Date
      circuit: {
        name: string
        country: string
      }
    }
  }
}

export function TripCard({ trip }: TripCardProps) {
  const statusColors = {
    planning: "bg-yellow-500/10 text-yellow-500",
    booked: "bg-green-500/10 text-green-500",
    completed: "bg-blue-500/10 text-blue-500"
  } as const

  const VisibilityIcon = trip.visibility === "private" ? EyeOff : Eye

  return (
    <Card className="group relative overflow-hidden">
      <Link href={`/trips/${trip.id}`} className="absolute inset-0 z-10" />

      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={statusColors[trip.status]}>
            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
          </Badge>
          <VisibilityIcon className="text-muted-foreground size-4" />
        </div>
        <CardTitle className="line-clamp-1">{trip.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {trip.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Calendar className="size-4" />
          <span>{formatDate(trip.race.date.toISOString())}</span>
        </div>

        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <MapPin className="size-4" />
          <span>
            {trip.race.circuit.name}, {trip.race.circuit.country}
          </span>
        </div>

        {(trip.sharedWith?.length ?? 0) > 0 && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Users className="size-4" />
            <span>Shared with {trip.sharedWith?.length} people</span>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <Clock className="size-3" />
          <span>Last updated {formatDate(trip.updatedAt.toISOString())}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
