"use server"

import { db } from "@/db/db"
import { circuitsTable, circuitLocationsTable } from "@/db/schema"
import { count, sql } from "drizzle-orm"
import { Card } from "@/components/ui/card"
import { Circle as CircuitIcon, Plane as PlaneIcon } from "lucide-react"
import { Suspense } from "react"

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {[1, 2].map(i => (
        <Card key={i} className="animate-pulse p-6">
          <div className="h-6 w-24 rounded bg-gray-200" />
          <div className="mt-2 h-8 w-16 rounded bg-gray-200" />
        </Card>
      ))}
    </div>
  )
}

async function StatsCards() {
  const [circuitCount] = await db.select({ value: count() }).from(circuitsTable)

  const [airportCount] = await db
    .select({ value: count() })
    .from(circuitLocationsTable)
    .where(sql`type = 'airport'`)

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <CircuitIcon className="size-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Total Circuits
          </h3>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-3xl font-bold text-gray-900">
            {circuitCount.value}
          </p>
          <span className="text-sm text-gray-500">circuits</span>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2">
          <PlaneIcon className="size-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Total Airports
          </h3>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-3xl font-bold text-gray-900">
            {airportCount.value}
          </p>
          <span className="text-sm text-gray-500">airports</span>
        </div>
      </Card>
    </div>
  )
}

export default async function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsCards />
      </Suspense>
    </div>
  )
}
