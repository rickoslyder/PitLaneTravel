"use server"

import { db } from "@/db/db"
import { meetupsTable } from "@/db/schema"
import { ActionState } from "@/types"
import { InsertMeetup, SelectMeetup } from "@/db/schema"
import { and, eq, desc } from "drizzle-orm"

export async function createMeetupAction(
  meetup: InsertMeetup
): Promise<ActionState<SelectMeetup>> {
  try {
    const [newMeetup] = await db.insert(meetupsTable).values(meetup).returning()
    return {
      isSuccess: true,
      message: "Meetup created successfully",
      data: newMeetup
    }
  } catch (error) {
    console.error("Error creating meetup:", error)
    return { isSuccess: false, message: "Failed to create meetup" }
  }
}

export async function getMeetupAction(
  id: string,
  userId: string
): Promise<ActionState<SelectMeetup>> {
  try {
    const [meetup] = await db
      .select()
      .from(meetupsTable)
      .where(eq(meetupsTable.id, id))

    if (!meetup) {
      return { isSuccess: false, message: "Meetup not found" }
    }

    return {
      isSuccess: true,
      message: "Meetup retrieved successfully",
      data: meetup
    }
  } catch (error) {
    console.error("Error getting meetup:", error)
    return { isSuccess: false, message: "Failed to get meetup" }
  }
}

export async function getMeetupsByRaceAction(
  raceId: string
): Promise<ActionState<SelectMeetup[]>> {
  try {
    const meetups = await db
      .select()
      .from(meetupsTable)
      .where(eq(meetupsTable.raceId, raceId))
      .orderBy(desc(meetupsTable.date))

    return {
      isSuccess: true,
      message: "Meetups retrieved successfully",
      data: meetups
    }
  } catch (error) {
    console.error("Error getting meetups:", error)
    return { isSuccess: false, message: "Failed to get meetups" }
  }
}

export async function updateMeetupAction(
  id: string,
  userId: string,
  data: Partial<InsertMeetup>
): Promise<ActionState<SelectMeetup>> {
  try {
    const [updatedMeetup] = await db
      .update(meetupsTable)
      .set(data)
      .where(and(eq(meetupsTable.id, id), eq(meetupsTable.userId, userId)))
      .returning()

    if (!updatedMeetup) {
      return { isSuccess: false, message: "Meetup not found or access denied" }
    }

    return {
      isSuccess: true,
      message: "Meetup updated successfully",
      data: updatedMeetup
    }
  } catch (error) {
    console.error("Error updating meetup:", error)
    return { isSuccess: false, message: "Failed to update meetup" }
  }
}

export async function deleteMeetupAction(
  id: string,
  userId: string
): Promise<ActionState<void>> {
  try {
    await db
      .delete(meetupsTable)
      .where(and(eq(meetupsTable.id, id), eq(meetupsTable.userId, userId)))

    return {
      isSuccess: true,
      message: "Meetup deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting meetup:", error)
    return { isSuccess: false, message: "Failed to delete meetup" }
  }
}

export async function joinMeetupAction(
  id: string,
  userId: string
): Promise<ActionState<SelectMeetup>> {
  try {
    const [meetup] = await db
      .select()
      .from(meetupsTable)
      .where(eq(meetupsTable.id, id))

    if (!meetup) {
      return { isSuccess: false, message: "Meetup not found" }
    }

    // Check if user is already in attendees
    const attendees = meetup.attendees || []
    if (attendees.includes(userId)) {
      return { isSuccess: false, message: "Already joined this meetup" }
    }

    // Check if meetup is full
    if (meetup.maxAttendees && attendees.length >= meetup.maxAttendees) {
      return { isSuccess: false, message: "Meetup is full" }
    }

    // Add user to attendees
    const [updatedMeetup] = await db
      .update(meetupsTable)
      .set({
        attendees: [...attendees, userId]
      })
      .where(eq(meetupsTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Successfully joined meetup",
      data: updatedMeetup
    }
  } catch (error) {
    console.error("Error joining meetup:", error)
    return { isSuccess: false, message: "Failed to join meetup" }
  }
}

export async function leaveMeetupAction(
  id: string,
  userId: string
): Promise<ActionState<SelectMeetup>> {
  try {
    const [meetup] = await db
      .select()
      .from(meetupsTable)
      .where(eq(meetupsTable.id, id))

    if (!meetup) {
      return { isSuccess: false, message: "Meetup not found" }
    }

    // Check if user is in attendees
    const attendees = meetup.attendees || []
    if (!attendees.includes(userId)) {
      return { isSuccess: false, message: "Not a member of this meetup" }
    }

    // Remove user from attendees
    const [updatedMeetup] = await db
      .update(meetupsTable)
      .set({
        attendees: attendees.filter(id => id !== userId)
      })
      .where(eq(meetupsTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Successfully left meetup",
      data: updatedMeetup
    }
  } catch (error) {
    console.error("Error leaving meetup:", error)
    return { isSuccess: false, message: "Failed to leave meetup" }
  }
} 