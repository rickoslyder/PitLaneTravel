import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RaceWithDetails } from "@/types/race"

interface TrackOverviewProps {
  circuit: NonNullable<RaceWithDetails["circuit"]>
}

export function trackOverviewHasData(
  details: NonNullable<RaceWithDetails["circuit"]>["details"]
): boolean {
  if (!details) return false
  return details.length > 0 || details.corners > 0 || details.drs_zones > 0
}

export function TrackOverview({ circuit }: TrackOverviewProps) {
  if (!trackOverviewHasData(circuit.details)) return null
  const details = circuit.details!

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 sm:p-4 lg:p-6">
        <CardTitle className="text-base sm:text-lg lg:text-xl">
          Track Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-3 sm:space-y-4 sm:p-4 lg:space-y-6 lg:p-6">
        {(details.length > 0 || details.corners > 0) && (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
            {details.length > 0 && (
              <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
                <div className="text-muted-foreground text-xs sm:text-sm">
                  Length
                </div>
                <div className="flex items-baseline gap-1">
                  <div className="text-lg font-bold sm:text-xl lg:text-3xl">
                    {details.length}
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm">
                    km
                  </div>
                </div>
              </div>
            )}
            {details.corners > 0 && (
              <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
                <div className="text-muted-foreground text-xs sm:text-sm">
                  Corners
                </div>
                <div className="flex items-baseline gap-1">
                  <div className="text-lg font-bold sm:text-xl lg:text-3xl">
                    {details.corners}
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm">
                    turns
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {details.drs_zones > 0 && (
          <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
            <div className="text-muted-foreground text-xs sm:text-sm">
              DRS Zones
            </div>
            <div className="text-lg font-bold sm:text-xl lg:text-3xl">
              {details.drs_zones}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
