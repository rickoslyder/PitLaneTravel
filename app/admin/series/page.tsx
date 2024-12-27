"use server"

import { db } from "@/db/db"
import { racesTable, supportingSeriesTable } from "@/db/schema"
import { PageHeader } from "@/components/ui/page-header"
import { SeriesTable } from "./_components/series-table"
import { SeriesSkeleton } from "./_components/series-skeleton"
import { CreateSeriesDialog } from "./_components/create-series-dialog"
import { Suspense } from "react"
import { eq } from "drizzle-orm"

async function SeriesTableWrapper() {
  const series = await db
    .select({
      id: supportingSeriesTable.id,
      raceId: supportingSeriesTable.raceId,
      series: supportingSeriesTable.series,
      round: supportingSeriesTable.round,
      startTime: supportingSeriesTable.startTime,
      endTime: supportingSeriesTable.endTime,
      status: supportingSeriesTable.status,
      openf1SessionKey: supportingSeriesTable.openf1SessionKey,
      createdAt: supportingSeriesTable.createdAt,
      updatedAt: supportingSeriesTable.updatedAt,
      raceName: racesTable.name
    })
    .from(supportingSeriesTable)
    .leftJoin(racesTable, eq(supportingSeriesTable.raceId, racesTable.id))
    .orderBy(supportingSeriesTable.series)

  return (
    <SeriesTable
      initialData={series.map(s => ({
        ...s,
        raceName: s.raceName || "Unknown Race"
      }))}
    />
  )
}

export default async function SeriesPage() {
  return (
    <div className="container space-y-4 py-4">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Supporting Series"
          description="Manage supporting series for races"
        />
        <CreateSeriesDialog />
      </div>

      <Suspense fallback={<SeriesSkeleton />}>
        <SeriesTableWrapper />
      </Suspense>
    </div>
  )
}
