import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, ScrollText } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import {
  SelectRaceHistory,
  TimelineEvent,
  RecordBreaker,
  MemorableMoment
} from "@/db/schema/race-history-schema"

interface CircuitHistoryProps {
  history: SelectRaceHistory
  raceId: string
  raceSlug?: string
}

export function CircuitHistory({
  history,
  raceId,
  raceSlug
}: CircuitHistoryProps) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="text-primary size-5" />
            <CardTitle>Timeline</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-4 pl-6">
            <div className="bg-border/50 absolute inset-y-0 left-2 w-px" />

            {history.timeline.map((event: TimelineEvent, index: number) => (
              <div key={index} className="relative">
                <div className="bg-primary absolute -left-6 top-1.5 size-3 rounded-full" />
                <div className="space-y-1">
                  <div className="text-muted-foreground text-sm">
                    {event.year}
                  </div>
                  <div>{event.title}</div>
                  {event.description && (
                    <div className="text-muted-foreground text-sm">
                      {event.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ScrollText className="text-primary size-5" />
            <CardTitle>Notable Moments</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold">Record Breakers</h4>
            <div className="mt-2 space-y-2">
              {history.recordBreakers.map(
                (record: RecordBreaker, index: number) => (
                  <div key={index} className="rounded-lg border p-3">
                    <div className="text-sm font-medium">{record.title}</div>
                    <div className="text-muted-foreground mt-1">
                      {record.description}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold">Memorable Moments</h4>
            <div className="mt-2 space-y-4">
              {history.memorableMoments.map(
                (moment: MemorableMoment, index: number) => (
                  <div key={index}>
                    <div className="text-sm font-medium">
                      {moment.year}: {moment.title}
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {moment.description}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="col-span-full flex justify-center">
        <Link href={`/races/${raceSlug || raceId}/history`}>
          <Button variant="outline" size="lg" className="gap-2">
            Read Full History
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
