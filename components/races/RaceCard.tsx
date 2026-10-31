"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { RaceWithCircuitAndSeries } from "@/types/database"
import { CalendarDays, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatRaceCalendarDate } from "@/lib/race-datetime"
import { RaceCircuitImage } from "@/components/races/race-circuit-image"
import { CoverageBadge } from "@/components/coverage/coverage-badge"
import { SeriesBadge } from "@/components/series/series-badge"
import type { PublicCoverageSummary } from "@/lib/public-coverage"

interface RaceCardProps {
  /** The race to display */
  race: RaceWithCircuitAndSeries
  /** The variant of the card */
  variant?: "grid" | "list"
  /** Additional class names */
  className?: string
  /** Callback when the card is clicked */
  onClick?: () => void
  /** Safe public coverage summary for this race */
  coverage?: PublicCoverageSummary
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
  onClick,
  coverage
}: RaceCardProps) {
  const raceDateLabel = formatRaceCalendarDate(race.date)
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
              <RaceCircuitImage
                src={race.circuit?.image_url}
                alt={race.name}
                className="size-full object-cover"
              />
            </div>
          </CardHeader>
          <CardContent className="pb-2 pt-0 sm:py-6">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                {race.series ? (
                  <SeriesBadge
                    label={race.series.short_name}
                    accentColor={race.series.accent_color}
                  />
                ) : null}
                {isCancelled && <CancelledBadge />}
                {coverage && <CoverageBadge summary={coverage} compact />}
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
                  <span>{raceDateLabel}</span>
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
            {race.series ? (
              <SeriesBadge
                label={race.series.short_name}
                accentColor={race.series.accent_color}
              />
            ) : null}
            {isCancelled && <CancelledBadge />}
          </div>
          <RaceCircuitImage
            src={race.circuit?.image_url}
            alt={race.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
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
        {coverage && <CoverageBadge summary={coverage} compact />}
        <div className="text-muted-foreground flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            <span>
              {race.circuit?.location}, {race.country}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            <span>{raceDateLabel}</span>
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
