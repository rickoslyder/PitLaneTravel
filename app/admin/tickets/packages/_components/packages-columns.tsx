"use client"

import { ColumnDef } from "@tanstack/react-table"
import { SelectTicketPackage } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash, Ticket } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { EditPackageDialog } from "./edit-package-dialog"
import { DeletePackageDialog } from "./delete-package-dialog"
import { ManagePackageTicketsDialog } from "./manage-package-tickets-dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface PackageWithRace extends SelectTicketPackage {
  race: {
    name: string
    date: Date
    season: number
    round: number
    country: string
  }
}

export const columns: ColumnDef<PackageWithRace>[] = [
  {
    accessorKey: "name",
    header: "Name"
  },
  {
    accessorKey: "race.name",
    header: "Race"
  },
  {
    accessorKey: "race.date",
    header: "Race Date",
    cell: ({ row }) =>
      format(new Date(row.getValue("race.date")), "MMM d, yyyy")
  },
  {
    accessorKey: "packageType",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("packageType")}</Badge>
    )
  },
  {
    accessorKey: "basePrice",
    header: "Base Price",
    cell: ({ row }) => (
      <div className="font-mono">
        {row.original.currency} {row.getValue("basePrice")}
      </div>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const package_ = row.original

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
            <ManagePackageTicketsDialog package_={package_}>
              <DropdownMenuItem onSelect={e => e.preventDefault()}>
                <Ticket className="mr-2 size-4" />
                Manage Tickets
              </DropdownMenuItem>
            </ManagePackageTicketsDialog>
            <EditPackageDialog package_={package_}>
              <DropdownMenuItem onSelect={e => e.preventDefault()}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
            </EditPackageDialog>
            <DeletePackageDialog package_={package_}>
              <DropdownMenuItem onSelect={e => e.preventDefault()}>
                <Trash className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DeletePackageDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
