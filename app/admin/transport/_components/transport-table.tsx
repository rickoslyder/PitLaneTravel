"use client"

import { useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./transport-columns"
import { SelectTransportInfo } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { Download, Trash2, Filter } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { deleteTransportInfoAction } from "@/actions/db/transport-info-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface TransportTableProps {
  transportInfo: SelectTransportInfo[]
}

const transportTypes = ["bus", "train", "taxi", "walk", "other"] as const
type TransportType = (typeof transportTypes)[number]

export function TransportTable({ transportInfo }: TransportTableProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedRows, setSelectedRows] = useState<SelectTransportInfo[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<TransportType[]>([])
  const router = useRouter()

  const filteredData =
    selectedTypes.length > 0
      ? transportInfo.filter(item =>
          selectedTypes.includes(item.type as TransportType)
        )
      : transportInfo

  async function handleBulkDelete() {
    try {
      const results = await Promise.all(
        selectedRows.map(row => deleteTransportInfoAction(row.id))
      )

      const successCount = results.filter(r => r.isSuccess).length
      const failCount = results.length - successCount

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} transport options`)
      }
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} transport options`)
      }

      setSelectedRows([])
      setShowDeleteDialog(false)
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong during bulk delete")
    }
  }

  function handleExport() {
    const rows = selectedRows.length > 0 ? selectedRows : filteredData
    const csvContent = [
      // Headers
      ["Name", "Type", "Description", "Options", "Created At"].join(","),
      // Rows
      ...rows.map(row =>
        [
          `"${row.name}"`,
          row.type,
          `"${row.description || ""}"`,
          `"${row.options?.join("; ") || ""}"`,
          new Date(row.createdAt).toLocaleDateString()
        ].join(",")
      )
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute(
      "download",
      `transport-info-${new Date().toISOString().split("T")[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function toggleType(type: TransportType) {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  return (
    <div className="space-y-4">
      {selectedRows.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">
            {selectedRows.length} items selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 size-4" />
            Delete Selected
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 size-4" />
            Export Selected
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 size-4" />
                Filter Types
                {selectedTypes.length > 0 && ` (${selectedTypes.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {transportTypes.map(type => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => toggleType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
              {selectedTypes.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setSelectedTypes([])}>
                    Clear Filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 size-4" />
          Export All
        </Button>
      </div>

      <div className="rounded-md border">
        <DataTable
          columns={columns}
          data={filteredData}
          searchKey="name"
          searchPlaceholder="Search transport info..."
          pageSize={10}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onRowsSelected={setSelectedRows}
        />
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedRows.length} transport
              options. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedRows.length} items
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
