"use client"

import { ColumnDef } from "@tanstack/react-table"
import { SelectTicketFeature } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash, ArrowUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { EditFeatureDialog } from "./edit-feature-dialog"
import { DeleteFeatureDialog } from "./delete-feature-dialog"
import { Switch } from "@/components/ui/switch"
import { toggleTicketFeatureAction } from "@/actions/db/ticket-features-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

function StatusCell({
  feature,
  isActive
}: {
  feature: SelectTicketFeature
  isActive: boolean
}) {
  const router = useRouter()

  const onToggle = async () => {
    try {
      const result = await toggleTicketFeatureAction(feature.id, !isActive)
      if (result.isSuccess) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to toggle feature status")
    }
  }

  return <Switch checked={!!isActive} onCheckedChange={onToggle} />
}

export const columns: ColumnDef<SelectTicketFeature>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    )
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Description
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    )
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Category
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("category")}</Badge>
    )
  },
  {
    accessorKey: "featureType",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Type
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("featureType")}</Badge>
    )
  },
  {
    accessorKey: "displayPriority",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Priority
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-mono">{row.getValue("displayPriority")}</div>
    )
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const feature = row.original
      const isActive = row.getValue("isActive")
      return <StatusCell feature={feature} isActive={!!isActive} />
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const feature = row.original

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
            <EditFeatureDialog feature={feature}>
              <DropdownMenuItem onSelect={e => e.preventDefault()}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
            </EditFeatureDialog>
            <DeleteFeatureDialog feature={feature}>
              <DropdownMenuItem
                onSelect={e => e.preventDefault()}
                className="text-destructive"
              >
                <Trash className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DeleteFeatureDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
