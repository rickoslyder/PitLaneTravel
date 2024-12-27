"use server"

import { Suspense } from "react"
import { PageHeader } from "@/components/page-header"
import { AttractionsTable } from "./_components/attractions-table"
import { AttractionsSkeleton } from "./_components/attractions-skeleton"
import { db } from "@/db/db"
import { localAttractionsTable, circuitsTable } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { CreateAttractionDialog } from "./_components/create-attraction-dialog"

async function AttractionsTableWrapper() {
  // Join with circuits to get circuit names
  const attractions = await db
    .select({
      id: localAttractionsTable.id,
      name: localAttractionsTable.name,
      description: localAttractionsTable.description,
      circuitId: localAttractionsTable.circuitId,
      circuitName: sql<string>`COALESCE(${circuitsTable.name}, 'Unknown')`,
      latitude: localAttractionsTable.latitude,
      longitude: localAttractionsTable.longitude,
      distance_from_circuit: localAttractionsTable.distance_from_circuit,
      distance_from_city: localAttractionsTable.distance_from_city,
      estimated_duration: localAttractionsTable.estimated_duration,
      recommended_times: localAttractionsTable.recommended_times,
      booking_required: localAttractionsTable.booking_required,
      price_range: localAttractionsTable.price_range,
      f1_relevance: localAttractionsTable.f1_relevance,
      peak_times: localAttractionsTable.peak_times,
      createdAt: localAttractionsTable.createdAt,
      updatedAt: localAttractionsTable.updatedAt
    })
    .from(localAttractionsTable)
    .leftJoin(
      circuitsTable,
      eq(localAttractionsTable.circuitId, circuitsTable.id)
    )

  return <AttractionsTable initialData={attractions} />
}

export default async function AttractionsPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Local Attractions"
          description="Manage local attractions near circuits"
        />
        <CreateAttractionDialog />
      </div>

      <Suspense fallback={<AttractionsSkeleton />}>
        <AttractionsTableWrapper />
      </Suspense>
    </div>
  )
}
