"use client"

import { ColumnDef } from "@tanstack/react-table"
import { SelectTransportInfo } from "@/db/schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { EditTransportDialog } from "./edit-transport-dialog"

export const columns: ColumnDef<SelectTransportInfo>[] = [
  {
    accessorKey: "name",
    header: "Name"
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <Badge variant="outline">{row.getValue("type")}</Badge>
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[500px] truncate">
        {row.getValue("description")}
      </div>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const transport = row.original

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
            <EditTransportDialog transport={transport}>
              <DropdownMenuItem onSelect={e => e.preventDefault()}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
            </EditTransportDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
