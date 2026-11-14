import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { TicketListingState } from "@/components/races/tickets/ticket-availability"
import {
  PLAN_YOUR_TRIP_LABEL,
  RACE_TICKETS_CTA,
  TICKETS_NOT_LISTED_NOTE,
  findTicketsAccessibleName,
  planYourTripAccessibleName
} from "@/components/races/tickets/ticket-presentation"

export function RaceCardCtas({
  raceName,
  raceHref,
  listingState,
  cancelled = false,
  fullWidth = true,
  onViewDetails
}: {
  raceName: string
  raceHref: string
  listingState?: TicketListingState
  cancelled?: boolean
  fullWidth?: boolean
  onViewDetails?: () => void
}) {
  const width = fullWidth ? "w-full" : undefined

  if (listingState === "listed") {
    return (
      <div
        className="flex w-full flex-col gap-2"
        data-race-card-ctas=""
        onClick={event => event.stopPropagation()}
      >
        <Button asChild className={width}>
          <Link
            href={`${raceHref}?tab=tickets`}
            aria-label={findTicketsAccessibleName(raceName)}
          >
            {RACE_TICKETS_CTA}
          </Link>
        </Button>
        <Button asChild variant="outline" className={width}>
          <Link
            href={`${raceHref}?tab=travel`}
            aria-label={planYourTripAccessibleName(raceName)}
          >
            {PLAN_YOUR_TRIP_LABEL}
          </Link>
        </Button>
      </div>
    )
  }

  if (listingState === "empty") {
    return (
      <div
        className="flex w-full flex-col gap-2"
        data-race-card-ctas=""
        onClick={event => event.stopPropagation()}
      >
        <Button asChild className={width}>
          <Link
            href={`${raceHref}?tab=travel`}
            aria-label={planYourTripAccessibleName(raceName)}
          >
            {PLAN_YOUR_TRIP_LABEL}
          </Link>
        </Button>
        <p className="text-muted-foreground text-center text-xs leading-5">
          {TICKETS_NOT_LISTED_NOTE}
        </p>
      </div>
    )
  }

  return (
    <Button
      className={width}
      variant={cancelled ? "outline" : "default"}
      onClick={onViewDetails}
    >
      View Details
    </Button>
  )
}
