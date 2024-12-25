"use server"

import { db } from "@/db/db"
import {
  InsertActivity,
  SelectActivity,
  activitiesTable
} from "@/db/schema"
import { ActionState } from "@/types"
import { eq, and, or, SQL } from "drizzle-orm"

// Create a new activity
export async function createActivityAction(
  data: InsertActivity
): Promise<ActionState<SelectActivity>> {
  try {
    const [newActivity] = await db
      .insert(activitiesTable)
      .values(data)
      .returning()

    return {
      isSuccess: true,
      message: "Activity created successfully",
      data: newActivity
    }
  } catch (error) {
    console.error("Error creating activity:", error)
    return { isSuccess: false, message: "Failed to create activity" }
  }
}

// Get a specific activity
export async function getActivityAction(
  id: string
): Promise<ActionState<SelectActivity>> {
  try {
    const [activity] = await db
      .select()
      .from(activitiesTable)
      .where(eq(activitiesTable.id, id))

    if (!activity) {
      return { isSuccess: false, message: "Activity not found" }
    }

    return {
      isSuccess: true,
      message: "Activity retrieved successfully",
      data: activity
    }
  } catch (error) {
    console.error("Error getting activity:", error)
    return { isSuccess: false, message: "Failed to get activity" }
  }
}

// Get all activities for an itinerary
export async function getItineraryActivitiesAction(
  itineraryId: string
): Promise<ActionState<SelectActivity[]>> {
  try {
    const activities = await db
      .select()
      .from(activitiesTable)
      .where(eq(activitiesTable.itineraryId, itineraryId))
      .orderBy(activitiesTable.createdAt)

    return {
      isSuccess: true,
      message: "Activities retrieved successfully",
      data: activities
    }
  } catch (error) {
    console.error("Error getting activities:", error)
    return { isSuccess: false, message: "Failed to get activities" }
  }
}

// Update an activity
export async function updateActivityAction(
  id: string,
  data: Partial<InsertActivity>
): Promise<ActionState<SelectActivity>> {
  try {
    const [updatedActivity] = await db
      .update(activitiesTable)
      .set(data)
      .where(eq(activitiesTable.id, id))
      .returning()

    if (!updatedActivity) {
      return { isSuccess: false, message: "Activity not found" }
    }

    return {
      isSuccess: true,
      message: "Activity updated successfully",
      data: updatedActivity
    }
  } catch (error) {
    console.error("Error updating activity:", error)
    return { isSuccess: false, message: "Failed to update activity" }
  }
}

// Delete an activity
export async function deleteActivityAction(
  id: string
): Promise<ActionState<void>> {
  try {
    await db.delete(activitiesTable).where(eq(activitiesTable.id, id))

    return {
      isSuccess: true,
      message: "Activity deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting activity:", error)
    return { isSuccess: false, message: "Failed to delete activity" }
  }
}

// Bulk create activities
export async function bulkCreateActivitiesAction(
  activities: InsertActivity[]
): Promise<ActionState<SelectActivity[]>> {
  try {
    const newActivities = await db
      .insert(activitiesTable)
      .values(activities)
      .returning()

    return {
      isSuccess: true,
      message: "Activities created successfully",
      data: newActivities
    }
  } catch (error) {
    console.error("Error creating activities:", error)
    return { isSuccess: false, message: "Failed to create activities" }
  }
}

// Bulk update activities
export async function bulkUpdateActivitiesAction(
  activities: { id: string; data: Partial<InsertActivity> }[]
): Promise<ActionState<SelectActivity[]>> {
  try {
    const updatedActivities = []

    for (const { id, data } of activities) {
      const [updatedActivity] = await db
        .update(activitiesTable)
        .set(data)
        .where(eq(activitiesTable.id, id))
        .returning()

      if (updatedActivity) {
        updatedActivities.push(updatedActivity)
      }
    }

    return {
      isSuccess: true,
      message: "Activities updated successfully",
      data: updatedActivities
    }
  } catch (error) {
    console.error("Error updating activities:", error)
    return { isSuccess: false, message: "Failed to update activities" }
  }
}

// Bulk delete activities
export async function bulkDeleteActivitiesAction(
  ids: string[]
): Promise<ActionState<void>> {
  try {
    if (ids.length === 0) {
      return {
        isSuccess: true,
        message: "No activities to delete",
        data: undefined
      }
    }

    await db
      .delete(activitiesTable)
      .where(ids.length === 1 ? eq(activitiesTable.id, ids[0]) : or(...ids.map(id => eq(activitiesTable.id, id))))

    return {
      isSuccess: true,
      message: "Activities deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting activities:", error)
    return { isSuccess: false, message: "Failed to delete activities" }
  }
} 