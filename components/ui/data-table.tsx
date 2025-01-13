"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  pageSize?: number
  currentPage?: number
  onPageChange?: (page: number) => void
  onRowsSelected?: (rows: TData[]) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  pageSize = 10,
  currentPage = 0,
  onPageChange,
  onRowsSelected
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns: [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false
      },
      ...columns
    ],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination: {
        pageIndex: currentPage,
        pageSize
      }
    },
    manualPagination: true,
    pageCount: Math.ceil(data.length / pageSize),
    onPaginationChange: updater => {
      if (typeof updater === "function") {
        const state = updater({
          pageIndex: currentPage,
          pageSize
        })
        onPageChange?.(state.pageIndex)
      }
    }
  })

  // Update table when page size changes
  React.useEffect(() => {
    table.setPageSize(pageSize)
  }, [pageSize, table])

  // Update table when current page changes externally
  React.useEffect(() => {
    table.setPageIndex(currentPage)
  }, [currentPage, table])

  // Notify parent of selected rows
  React.useEffect(() => {
    if (onRowsSelected) {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map(row => row.original as TData)
      onRowsSelected(selectedRows)
    }
  }, [rowSelection, table, onRowsSelected])

  const visibleData = React.useMemo(() => {
    const start = currentPage * pageSize
    const end = start + pageSize
    return data.slice(start, end)
  }, [data, currentPage, pageSize])

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="flex items-center py-4">
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
            }
            onChange={event =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
      )}
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
            {visibleData.length ? (
              visibleData.map(row => {
                const tableRow = table
                  .getRowModel()
                  .rows.find(r => r.original === row)
                if (!tableRow) return null
                return (
                  <TableRow
                    key={tableRow.id}
                    data-state={tableRow.getIsSelected() && "selected"}
                  >
                    {tableRow.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-muted-foreground text-sm">
          Showing {visibleData.length} of {data.length} results
          <br />
          Page {currentPage + 1} of {Math.ceil(data.length / pageSize)}
          {table.getSelectedRowModel().rows.length > 0 && (
            <>
              <br />
              {table.getSelectedRowModel().rows.length} rows selected
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(0)}
            disabled={currentPage === 0}
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= Math.ceil(data.length / pageSize) - 1}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onPageChange?.(Math.ceil(data.length / pageSize) - 1)
            }
            disabled={currentPage >= Math.ceil(data.length / pageSize) - 1}
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
