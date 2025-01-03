"use client"

import { ColumnDef } from "@tanstack/react-table"
import { SelectMerch } from "@/db/schema"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"

export const merchColumns: ColumnDef<SelectMerch>[] = [
  {
    accessorKey: "name",
    header: "Name"
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.getValue("category")}
      </Badge>
    )
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      const currency = row.original.currency
      return formatPrice(price, currency)
    }
  },
  {
    accessorKey: "inStock",
    header: "Stock Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.getValue("inStock") === "available" ? "default" : "secondary"
        }
      >
        {row.getValue("inStock")}
      </Badge>
    )
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[500px] truncate">
        {row.getValue("description")}
      </div>
    )
  }
]
