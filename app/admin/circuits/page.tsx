"use server"

import { db } from "@/db/db"
import { circuitsTable } from "@/db/schema"
import { desc } from "drizzle-orm"
import { SelectCircuit } from "@/db/schema"
import CircuitsTable from "./_components/circuits-table"
import { Input } from "@/components/ui/input"
import { Suspense } from "react"
import { Card } from "@/components/ui/card"

function TableSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="animate-pulse p-6">
        <div className="h-8 w-64 rounded bg-gray-200" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 rounded bg-gray-200" />
          ))}
        </div>
      </div>
    </Card>
  )
}

async function CircuitsTableWithData() {
  const circuits = await db
    .select()
    .from(circuitsTable)
    .orderBy(desc(circuitsTable.name))

  return <CircuitsTable circuits={circuits} />
}

export default async function CircuitsAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Circuits</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search circuits..."
            className="max-w-sm"
          />
        </div>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <CircuitsTableWithData />
      </Suspense>
    </div>
  )
}
