"use server"

import { db } from "@/db/db"
import { profilesTable, ticketsTable, meetupsTable } from "@/db/schema"
import { count } from "drizzle-orm"
import { sql } from "drizzle-orm"

export async function getDashboardData() {
  const [userCount] = await db.select({ value: count() }).from(profilesTable)
  const [ticketCount] = await db.select({ value: count() }).from(ticketsTable)
  const [meetupCount] = await db.select({ value: count() }).from(meetupsTable)

  // Get admin count
  const [adminCount] = await db
    .select({ value: count() })
    .from(profilesTable)
    .where(sql`is_admin = true`)

  return {
    userCount: userCount.value,
    adminCount: adminCount.value,
    ticketCount: ticketCount.value,
    meetupCount: meetupCount.value,
    activeNow: Math.floor(Math.random() * 1000) // This would come from your analytics service
  }
}
