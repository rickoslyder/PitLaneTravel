"use client"

import { useState } from "react"
import { SelectMerch } from "@/db/schema"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Plus } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { CreateMerchDialog } from "./create-merch-dialog"
import { EditMerchDialog } from "./edit-merch-dialog"
import { merchColumns } from "./merch-columns"

interface MerchTableProps {
  data: SelectMerch[]
}

export function MerchTable({ data }: MerchTableProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedMerch, setSelectedMerch] = useState<SelectMerch | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input placeholder="Filter merchandise..." className="max-w-xs" />
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 size-4" />
          Add Merchandise
        </Button>
      </div>

      <DataTable
        columns={[
          ...merchColumns,
          {
            id: "actions",
            cell: ({ row }) => (
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedMerch(row.original)
                  setIsEditDialogOpen(true)
                }}
              >
                Edit
              </Button>
            )
          }
        ]}
        data={data}
      />

      <CreateMerchDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {selectedMerch && (
        <EditMerchDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          merch={selectedMerch}
        />
      )}
    </div>
  )
}
