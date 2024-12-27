"use client"

import { useCallback, useMemo, useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { EditSeriesDialog } from "./edit-series-dialog"
import { deleteSupportingSeriesAction } from "@/actions/db/supporting-series-actions"

interface SupportingSeries {
  id: string
  raceId: string
  series: string
  round: number
  startTime: Date | null
  endTime: Date | null
  status: "scheduled" | "live" | "completed" | "delayed" | "cancelled" | null
  openf1SessionKey: number | null
  createdAt: Date
  updatedAt: Date
  raceName: string
}

interface SeriesTableProps {
  initialData: SupportingSeries[]
}

function ActionsCell({ series }: { series: SupportingSeries }) {
  const handleDelete = useCallback(async () => {
    try {
      const result = await deleteSupportingSeriesAction(series.id)
      if (result.isSuccess) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to delete series")
    }
  }, [series.id])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted flex size-8 p-0"
        >
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <EditSeriesDialog series={series} />
        <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function SeriesTable({ initialData }: SeriesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  const columns = useMemo<ColumnDef<SupportingSeries>[]>(
    () => [
      {
        accessorKey: "series",
        header: "Series",
        cell: ({ row }) => <div>{row.getValue("series")}</div>
      },
      {
        accessorKey: "round",
        header: "Round",
        cell: ({ row }) => <div>{row.getValue("round")}</div>
      },
      {
        accessorKey: "raceName",
        header: "Race",
        cell: ({ row }) => <div>{row.getValue("raceName")}</div>
      },
      {
        accessorKey: "startTime",
        header: "Start Time",
        cell: ({ row }) => {
          const startTime = row.getValue("startTime") as Date | null
          if (!startTime) return <div>-</div>
          return <div>{format(startTime, "MMM d, yyyy HH:mm")}</div>
        }
      },
      {
        accessorKey: "endTime",
        header: "End Time",
        cell: ({ row }) => {
          const endTime = row.getValue("endTime") as Date | null
          if (!endTime) return <div>-</div>
          return <div>{format(endTime, "MMM d, yyyy HH:mm")}</div>
        }
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as SupportingSeries["status"]
          if (!status) return <div>-</div>
          return (
            <Badge
              variant={
                status === "completed"
                  ? "default"
                  : status === "live"
                    ? "destructive"
                    : "secondary"
              }
            >
              {status}
            </Badge>
          )
        }
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => (
          <div>
            {format(row.getValue("createdAt") as Date, "MMM d, yyyy HH:mm")}
          </div>
        )
      },
      {
        id: "actions",
        cell: ({ row }) => <ActionsCell series={row.original} />
      }
    ],
    []
  )

  const table = useReactTable({
    data: initialData.map(series => ({
      ...series,
      startTime: series.startTime ? new Date(series.startTime) : null,
      endTime: series.endTime ? new Date(series.endTime) : null,
      createdAt: new Date(series.createdAt),
      updatedAt: new Date(series.updatedAt)
    })),
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter series..."
          value={(table.getColumn("series")?.getFilterValue() as string) ?? ""}
          onChange={event =>
            table.getColumn("series")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
