"use server"

import { db } from "@/db/db"
import { circuitLocationsTable } from "@/db/schema"
import { eq } from "drizzle-orm"
import AirportsTable from "./_components/airports-table"

export default async function AirportsAdminPage() {
  const airports = await db
    .select()
    .from(circuitLocationsTable)
    .where(eq(circuitLocationsTable.type, "airport"))

  return <AirportsTable airports={airports} />
}
