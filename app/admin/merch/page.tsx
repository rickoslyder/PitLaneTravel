"use server"

import { db } from "@/db/db"
import { merchTable } from "@/db/schema"
import { MerchTable } from "./_components/merch-table"

export default async function MerchPage() {
  const merch = await db.select().from(merchTable)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Merchandise</h2>
        <p className="text-muted-foreground">
          Manage race merchandise and track inventory
        </p>
      </div>

      <MerchTable data={merch} />
    </div>
  )
}
