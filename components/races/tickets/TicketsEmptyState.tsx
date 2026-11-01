import React from "react"
import Link from "next/link"
import { Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  EMPTY_TICKETS_BUTTON_HREF,
  EMPTY_TICKETS_BUTTON_LABEL,
  emptyTicketsMessage,
  plainOfficialTicketHref
} from "./ticket-availability"

export function TicketsEmptyState({
  raceName,
  officialTicketUrl
}: {
  raceName: string
  officialTicketUrl?: string | null
}) {
  const officialHref = plainOfficialTicketHref(officialTicketUrl)

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
      <div className="bg-muted rounded-full p-3">
        <Ticket className="text-muted-foreground size-6" aria-hidden="true" />
      </div>
      <p className="max-w-md text-sm leading-6 text-muted-foreground">
        {emptyTicketsMessage(raceName)}
      </p>
      <Button asChild variant="outline">
        <Link href={EMPTY_TICKETS_BUTTON_HREF}>
          {EMPTY_TICKETS_BUTTON_LABEL}
        </Link>
      </Button>
      {officialHref ? (
        <a href={officialHref} rel="noopener noreferrer">
          {officialHref}
        </a>
      ) : null}
    </div>
  )
}
