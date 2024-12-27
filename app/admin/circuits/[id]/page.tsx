"use server"

import { db } from "@/db/db"
import { circuitsTable, circuitLocationsTable } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import CircuitForm from "./_components/circuit-form"
import LocationsTable from "./_components/locations-table"
import { Card } from "@/components/ui/card"
import { Circle as CircuitIcon } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CircuitAdminPage({
  params,
  searchParams
}: PageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CircuitIcon className="size-6 text-blue-500" />
        <h2 className="text-2xl font-bold">{circuit.name}</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Circuit Details</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">ID:</span> {circuit.id}
            </div>
            <div>
              <span className="font-medium">Country:</span> {circuit.country}
            </div>
            <div>
              <span className="font-medium">Created:</span>{" "}
              {circuit.createdAt.toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{" "}
              {circuit.updatedAt.toLocaleDateString()}
            </div>
          </div>
        </Card>

        <CircuitForm circuit={circuit} />
      </div>

      <LocationsTable
        locations={locations}
        circuitId={circuit.id}
        circuit={circuit}
      />
    </div>
  )
}
