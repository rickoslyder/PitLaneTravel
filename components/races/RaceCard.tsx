"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { RaceWithCircuitAndSeries } from "@/types/database"
import { format } from "date-fns"
import { CalendarDays, Flag, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface RaceCardProps {
  /** The race to display */
  race: RaceWithCircuitAndSeries
  /** The variant of the card */
  variant?: "grid" | "list"
  /** Additional class names */
  className?: string
  /** Callback when the card is clicked */
  onClick?: () => void
}

function SeriesBadge({
  race,
  className
}: {
  race: RaceWithCircuitAndSeries
  className?: string
}) {
  const series = race.series
  if (!series) return null
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-white shadow-sm",
        className
      )}
      style={{ backgroundColor: series.accent_color || "#e10600" }}
    >
      {series.short_name}
    </span>
  )
}

function CancelledBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
      Cancelled
    </span>
  )
}

export function RaceCard({
  race,
  variant = "grid",
  className,
  onClick
}: RaceCardProps) {
  const raceDate = new Date(race.date)
  const isCancelled = race.status === "cancelled"

  if (variant === "list") {
    return (
      <Card
        className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between",
          isCancelled && "opacity-70",
          className
        )}
        onClick={onClick}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
          <CardHeader className="shrink-0 pb-2 pt-6 sm:pb-6">
            <div className="relative size-20 overflow-hidden rounded-lg">
              {race.circuit?.image_url ? (
                <img
                  src={race.circuit.image_url}
                  alt={race.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="bg-muted flex size-full items-center justify-center">
                  <Flag className="text-muted-foreground size-8" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-2 pt-0 sm:py-6">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <SeriesBadge race={race} />
                {isCancelled && <CancelledBadge />}
                <h3
                  className={cn(
                    "font-semibold",
                    isCancelled && "line-through decoration-1"
                  )}
                >
                  {race.name}
                </h3>
              </div>
              <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  <span>
                    {race.circuit?.location}, {race.country}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarDays className="size-3.5" />
                  <span>{format(raceDate, "MMM d, yyyy")}</span>
                </div>
              </div>
              {isCancelled && race.cancellation_reason && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {race.cancellation_reason}
                </p>
              )}
            </div>
          </CardContent>
        </div>
        <CardFooter className="shrink-0 pb-6">
          <Button onClick={onClick}>View Details</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "group cursor-pointer",
        isCancelled && "opacity-70",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
          <div className="absolute left-2 top-2 z-10 flex gap-1.5">
            {race.series && <SeriesBadge race={race} />}
            {isCancelled && <CancelledBadge />}
          </div>
          {race.circuit?.image_url ? (
            <img
              src={race.circuit.image_url}
              alt={race.name}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="bg-muted flex size-full items-center justify-center">
              <Flag className="text-muted-foreground size-12" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <h3
          className={cn(
            "line-clamp-2 font-semibold",
            isCancelled && "line-through decoration-1"
          )}
        >
          {race.name}
        </h3>
        <div className="text-muted-foreground flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            <span>
              {race.circuit?.location}, {race.country}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            <span>{format(raceDate, "MMM d, yyyy")}</span>
          </div>
          {isCancelled && race.cancellation_reason && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {race.cancellation_reason}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isCancelled ? "outline" : "default"}
          onClick={onClick}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
