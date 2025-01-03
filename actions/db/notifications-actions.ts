"use server"

import { db } from "@/db/db"
import {
  InsertNotification,
  SelectNotification,
  notificationsTable
} from "@/db/schema"
import { ActionState } from "@/types"
import { eq, and, isNull, desc } from "drizzle-orm"
import { resend } from "@/lib/resend"
import { WaitlistNotificationEmail } from "@/components/emails/waitlist-notification"

export async function createNotificationAction(
  data: InsertNotification
): Promise<ActionState<SelectNotification>> {
  try {
    const [newNotification] = await db
      .insert(notificationsTable)
      .values(data)
      .returning()

    return {
      isSuccess: true,
      message: "Notification created successfully",
      data: newNotification
    }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { isSuccess: false, message: "Failed to create notification" }
  }
}

export async function getPendingNotificationsAction(): Promise<
  ActionState<SelectNotification[]>
> {
  try {
    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(
        and(
          eq(notificationsTable.status, "pending"),
          isNull(notificationsTable.sentAt)
        )
      )
      .orderBy(desc(notificationsTable.createdAt))

    return {
      isSuccess: true,
      message: "Notifications retrieved successfully",
      data: notifications
    }
  } catch (error) {
    console.error("Error getting notifications:", error)
    return { isSuccess: false, message: "Failed to get notifications" }
  }
}

export async function markNotificationAsSentAction(
  id: string
): Promise<ActionState<SelectNotification>> {
  try {
    const [updatedNotification] = await db
      .update(notificationsTable)
      .set({
        status: "sent",
        sentAt: new Date()
      })
      .where(eq(notificationsTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Notification marked as sent successfully",
      data: updatedNotification
    }
  } catch (error) {
    console.error("Error marking notification as sent:", error)
    return { isSuccess: false, message: "Failed to mark notification as sent" }
  }
}

export async function markNotificationAsFailedAction(
  id: string,
  error: string
): Promise<ActionState<SelectNotification>> {
  try {
    const [updatedNotification] = await db
      .update(notificationsTable)
      .set({
        status: "failed",
        metadata: error
      })
      .where(eq(notificationsTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Notification marked as failed successfully",
      data: updatedNotification
    }
  } catch (error) {
    console.error("Error marking notification as failed:", error)
    return { isSuccess: false, message: "Failed to mark notification as failed" }
  }
}

export async function sendNotificationAction(
  notification: SelectNotification
): Promise<ActionState<void>> {
  try {
    // For now, we only support email notifications
    const { data: emailResult } = await resend.emails.send({
      from: "Pit Lane Travel <noreply@notifications.pitlanetravel.com>",
      to: [notification.userId], // Assuming userId is the email for now
      subject: notification.title,
      react: WaitlistNotificationEmail({
        title: notification.title,
        message: notification.message
      })
    })

    if (emailResult) {
      await markNotificationAsSentAction(notification.id)
    } else {
      await markNotificationAsFailedAction(
        notification.id,
        "Failed to send email"
      )
    }

    return {
      isSuccess: true,
      message: "Notification sent successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error sending notification:", error)
    await markNotificationAsFailedAction(
      notification.id,
      error instanceof Error ? error.message : "Unknown error"
    )
    return { isSuccess: false, message: "Failed to send notification" }
  }
} 