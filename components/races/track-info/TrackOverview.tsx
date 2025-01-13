import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RaceWithDetails } from "@/types/race"

interface TrackOverviewProps {
  circuit: NonNullable<RaceWithDetails["circuit"]>
}

export function TrackOverview({ circuit }: TrackOverviewProps) {
  if (!circuit.details) return null

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 sm:p-4 lg:p-6">
        <CardTitle className="text-base sm:text-lg lg:text-xl">
          Track Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-3 sm:space-y-4 sm:p-4 lg:space-y-6 lg:p-6">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
          <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
            <div className="text-muted-foreground text-xs sm:text-sm">
              Length
            </div>
            <div className="flex items-baseline gap-1">
              <div className="text-lg font-bold sm:text-xl lg:text-3xl">
                {circuit.details.length}
              </div>
              <div className="text-muted-foreground text-xs sm:text-sm">km</div>
            </div>
          </div>
          <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
            <div className="text-muted-foreground text-xs sm:text-sm">
              Corners
            </div>
            <div className="flex items-baseline gap-1">
              <div className="text-lg font-bold sm:text-xl lg:text-3xl">
                {circuit.details.corners}
              </div>
              <div className="text-muted-foreground text-xs sm:text-sm">
                turns
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
          <div className="text-muted-foreground text-xs sm:text-sm">
            DRS Zones
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {Array.from({ length: circuit.details.drs_zones }).map((_, i) => (
              <div
                key={i}
                className="bg-primary/20 border-primary/30 h-5 w-7 rounded-md border sm:h-6 sm:w-8 lg:h-8 lg:w-12"
              />
            ))}
          </div>
        </div>

        <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
          <div className="text-muted-foreground text-xs sm:text-sm">
            Track Characteristics
          </div>
          <div className="grid grid-cols-3 gap-1 sm:gap-1.5 lg:gap-2">
            <div className="flex flex-col items-center rounded-lg border p-1 sm:p-1.5 lg:p-2">
              <div className="text-primary text-sm sm:text-base lg:text-xl">
                70%
              </div>
              <div className="text-muted-foreground text-center text-[10px] sm:text-xs">
                Full Throttle
              </div>
            </div>
            <div className="flex flex-col items-center rounded-lg border p-1 sm:p-1.5 lg:p-2">
              <div className="text-primary text-sm sm:text-base lg:text-xl">
                44
              </div>
              <div className="text-muted-foreground text-center text-[10px] sm:text-xs">
                Gear Changes
              </div>
            </div>
            <div className="flex flex-col items-center rounded-lg border p-1 sm:p-1.5 lg:p-2">
              <div className="text-primary text-sm sm:text-base lg:text-xl">
                320
              </div>
              <div className="text-muted-foreground text-center text-[10px] sm:text-xs">
                Top Speed km/h
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
