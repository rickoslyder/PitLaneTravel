"use server"

import { db } from "@/db/db"
import { InsertMerch, SelectMerch, merchTable } from "@/db/schema"
import { ActionState } from "@/types"
import { eq } from "drizzle-orm"

export async function createMerchAction(
  merch: InsertMerch
): Promise<ActionState<SelectMerch>> {
  try {
    const [newMerch] = await db.insert(merchTable).values(merch).returning()
    return {
      isSuccess: true,
      message: "Merchandise created successfully",
      data: newMerch
    }
  } catch (error) {
    console.error("Error creating merchandise:", error)
    return { isSuccess: false, message: "Failed to create merchandise" }
  }
}

export async function getMerchAction(
  id: string
): Promise<ActionState<SelectMerch>> {
  try {
    const [merch] = await db
      .select()
      .from(merchTable)
      .where(eq(merchTable.id, id))

    if (!merch) {
      return { isSuccess: false, message: "Merchandise not found" }
    }

    return {
      isSuccess: true,
      message: "Merchandise retrieved successfully",
      data: merch
    }
  } catch (error) {
    console.error("Error getting merchandise:", error)
    return { isSuccess: false, message: "Failed to get merchandise" }
  }
}

export async function getMerchByRaceAction(
  raceId: string
): Promise<ActionState<SelectMerch[]>> {
  try {
    const merch = await db
      .select()
      .from(merchTable)
      .where(eq(merchTable.raceId, raceId))

    return {
      isSuccess: true,
      message: "Merchandise retrieved successfully",
      data: merch
    }
  } catch (error) {
    console.error("Error getting merchandise:", error)
    return { isSuccess: false, message: "Failed to get merchandise" }
  }
}

export async function updateMerchAction(
  id: string,
  data: Partial<InsertMerch>
): Promise<ActionState<SelectMerch>> {
  try {
    const [updatedMerch] = await db
      .update(merchTable)
      .set(data)
      .where(eq(merchTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Merchandise updated successfully",
      data: updatedMerch
    }
  } catch (error) {
    console.error("Error updating merchandise:", error)
    return { isSuccess: false, message: "Failed to update merchandise" }
  }
}

export async function deleteMerchAction(id: string): Promise<ActionState<void>> {
  try {
    await db.delete(merchTable).where(eq(merchTable.id, id))
    return {
      isSuccess: true,
      message: "Merchandise deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting merchandise:", error)
    return { isSuccess: false, message: "Failed to delete merchandise" }
  }
} 