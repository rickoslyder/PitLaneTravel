"use server"

import { db } from "@/db/db"
import { circuitsTable, circuitLocationsTable } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import CircuitForm from "./_components/circuit-form"
import LocationsTable from "./_components/locations-table"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CircuitAdminPage({
  params,
  searchParams
}: PageProps) {
  const resolvedParams = await params
  const [circuit] = await db
    .select()
    .from(circuitsTable)
    .where(eq(circuitsTable.id, resolvedParams.id))

  if (!circuit) {
    notFound()
  }

  const locations = await db
    .select()
    .from(circuitLocationsTable)
    .where(eq(circuitLocationsTable.circuitId, circuit.id))

  return (
    <div>
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Edit Circuit</h2>
        <CircuitForm circuit={circuit} />
      </div>

      <div>
        <h3 className="mb-4 text-xl font-bold">Locations</h3>
        <LocationsTable locations={locations} circuitId={circuit.id} />
      </div>
    </div>
  )
}
