import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { RaceWithDetails } from "@/types/race"

interface LapRecordProps {
  circuit: NonNullable<RaceWithDetails["circuit"]>
}

export function lapRecordHasData(
  details: NonNullable<RaceWithDetails["circuit"]>["details"]
): boolean {
  if (!details) return false
  return Boolean(details.lap_record_time || details.lap_record_driver)
}

export function LapRecord({ circuit }: LapRecordProps) {
  if (!lapRecordHasData(circuit.details)) return null
  const details = circuit.details!

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
            {details.lap_record_time && (
              <div className="text-base font-bold sm:text-lg lg:text-2xl">
                {details.lap_record_time}
              </div>
            )}
            {(details.lap_record_driver || details.lap_record_year) && (
              <div className="text-muted-foreground text-xs sm:text-sm">
                {details.lap_record_driver}
                {details.lap_record_year ? ` (${details.lap_record_year})` : ""}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
