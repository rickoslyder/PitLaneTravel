"use server"

import { db } from "@/db/db"
import { circuitLocationsTable, circuitsTable } from "@/db/schema"
import { eq } from "drizzle-orm"
import AirportsTable from "./_components/airports-table"

export default async function AirportsAdminPage() {
  const airports = await db
    .select({
      id: circuitLocationsTable.id,
      name: circuitLocationsTable.name,
      airportCode: circuitLocationsTable.airportCode,
      latitude: circuitLocationsTable.latitude,
      longitude: circuitLocationsTable.longitude,
      circuitId: circuitLocationsTable.circuitId,
      circuitName: circuitsTable.name
    })
    .from(circuitLocationsTable)
    .leftJoin(
      circuitsTable,
      eq(circuitLocationsTable.circuitId, circuitsTable.id)
    )
    .where(eq(circuitLocationsTable.type, "airport"))

  return <AirportsTable airports={airports} />
}
