"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { SeriesCalendarRace } from "@/lib/series-card-image"
import { CalendarDays, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatRaceCalendarDate } from "@/lib/race-datetime"
import { raceHasFinished } from "@/lib/finished-race"
import { RaceCircuitImage } from "@/components/races/race-circuit-image"
import { raceCardImage } from "@/lib/race-series-image"
import { CoverageBadge } from "@/components/coverage/coverage-badge"
import { SeriesBadge } from "@/components/series/series-badge"
import type { PublicCoverageSummary } from "@/lib/public-coverage"
import type { TicketListingState } from "@/components/races/tickets/ticket-availability"
import { RaceCardCtas } from "@/components/races/race-card-ctas"

interface RaceCardProps {
  /** The race to display */
  race: SeriesCalendarRace
  /** The variant of the card */
  variant?: "grid" | "list"
  /** Additional class names */
  className?: string
  /** Callback when the card is clicked */
  onClick?: () => void
  /** Safe public coverage summary for this race */
  coverage?: PublicCoverageSummary
  /** Preload the photo when this card is the largest above-the-fold image. */
  imagePriority?: boolean
  /** Override the grid image sizes. Series pages pass the real frame width. */
  imageSizes?: string
  /** Ticket rows for this race. Omitted keeps the details button. */
  listingState?: TicketListingState
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
  coverage,
  imagePriority = false,
  imageSizes,
  listingState
}: RaceCardProps) {
  const raceDateLabel = formatRaceCalendarDate(
    race.date,
    undefined,
    race.circuit?.timezone_id
  )
  const isCancelled = race.status === "cancelled"
  const finished = raceHasFinished(race, new Date())
  const cardListingState = isCancelled || finished ? undefined : listingState
  const raceHref = `/races/${race.slug || race.id}`
  const image = raceCardImage(race)

  if (variant === "list") {
    return (
      <Card
        data-race-card=""
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
                src={image.src}
                alt={image.alt}
                fill
                sizes="80px"
                className="object-cover"
                compact
                credit={image.credit}
                fallback={image.fallback}
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
          <RaceCardCtas
            raceName={race.name}
            raceHref={raceHref}
            listingState={cardListingState}
            cancelled={isCancelled}
            fullWidth={false}
            onViewDetails={onClick}
          />
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card
      data-race-card=""
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
            src={image.src}
            alt={image.alt}
            fill
            priority={imagePriority}
            sizes={
              imageSizes ??
              "(max-width: 640px) calc(100vw - 8rem), (max-width: 1024px) 50vw, 33vw"
            }
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            credit={image.credit}
            fallback={image.fallback}
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
        <RaceCardCtas
          raceName={race.name}
          raceHref={raceHref}
          listingState={cardListingState}
          cancelled={isCancelled}
          onViewDetails={onClick}
        />
      </CardFooter>
    </Card>
  )
}
