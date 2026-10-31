"use client"

import { ColumnDef } from "@tanstack/react-table"
import { SelectRace } from "@/db/schema"
import { Badge } from "@/components/ui/badge"
import { formatRaceCalendarDate } from "@/lib/race-datetime"
import { formatFormulaESeason } from "@/lib/series"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

type RaceRow = SelectRace & {
  series?: { slug: string | null } | null
  circuit?: { timezoneId?: string | null } | null
}

export const racesColumns: ColumnDef<RaceRow>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full"
        >
          Name
          <ArrowUpDown className="ml-1 size-3" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="min-w-[200px]">{row.getValue("name")}</div>
    )
  },
  {
    id: "date",
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full"
        >
          Date
          <ArrowUpDown className="ml-1 size-3" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="min-w-[150px]">
        {formatRaceCalendarDate(
          row.getValue("date"),
          {
            month: "long",
            day: "numeric",
            year: "numeric"
          },
          row.original.circuit?.timezoneId
        )}
      </div>
    )
  },
  {
    id: "season",
    accessorKey: "season",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full"
        >
          Season
          <ArrowUpDown className="ml-1 size-3" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const season = row.original.season
      const label =
        row.original.series?.slug === "formula-e"
          ? formatFormulaESeason(season)
          : String(season)
      return <div className="min-w-16 text-center">{label}</div>
    }
  },
  {
    id: "round",
    accessorKey: "round",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full"
        >
          Round
          <ArrowUpDown className="ml-1 size-3" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="w-12 text-center">{row.getValue("round")}</div>
    )
  },
  {
    id: "country",
    accessorKey: "country",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full"
        >
          Country
          <ArrowUpDown className="ml-1 size-3" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="min-w-[120px]">{row.getValue("country")}</div>
    )
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full"
        >
          Status
          <ArrowUpDown className="ml-1 size-3" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="min-w-[100px]">
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
      </div>
    )
  },
  {
    id: "isSprintWeekend",
    accessorKey: "isSprintWeekend",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full"
        >
          Sprint?
          <ArrowUpDown className="ml-1 size-3" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="w-20 text-center">
        <Badge
          variant={row.getValue("isSprintWeekend") ? "default" : "secondary"}
        >
          {row.getValue("isSprintWeekend") ? "Yes" : "No"}
        </Badge>
      </div>
    )
  }
]
