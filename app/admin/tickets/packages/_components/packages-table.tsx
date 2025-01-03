"use server"

import { getAllTicketPackagesAction } from "@/actions/db/ticket-packages-actions"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./packages-columns"

export async function PackagesTable() {
  const { data: packages } = await getAllTicketPackagesAction()

  return (
    <div className="rounded-md border">
      <DataTable
        columns={columns}
        data={packages || []}
        searchKey="name"
        searchPlaceholder="Search packages..."
      />
    </div>
  )
}
