"use server"

import { db } from "@/db/db"
import { raceHistoryTable } from "@/db/schema/race-history-schema"
import { ActionState } from "@/types"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getRaceHistoryAction(
  raceId: string
): Promise<ActionState<typeof raceHistoryTable.$inferSelect>> {
  try {
    const [history] = await db
      .select()
      .from(raceHistoryTable)
      .where(eq(raceHistoryTable.raceId, raceId))
      .limit(1)

    if (!history) {
      return {
        isSuccess: false,
        message: "Race history not found"
      }
    }

    return {
      isSuccess: true,
      message: "Race history retrieved successfully",
      data: history
    }
  } catch (error) {
    console.error("Error getting race history:", error)
    return { isSuccess: false, message: "Failed to get race history" }
  }
}

export async function createRaceHistoryAction(
  data: typeof raceHistoryTable.$inferInsert
): Promise<ActionState<typeof raceHistoryTable.$inferSelect>> {
  try {
    const [history] = await db.insert(raceHistoryTable).values(data).returning()

    revalidatePath(`/races/${data.raceId}`)
    revalidatePath(`/races/${data.raceId}/history`)

    return {
      isSuccess: true,
      message: "Race history created successfully",
      data: history
    }
  } catch (error) {
    console.error("Error creating race history:", error)
    return { isSuccess: false, message: "Failed to create race history" }
  }
}

export async function updateRaceHistoryAction(
  raceId: string,
  data: Partial<typeof raceHistoryTable.$inferInsert>
): Promise<ActionState<typeof raceHistoryTable.$inferSelect>> {
  try {
    const [history] = await db
      .update(raceHistoryTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(raceHistoryTable.raceId, raceId))
      .returning()

    if (!history) {
      return {
        isSuccess: false,
        message: "Race history not found"
      }
    }

    revalidatePath(`/races/${raceId}`)
    revalidatePath(`/races/${raceId}/history`)

    return {
      isSuccess: true,
      message: "Race history updated successfully",
      data: history
    }
  } catch (error) {
    console.error("Error updating race history:", error)
    return { isSuccess: false, message: "Failed to update race history" }
  }
}

export async function deleteRaceHistoryAction(
  raceId: string
): Promise<ActionState<void>> {
  try {
    await db
      .delete(raceHistoryTable)
      .where(eq(raceHistoryTable.raceId, raceId))

    revalidatePath(`/races/${raceId}`)
    revalidatePath(`/races/${raceId}/history`)

    return {
      isSuccess: true,
      message: "Race history deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting race history:", error)
    return { isSuccess: false, message: "Failed to delete race history" }
  }
} 