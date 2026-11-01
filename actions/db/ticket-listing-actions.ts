"use server"

import { db } from "@/db/db"
import { ticketPackagesTable, ticketsTable } from "@/db/schema"
import { eq } from "drizzle-orm"

/**
 * Whether this race has any ticket or package row.
 * Selects only primary keys so a missing package_type column cannot 500 the race page.
 * On a query failure, returns true so the hero keeps Book Now.
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
