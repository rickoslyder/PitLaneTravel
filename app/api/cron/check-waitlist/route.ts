import { db } from "@/db/db"
import { waitlistTable, ticketsTable } from "@/db/schema"
import { eq, and, lt, isNull, or } from "drizzle-orm"
import { createNotificationAction } from "@/actions/db/notifications-actions"

const MAX_NOTIFICATIONS = 3 // Maximum number of notifications per ticket
const NOTIFICATION_COOLDOWN_HOURS = 24 // Hours between notifications

export async function GET() {
  try {
    const cooldownDate = new Date()
    cooldownDate.setHours(cooldownDate.getHours() - NOTIFICATION_COOLDOWN_HOURS)

    // Get eligible waitlist entries
    const waitlistEntries = await db
      .select({
        id: waitlistTable.id,
        userId: waitlistTable.userId,
        raceId: waitlistTable.raceId,
        ticketCategoryId: waitlistTable.ticketCategoryId,
        email: waitlistTable.email,
        phone: waitlistTable.phone,
        notificationChannel: waitlistTable.notificationChannel,
        status: waitlistTable.status,
        notificationCount: waitlistTable.notificationCount,
        lastNotifiedAt: waitlistTable.lastNotifiedAt
      })
      .from(waitlistTable)
      .where(
        and(
          eq(waitlistTable.status, "pending"),
          lt(waitlistTable.notificationCount, MAX_NOTIFICATIONS),
          or(
            isNull(waitlistTable.lastNotifiedAt),
            lt(waitlistTable.lastNotifiedAt, cooldownDate)
          )
        )
      )

    // Check each entry
    for (const entry of waitlistEntries) {
      // Get the ticket
      const [ticket] = await db
        .select()
        .from(ticketsTable)
        .where(
          and(
            eq(ticketsTable.id, parseInt(entry.ticketCategoryId)),
            eq(ticketsTable.availability, "available")
          )
        )

      if (ticket) {
        try {
          // Create notification
          await createNotificationAction({
            userId: entry.email, // Using email as userId for now
            type: "ticket_available",
            title: "Tickets Now Available!",
            message: `The tickets you were waiting for (${ticket.title}) are now available. Visit our website to secure your tickets before they sell out.`,
            status: "pending"
          })

          // Update waitlist entry
          await db
            .update(waitlistTable)
            .set({
              status: "notified",
              notificationCount: (entry.notificationCount || 0) + 1,
              lastNotifiedAt: new Date()
            })
            .where(eq(waitlistTable.id, entry.id))
        } catch (error) {
          console.error(`Error processing waitlist entry ${entry.id}:`, error)
          // Continue with next entry instead of failing the entire job
          continue
        }
      }
    }

    return new Response("Waitlist check completed", { status: 200 })
  } catch (error) {
    console.error("Error checking waitlist:", error)
    return new Response("Error checking waitlist", { status: 500 })
  }
}

// Route segment configuration
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
