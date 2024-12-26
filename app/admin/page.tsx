"use server"

import { db } from "@/db/db"
import { circuitsTable, circuitLocationsTable } from "@/db/schema"
import { count, sql } from "drizzle-orm"

export default async function AdminPage() {
  const [circuitCount] = await db.select({ value: count() }).from(circuitsTable)

  const [airportCount] = await db
    .select({ value: count() })
    .from(circuitLocationsTable)
    .where(sql`type = 'airport'`)

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-2 text-lg font-semibold">Circuits</h3>
          <p className="text-3xl font-bold">{circuitCount.value}</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-2 text-lg font-semibold">Airports</h3>
          <p className="text-3xl font-bold">{airportCount.value}</p>
        </div>
      </div>
    </div>
  )
}
