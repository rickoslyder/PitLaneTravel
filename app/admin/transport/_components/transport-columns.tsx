"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { SelectTransportInfo } from "@/db/schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2, Copy, ArrowUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { EditTransportDialog } from "./edit-transport-dialog"
import { deleteTransportInfoAction } from "@/actions/db/transport-info-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

function TransportActionsCell({
  transport
}: {
  transport: SelectTransportInfo
}) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  async function handleDelete() {
    const { isSuccess, message } = await deleteTransportInfoAction(transport.id)
    if (isSuccess) {
      toast.success(message)
      router.refresh()
    } else {
      toast.error(message)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="size-8 p-0" variant="ghost">
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
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the transport information for "
              {transport.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export const columns: ColumnDef<SelectTransportInfo>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[200px] truncate">{name}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  },
  {
    id: "type",
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      const colorMap: Record<string, "default" | "secondary" | "destructive"> =
        {
          bus: "default",
          train: "secondary",
          taxi: "destructive",
          walk: "default",
          other: "secondary"
        }
      return <Badge variant={colorMap[type] || "default"}>{type}</Badge>
    }
  },
  {
    id: "description",
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string
      if (!description) return null
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[300px] truncate">{description}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-[300px] whitespace-pre-wrap">{description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  },
  {
    id: "options",
    accessorKey: "options",
    header: "Options",
    cell: ({ row }) => {
      const options = row.getValue("options") as string[] | null
      if (!options?.length)
        return <span className="text-muted-foreground">No options</span>

      async function copyOptions() {
        if (!options) return
        await navigator.clipboard.writeText(options.join("\n"))
        toast.success("Options copied to clipboard")
      }

      return (
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {options.map((option, i) => (
              <TooltipProvider key={i}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs">
                      {option}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{option}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-6"
            onClick={copyOptions}
          >
            <Copy className="size-3" />
            <span className="sr-only">Copy options</span>
          </Button>
        </div>
      )
    }
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return <div>{date.toLocaleDateString()}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <TransportActionsCell transport={row.original} />
  }
]
