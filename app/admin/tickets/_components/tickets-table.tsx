"use server"

import { getTicketsAction } from "@/actions/db/tickets-actions"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./tickets-columns"

export async function TicketsTable() {
  const { data: tickets } = await getTicketsAction()

  return (
    <div className="rounded-md border">
      <DataTable
        columns={columns}
        data={tickets || []}
        searchKey="title"
        searchPlaceholder="Search tickets..."
      />
    </div>
  )
}
