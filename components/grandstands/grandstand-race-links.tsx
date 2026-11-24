import Link from "next/link"
import { Ticket } from "lucide-react"
import {
  GRANDSTAND_TICKETS_NOTE,
  TICKETS_FOR_THIS_RACE_LABEL,
  partOfRaceGuideLabel,
  type UpcomingRaceLink
} from "@/lib/circuit-race-links"

export function GrandstandRaceGuideLink({
  race
}: {
  race: UpcomingRaceLink | null
}) {
  if (!race) return null
  return (
    <p className="text-sm">
      <Link
        href={race.href}
        className="text-muted-foreground hover:text-foreground underline underline-offset-4"
      >
        {partOfRaceGuideLabel(race.name)}
      </Link>
    </p>
  )
}

export function GrandstandTicketsCta({
  race
}: {
  race: UpcomingRaceLink | null
}) {
  if (!race) return null
  return (
    <div className="bg-card flex max-w-xl flex-col items-start gap-2 rounded-lg border p-5">
      <Link
        href={race.ticketsHref}
        className="bg-brand text-brand-foreground hover:bg-brand-hover inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium"
      >
        <Ticket className="size-4" aria-hidden="true" />
        {TICKETS_FOR_THIS_RACE_LABEL}
      </Link>
      <p className="text-muted-foreground text-sm">{GRANDSTAND_TICKETS_NOTE}</p>
    </div>
  )
}
