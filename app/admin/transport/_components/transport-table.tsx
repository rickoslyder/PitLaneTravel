"use server"

import { getTransportInfoAction } from "@/actions/db/transport-info-actions"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./transport-columns"

export async function TransportTable() {
  const { data: transportInfo } = await getTransportInfoAction()

  return (
    <div className="rounded-md border">
      <DataTable
        columns={columns}
        data={transportInfo || []}
        searchKey="name"
        searchPlaceholder="Search transport info..."
      />
    </div>
  )
}
