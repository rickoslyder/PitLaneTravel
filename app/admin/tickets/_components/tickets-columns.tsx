"use client"

import { ColumnDef } from "@tanstack/react-table"
import { SelectTicket } from "@/db/schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { EditTicketDialog } from "./edit-ticket-dialog"

export const columns: ColumnDef<SelectTicket>[] = [
  {
    accessorKey: "title",
    header: "Title"
  },
  {
    accessorKey: "ticket_type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("ticket_type")}</Badge>
    )
  },
  {
    accessorKey: "availability",
    header: "Availability",
    cell: ({ row }) => (
      <Badge
        variant={
          row.getValue("availability") === "available"
            ? "secondary"
            : "destructive"
        }
      >
        {row.getValue("availability")}
      </Badge>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const ticket = row.original

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
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
