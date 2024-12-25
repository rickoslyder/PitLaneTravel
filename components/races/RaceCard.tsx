"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { RaceWithCircuit } from "@/types/database"
import { format } from "date-fns"
import { CalendarDays, Flag, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface RaceCardProps {
  /** The race to display */
  race: RaceWithCircuit
  /** The variant of the card */
  variant?: "grid" | "list"
  /** Additional class names */
  className?: string
  /** Callback when the card is clicked */
  onClick?: () => void
}

export function RaceCard({
  race,
  variant = "grid",
  className,
  onClick
}: RaceCardProps) {
  const raceDate = new Date(race.date)

  if (variant === "list") {
    return (
      <Card
        className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between",
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
              <h3 className="font-semibold">{race.name}</h3>
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
    <Card className={cn("group cursor-pointer", className)} onClick={onClick}>
      <CardHeader className="pb-4">
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
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
        <h3 className="line-clamp-2 font-semibold">{race.name}</h3>
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
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onClick}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
