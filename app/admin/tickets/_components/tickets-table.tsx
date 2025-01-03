"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnFiltersState,
  SortingState
} from "@tanstack/react-table"
import { getTicketsAction } from "@/actions/db/tickets-actions"
import { columns } from "./tickets-columns"
import { formatTicketType } from "@/lib/utils"
import { SelectTicket } from "@/db/schema"
import { ArrowUpDown, ArrowDown, ArrowUp, X } from "lucide-react"

type TicketWithRace = SelectTicket & { race: { name: string; season: number } }

export function TicketsTable() {
  const [data, setData] = useState<TicketWithRace[]>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])

  useEffect(() => {
    async function fetchData() {
      const result = await getTicketsAction()
      if (result.isSuccess) {
        setData(result.data)
      }
    }
    fetchData()
  }, [])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      globalFilter,
      sorting
    }
  })

  // Get unique values for filters
  const races = Array.from(new Set(data.map(ticket => ticket.race.name)))
  const types = ["grandstand", "general", "vip"]
  const availabilityOptions = ["available", "limited", "sold_out"]
  const days = ["thursday", "friday", "saturday", "sunday"]

  const resetFilters = () => {
    setColumnFilters([])
    setGlobalFilter("")
    setSorting([])
  }

  const hasActiveFilters =
    columnFilters.length > 0 || globalFilter !== "" || sorting.length > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Input
              placeholder="Search tickets..."
              value={globalFilter ?? ""}
              onChange={event => setGlobalFilter(event.target.value)}
              className="max-w-xs"
            />
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="h-9 px-2 lg:px-3"
              >
                Reset
                <X className="ml-2 size-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            onValueChange={value =>
              table
                .getColumn("race")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by race" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All races</SelectItem>
              {races.map(race => (
                <SelectItem key={race} value={race}>
                  {race}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={value =>
              table
                .getColumn("ticketType")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {types.map(type => (
                <SelectItem key={type} value={type}>
                  {formatTicketType(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={value =>
              table
                .getColumn("availability")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All availability</SelectItem>
              {availabilityOptions.map(option => (
                <SelectItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={value =>
              table
                .getColumn("daysIncluded")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All days</SelectItem>
              {days.map(day => (
                <SelectItem key={day} value={day}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const isSorted = header.column.getIsSorted()
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <Button
                          variant="ghost"
                          onClick={() => header.column.toggleSorting()}
                          className="-ml-4 hover:bg-transparent"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {isSorted ? (
                            isSorted === "asc" ? (
                              <ArrowUp className="ml-2 size-4" />
                            ) : (
                              <ArrowDown className="ml-2 size-4" />
                            )
                          ) : (
                            <ArrowUpDown className="ml-2 size-4 opacity-50" />
                          )}
                        </Button>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No tickets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
