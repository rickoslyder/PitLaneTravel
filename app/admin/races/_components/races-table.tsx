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

interface RacesTableProps {
  data: SelectRace[]
}

export function RacesTable({ data }: RacesTableProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [selectedRace, setSelectedRace] = useState<SelectRace | null>(null)
  const [filterValue, setFilterValue] = useState("")

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteRaceAction(id)
      if (result.isSuccess) {
        toast.success("Race deleted successfully")
        window.location.reload()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to delete race")
    }
  }

  const filteredData = data.filter(race =>
    Object.values(race).some(value =>
      String(value).toLowerCase().includes(filterValue.toLowerCase())
    )
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter races..."
          className="max-w-xs"
          value={filterValue}
          onChange={e => setFilterValue(e.target.value)}
        />
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
      />

      <CreateRaceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {selectedRace && (
        <>
          <EditRaceDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            race={selectedRace}
          />
          <RaceHistoryDialog
            open={isHistoryDialogOpen}
            onOpenChange={setIsHistoryDialogOpen}
            race={selectedRace}
          />
        </>
      )}
    </div>
  )
}
