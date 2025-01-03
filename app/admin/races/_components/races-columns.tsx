"use client"

import { ColumnDef } from "@tanstack/react-table"
import { SelectRace } from "@/db/schema"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export const racesColumns: ColumnDef<SelectRace>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      )
    }
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      )
    },
    cell: ({ row }) => format(new Date(row.getValue("date")), "PPP")
  },
  {
    accessorKey: "season",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Season
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      )
    }
  },
  {
    accessorKey: "round",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Round
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      )
    }
  },
  {
    accessorKey: "country",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Country
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      )
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <Badge
        variant={
          row.getValue("status") === "upcoming"
            ? "default"
            : row.getValue("status") === "completed"
              ? "secondary"
              : "destructive"
        }
        className="capitalize"
      >
        {row.getValue("status")}
      </Badge>
    )
  },
  {
    accessorKey: "isSprintWeekend",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sprint Weekend
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <Badge
        variant={row.getValue("isSprintWeekend") ? "default" : "secondary"}
      >
        {row.getValue("isSprintWeekend") ? "Yes" : "No"}
      </Badge>
    )
  }
]
