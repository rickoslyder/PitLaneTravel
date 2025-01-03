"use client"

import { ColumnDef } from "@tanstack/react-table"
import { SelectTicket } from "@/db/schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MoreHorizontal,
  Pencil,
  Copy,
  DollarSign,
  ExternalLink,
  Settings
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { EditTicketDialog } from "./edit-ticket-dialog"
import { formatTicketType } from "@/lib/utils"
import { PricingHistoryDialog } from "./pricing-history-dialog"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { TicketFeaturesCell } from "./ticket-features-cell"
import { ManageTicketFeaturesDialog } from "./manage-ticket-features-dialog"

export const columns: ColumnDef<
  SelectTicket & { race: { name: string; season: number } }
>[] = [
  {
    accessorKey: "title",
    header: "Title",
    sortingFn: "text"
  },
  {
    accessorKey: "race",
    header: "Race",
    cell: ({ row }) => {
      const race = row.original.race
      return race.name
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.race.name.localeCompare(rowB.original.race.name)
    }
  },
  {
    accessorKey: "ticketType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.ticketType
      return <Badge variant="outline">{formatTicketType(type)}</Badge>
    },
    sortingFn: "text"
  },
  {
    accessorKey: "daysIncluded",
    header: "Days Included",
    cell: ({ row }) => {
      const days = row.original.daysIncluded as Record<string, boolean>
      const includedDays = Object.entries(days)
        .filter(([_, included]) => included)
        .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1))
        .join(", ")
      return (
        <span className="text-muted-foreground text-sm">{includedDays}</span>
      )
    },
    sortingFn: (rowA, rowB) => {
      const daysA = Object.entries(
        rowA.original.daysIncluded as Record<string, boolean>
      ).filter(([_, included]) => included).length
      const daysB = Object.entries(
        rowB.original.daysIncluded as Record<string, boolean>
      ).filter(([_, included]) => included).length
      return daysA - daysB
    }
  },
  {
    accessorKey: "availability",
    header: "Availability",
    cell: ({ row }) => {
      const availability = row.getValue("availability") as string
      return (
        <Badge
          variant="secondary"
          className={
            availability === "available"
              ? "bg-green-500/10 text-green-500"
              : availability === "limited"
                ? "bg-yellow-500/10 text-yellow-500"
                : "bg-red-500/10 text-red-500"
          }
        >
          {availability.charAt(0).toUpperCase() + availability.slice(1)}
        </Badge>
      )
    },
    sortingFn: "text"
  },
  {
    accessorKey: "features",
    header: "Features",
    cell: ({ row }) => <TicketFeaturesCell ticketId={Number(row.original.id)} />
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} />
  }
]

interface ActionsCellProps {
  row: any
}

function ActionsCell({ row }: ActionsCellProps) {
  const ticket = row.original
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDuplicate = async (e: Event) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const searchParams = new URLSearchParams()
      searchParams.set("action", "create")
      searchParams.set(
        "duplicate",
        JSON.stringify({
          title: `${ticket.title} (Copy)`,
          description: ticket.description,
          ticket_type: ticket.ticketType,
          availability: ticket.availability,
          race_id: ticket.raceId,
          reseller_url: ticket.resellerUrl,
          days_included: Object.entries(
            ticket.daysIncluded as Record<string, boolean>
          )
            .filter(([_, value]) => value)
            .map(([key]) => key),
          is_child_ticket: ticket.isChildTicket
        })
      )
      await router.push(`/admin/tickets?${searchParams.toString()}`)
      toast.success("Duplicating ticket...")
    } catch (error) {
      console.error("Error duplicating ticket:", error)
      toast.error("Failed to duplicate ticket. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewRace = () => {
    window.open(`/races/${ticket.raceId}`, "_blank")
  }

  const handleViewRaceAdmin = () => {
    window.open(`/admin/races/${ticket.raceId}`, "_blank")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <EditTicketDialog ticket={ticket}>
          <DropdownMenuItem onSelect={e => e.preventDefault()}>
            <Pencil className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>
        </EditTicketDialog>
        <PricingHistoryDialog ticket={ticket}>
          <DropdownMenuItem onSelect={e => e.preventDefault()}>
            <DollarSign className="mr-2 size-4" />
            Manage Pricing
          </DropdownMenuItem>
        </PricingHistoryDialog>
        <DropdownMenuItem onSelect={handleDuplicate} disabled={isLoading}>
          <Copy className="mr-2 size-4" />
          {isLoading ? "Duplicating..." : "Duplicate"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleViewRace}>
          <ExternalLink className="mr-2 size-4" />
          View Race Page
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleViewRaceAdmin}>
          <Settings className="mr-2 size-4" />
          View Race Admin
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <ManageTicketFeaturesDialog ticket={row.original}>
            <button className="w-full text-left">Manage Features</button>
          </ManageTicketFeaturesDialog>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
