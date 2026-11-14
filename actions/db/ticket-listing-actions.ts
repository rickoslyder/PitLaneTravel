"use server"

import { db } from "@/db/db"
import { ticketPackagesTable, ticketsTable } from "@/db/schema"
import { eq } from "drizzle-orm"

/**
 * Whether this race has any ticket or package row.
 * Selects only primary keys so a missing package_type column cannot 500 the race page.
 * On a query failure, returns true so the hero keeps Find tickets.
 */
export async function raceHasTicketListingsAction(
  raceId: string
): Promise<boolean> {
  try {
    const [ticket] = await db
      .select({ id: ticketsTable.id })
      .from(ticketsTable)
      .where(eq(ticketsTable.raceId, raceId))
      .limit(1)

    if (ticket) return true

    const [pkg] = await db
      .select({ id: ticketPackagesTable.id })
      .from(ticketPackagesTable)
      .where(eq(ticketPackagesTable.raceId, raceId))
      .limit(1)

    return Boolean(pkg)
  } catch (error) {
    console.error("Error checking ticket listings:", error)
    return true
  }
}

/**
 * Race ids that have at least one ticket or package row.
 * Null when the lookup fails, so a calendar keeps its details button
 * instead of labelling every race ticketed or empty.
 */
export async function listRaceIdsWithTicketListingsAction(): Promise<
  string[] | null
> {
  try {
    const [ticketRows, packageRows] = await Promise.all([
      db.selectDistinct({ raceId: ticketsTable.raceId }).from(ticketsTable),
      db
        .selectDistinct({ raceId: ticketPackagesTable.raceId })
        .from(ticketPackagesTable)
    ])
    const ids = new Set<string>()
    for (const row of ticketRows) ids.add(row.raceId)
    for (const row of packageRows) ids.add(row.raceId)
    return [...ids]
  } catch (error) {
    console.error("Error listing races with ticket rows:", error)
    return null
  }
}
