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

export function OfficialTicketLink({
  href,
  label,
  note
}: {
  href: string
  label: string
  note: string
}) {
  const safeHref = plainOfficialTicketHref(href)
  if (!safeHref) return null

  return (
    <div className="space-y-2" data-official-ticket-store="">
      <a href={safeHref} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
      <p className="max-w-md text-sm leading-6 text-muted-foreground">{note}</p>
    </div>
  )
}

export function TicketsEmptyState({
  raceName,
  officialTicketUrl,
  officialLinkLabel,
  officialLinkNote
}: {
  raceName: string
  officialTicketUrl?: string | null
  officialLinkLabel?: string | null
  officialLinkNote?: string | null
}) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
      <div className="bg-muted rounded-full p-3">
        <Ticket className="text-muted-foreground size-6" aria-hidden="true" />
      </div>
      <p className="max-w-md text-sm leading-6 text-muted-foreground">
        {emptyTicketsMessage(raceName)}
      </p>
      {officialTicketUrl && officialLinkLabel && officialLinkNote ? (
        <OfficialTicketLink
          href={officialTicketUrl}
          label={officialLinkLabel}
          note={officialLinkNote}
        />
      ) : null}
      <Button asChild variant="outline">
        <Link href={EMPTY_TICKETS_BUTTON_HREF}>
          {EMPTY_TICKETS_BUTTON_LABEL}
        </Link>
      </Button>
    </div>
  )
}
