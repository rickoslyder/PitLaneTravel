"use client"

import { useState } from "react"
import { SelectRace } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash, History } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { racesColumns } from "./races-columns"
import { CreateRaceDialog } from "./create-race-dialog"
import { EditRaceDialog } from "./edit-race-dialog"
import { toast } from "sonner"
import { deleteRaceAction } from "@/actions/db/races-actions"
import { RaceHistoryDialog } from "./race-history-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

interface RacesTableProps {
  data: SelectRace[]
}

export function RacesTable({ data: initialData }: RacesTableProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [selectedRace, setSelectedRace] = useState<SelectRace | null>(null)
  const [filterValue, setFilterValue] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(0)
  const [data, setData] = useState(initialData)

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteRaceAction(id)
      if (result.isSuccess) {
        toast.success("Race deleted successfully")
        setData(prevData => prevData.filter(race => race.id !== id))
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to delete race")
    }
  }

  const handleRefresh = async () => {
    try {
      const response = await fetch("/api/races")
      const { data } = await response.json()
      const parsedData = data.map((race: any) => ({
        ...race,
        date: new Date(race.date),
        createdAt: new Date(race.createdAt),
        updatedAt: new Date(race.updatedAt),
        weekendStart: race.weekendStart ? new Date(race.weekendStart) : null,
        weekendEnd: race.weekendEnd ? new Date(race.weekendEnd) : null,
        circuit: race.circuit
          ? {
              ...race.circuit,
              createdAt: new Date(race.circuit.createdAt),
              updatedAt: new Date(race.circuit.updatedAt)
            }
          : null
      }))
      setData(parsedData)
    } catch (error) {
      toast.error("Failed to refresh races")
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(Number(newSize))
    setCurrentPage(0) // Reset to first page when changing page size
  }

  const filteredData = data.filter(race =>
    Object.values(race).some(value =>
      String(value).toLowerCase().includes(filterValue.toLowerCase())
    )
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Filter races..."
            className="max-w-xs"
            value={filterValue}
            onChange={e => setFilterValue(e.target.value)}
          />
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select page size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 size-4" />
          Add Race
        </Button>
      </div>

      <DataTable
        columns={[
          ...racesColumns,
          {
            id: "actions",
            cell: ({ row }) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedRace(row.original)
                    setIsEditDialogOpen(true)
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedRace(row.original)
                    setIsHistoryDialogOpen(true)
                  }}
                >
                  <History className="mr-2 size-4" />
                  History
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(row.original.id)}
                >
                  <Trash className="text-destructive size-4" />
                </Button>
              </div>
            )
          }
        ]}
        data={[...filteredData].sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        )}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      <CreateRaceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleRefresh}
      />

      {selectedRace && (
        <>
          <EditRaceDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            race={selectedRace}
            onSuccess={handleRefresh}
          />
          <RaceHistoryDialog
            open={isHistoryDialogOpen}
            onOpenChange={setIsHistoryDialogOpen}
            race={selectedRace}
            onSuccess={handleRefresh}
          />
        </>
      )}
    </div>
  )
}
