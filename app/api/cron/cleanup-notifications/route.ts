import { db } from "@/db/db"
import { notificationsTable, waitlistTable } from "@/db/schema"
import { lt, eq } from "drizzle-orm"

const NOTIFICATION_RETENTION_DAYS = 30
const WAITLIST_EXPIRY_DAYS = 90

export async function GET() {
  try {
    const notificationRetentionDate = new Date()
    notificationRetentionDate.setDate(
      notificationRetentionDate.getDate() - NOTIFICATION_RETENTION_DAYS
    )

    const waitlistExpiryDate = new Date()
    waitlistExpiryDate.setDate(
      waitlistExpiryDate.getDate() - WAITLIST_EXPIRY_DAYS
    )

    // Archive old sent notifications
    await db
      .delete(notificationsTable)
      .where(lt(notificationsTable.createdAt, notificationRetentionDate))

    // Mark old waitlist entries as expired
    await db
      .update(waitlistTable)
      .set({ status: "expired" })
      .where(lt(waitlistTable.createdAt, waitlistExpiryDate))

    return new Response("Cleanup completed", { status: 200 })
  } catch (error) {
    console.error("Error during cleanup:", error)
    return new Response("Error during cleanup", { status: 500 })
  }
}

// Route segment configuration
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
