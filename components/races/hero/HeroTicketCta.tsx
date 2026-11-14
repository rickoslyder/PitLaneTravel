import React from "react"
import { Calendar, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TicketListingState } from "@/components/races/tickets/ticket-availability"
import {
  PLAN_YOUR_TRIP_LABEL,
  RACE_TICKETS_CTA,
  findTicketsAccessibleName,
  planYourTripAccessibleName
} from "@/components/races/tickets/ticket-presentation"

const primaryClassName =
  "group relative bg-[#E10600] px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-[#b50500] hover:shadow-[0_0_30px_rgba(225,6,0,0.4)] sm:p-6 sm:text-base"

const quietClassName =
  "border-white/40 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-none backdrop-blur-md hover:bg-white/20 hover:text-white sm:p-6 sm:text-base"

function PrimaryShine() {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
  )
}

export function HeroTicketCta({
  listingState,
  raceName,
  onTabChange
}: {
  listingState: TicketListingState
  raceName: string
  onTabChange: (tab: string) => void
}) {
  if (listingState === "unknown") return null

  if (listingState === "empty") {
    return (
      <Button
        type="button"
        size="lg"
        className={primaryClassName}
        aria-label={planYourTripAccessibleName(raceName)}
        onClick={() => onTabChange("travel")}
      >
        <PrimaryShine />
        <Calendar className="mr-2 size-4 sm:size-5" />
        {PLAN_YOUR_TRIP_LABEL}
      </Button>
    )
  }

  return (
    <>
      <Button
        type="button"
        size="lg"
        className={primaryClassName}
        aria-label={findTicketsAccessibleName(raceName)}
        onClick={() => onTabChange("tickets")}
      >
        <PrimaryShine />
        <Ticket className="mr-2 size-4 sm:size-5" />
        {RACE_TICKETS_CTA}
      </Button>
      <Button
        type="button"
        size="lg"
        variant="outline"
        className={quietClassName}
        aria-label={planYourTripAccessibleName(raceName)}
        onClick={() => onTabChange("travel")}
      >
        <Calendar className="mr-2 size-4 sm:size-5" />
        {PLAN_YOUR_TRIP_LABEL}
      </Button>
    </>
  )
}
