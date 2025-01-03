"use server"

import { db } from "@/db/db"
import { circuitsTable, racesTable } from "@/db/schema"
import { RacesTable } from "./_components/races-table"
import { desc, eq } from "drizzle-orm"

export default async function RacesPage() {
  const races = await db
    .select({
      id: racesTable.id,
      name: racesTable.name,
      date: racesTable.date,
      season: racesTable.season,
      round: racesTable.round,
      country: racesTable.country,
      description: racesTable.description,
      weekendStart: racesTable.weekendStart,
      weekendEnd: racesTable.weekendEnd,
      status: racesTable.status,
      isSprintWeekend: racesTable.isSprintWeekend,
      circuitId: racesTable.circuitId,
      openf1MeetingKey: racesTable.openf1MeetingKey,
      openf1SessionKey: racesTable.openf1SessionKey,
      createdAt: racesTable.createdAt,
      updatedAt: racesTable.updatedAt,
      slug: racesTable.slug,
      circuit: {
        id: circuitsTable.id,
        name: circuitsTable.name,
        country: circuitsTable.country,
        location: circuitsTable.location,
        latitude: circuitsTable.latitude,
        longitude: circuitsTable.longitude,
        imageUrl: circuitsTable.imageUrl,
        timezoneId: circuitsTable.timezoneId,
        timezoneName: circuitsTable.timezoneName,
        websiteUrl: circuitsTable.websiteUrl,
        createdAt: circuitsTable.createdAt,
        updatedAt: circuitsTable.updatedAt
      }
    })
    .from(racesTable)
    .leftJoin(circuitsTable, eq(racesTable.circuitId, circuitsTable.id))
    .orderBy(desc(racesTable.date))

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Races</h2>
        <p className="text-muted-foreground">
          Manage Formula 1 races and their details
        </p>
      </div>

      <RacesTable data={races} />
    </div>
  )
}
