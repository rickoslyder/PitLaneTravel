import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { RaceWithDetails } from "@/types/race"

interface LapRecordProps {
  circuit: NonNullable<RaceWithDetails["circuit"]>
}

export function LapRecord({ circuit }: LapRecordProps) {
  if (!circuit.details) return null

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 sm:p-4 lg:p-6">
        <CardTitle className="text-base sm:text-lg lg:text-xl">
          Lap Record
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-3 sm:space-y-4 sm:p-4 lg:space-y-6 lg:p-6">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          <div className="bg-primary/10 flex size-10 items-center justify-center rounded-full sm:size-12 lg:size-16">
            <Trophy className="text-primary size-5 sm:size-6 lg:size-8" />
          </div>
          <div>
            <div className="text-base font-bold sm:text-lg lg:text-2xl">
              {circuit.details.lap_record_time}
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              {circuit.details.lap_record_driver} (
              {circuit.details.lap_record_year})
            </div>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3 lg:space-y-4">
          <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
            <div className="text-muted-foreground text-xs sm:text-sm">
              Sector Times
            </div>
            <div className="grid grid-cols-3 gap-1 sm:gap-1.5 lg:gap-2">
              <div className="space-y-1">
                <div className="h-1 rounded-full bg-purple-500/20" />
                <div className="text-center text-[10px] sm:text-xs">
                  Sector 1
                </div>
              </div>
              <div className="space-y-1">
                <div className="h-1 rounded-full bg-green-500/20" />
                <div className="text-center text-[10px] sm:text-xs">
                  Sector 2
                </div>
              </div>
              <div className="space-y-1">
                <div className="h-1 rounded-full bg-yellow-500/20" />
                <div className="text-center text-[10px] sm:text-xs">
                  Sector 3
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
            <div className="text-muted-foreground text-xs sm:text-sm">
              Speed Zones
            </div>
            <div className="relative h-5 rounded-lg border sm:h-6 lg:h-8">
              <div className="bg-primary/20 absolute inset-y-0 left-0 w-[70%] rounded-l-lg" />
              <div className="bg-primary/10 absolute inset-y-0 right-0 w-[30%] rounded-r-lg" />
            </div>
            <div className="flex justify-between text-[10px] sm:text-xs">
              <span>High Speed</span>
              <span>Medium Speed</span>
              <span>Low Speed</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
