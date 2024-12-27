"use server"

import { db } from "@/db/db"
import { InsertSupportingSeries, SelectSupportingSeries, supportingSeriesTable } from "@/db/schema"
import { ActionState } from "@/types"
import { eq } from "drizzle-orm"

export async function createSupportingSeriesAction(
  data: InsertSupportingSeries
): Promise<ActionState<SelectSupportingSeries>> {
  try {
    const [newSeries] = await db
      .insert(supportingSeriesTable)
      .values(data)
      .returning()

    return {
      isSuccess: true,
      message: "Supporting series created successfully",
      data: newSeries
    }
  } catch (error) {
    console.error("Error creating supporting series:", error)
    return { isSuccess: false, message: "Failed to create supporting series" }
  }
}

export async function getSupportingSeriesAction(
  id: string
): Promise<ActionState<SelectSupportingSeries>> {
  try {
    const [series] = await db
      .select()
      .from(supportingSeriesTable)
      .where(eq(supportingSeriesTable.id, id))
      .limit(1)

    if (!series) {
      return {
        isSuccess: false,
        message: "Supporting series not found"
      }
    }

    return {
      isSuccess: true,
      message: "Supporting series retrieved successfully",
      data: series
    }
  } catch (error) {
    console.error("Error getting supporting series:", error)
    return { isSuccess: false, message: "Failed to get supporting series" }
  }
}

export async function updateSupportingSeriesAction(
  id: string,
  data: Partial<InsertSupportingSeries>
): Promise<ActionState<SelectSupportingSeries>> {
  try {
    const [updatedSeries] = await db
      .update(supportingSeriesTable)
      .set(data)
      .where(eq(supportingSeriesTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Supporting series updated successfully",
      data: updatedSeries
    }
  } catch (error) {
    console.error("Error updating supporting series:", error)
    return { isSuccess: false, message: "Failed to update supporting series" }
  }
}

export async function deleteSupportingSeriesAction(
  id: string
): Promise<ActionState<void>> {
  try {
    await db
      .delete(supportingSeriesTable)
      .where(eq(supportingSeriesTable.id, id))

    return {
      isSuccess: true,
      message: "Supporting series deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting supporting series:", error)
    return { isSuccess: false, message: "Failed to delete supporting series" }
  }
}

export async function getSupportingSeriesForRaceAction(
  raceId: string
): Promise<ActionState<SelectSupportingSeries[]>> {
  try {
    const series = await db
      .select()
      .from(supportingSeriesTable)
      .where(eq(supportingSeriesTable.raceId, raceId))

    return {
      isSuccess: true,
      message: "Supporting series retrieved successfully",
      data: series
    }
  } catch (error) {
    console.error("Error getting supporting series:", error)
    return { isSuccess: false, message: "Failed to get supporting series" }
  }
} 