import React from "react"
import { Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  SEE_TRAVEL_OPTIONS_LABEL,
  type TicketListingState
} from "@/components/races/tickets/ticket-availability"

export function HeroTicketCta({
  listingState,
  onTabChange
}: {
  listingState: TicketListingState
  onTabChange: (tab: string) => void
}) {
  if (listingState === "unknown") return null

  if (listingState === "empty") {
    return (
      <Button
        size="lg"
        variant="outline"
        className="px-4 py-2 text-sm font-medium sm:p-6 sm:text-base"
        onClick={() => onTabChange("travel")}
      >
        {SEE_TRAVEL_OPTIONS_LABEL}
      </Button>
    )
  }

  return (
    <Button
      size="lg"
      className="group relative bg-[#E10600] px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 hover:bg-[#b50500] hover:shadow-[0_0_30px_rgba(225,6,0,0.4)] sm:p-6 sm:text-base"
      onClick={() => onTabChange("tickets")}
    >
      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <Ticket className="mr-2 size-4 sm:size-5" />
      Book Now
    </Button>
  )
}
