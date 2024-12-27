"use client"

import { ColumnDef } from "@tanstack/react-table"
import { SelectReview } from "@/db/schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"

export const columns: ColumnDef<SelectReview>[] = [
  {
    accessorKey: "content",
    header: "Content",
    cell: ({ row }) => (
      <div className="max-w-[500px] truncate">{row.getValue("content")}</div>
    )
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("rating")} / 5</Badge>
    )
  },
  {
    accessorKey: "userId",
    header: "User",
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue("userId")}</div>
    )
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => formatDate(row.getValue("createdAt"))
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const review = row.original

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
            <DropdownMenuItem>
              <Eye className="mr-2 size-4" />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
