"use server"

import { db } from "@/db/db"
import { transportInfoTable } from "@/db/schema"
import { ActionState } from "@/types"
import { InsertTransportInfo, SelectTransportInfo } from "@/db/schema"
import { desc, eq } from "drizzle-orm"

export async function getTransportInfoAction(): Promise<ActionState<SelectTransportInfo[]>> {
  try {
    const transportInfo = await db
      .select()
      .from(transportInfoTable)
      .orderBy(desc(transportInfoTable.createdAt))

    return {
      isSuccess: true,
      message: "Transport info retrieved successfully",
      data: transportInfo
    }
  } catch (error) {
    console.error("Error getting transport info:", error)
    return { isSuccess: false, message: "Failed to get transport info" }
  }
}

export async function getTransportInfoByCircuitAction(
  circuitId: string
): Promise<ActionState<SelectTransportInfo[]>> {
  try {
    const transportInfo = await db
      .select()
      .from(transportInfoTable)
      .where(eq(transportInfoTable.circuitId, circuitId))

    return {
      isSuccess: true,
      message: "Transport info retrieved successfully",
      data: transportInfo
    }
  } catch (error) {
    console.error("Error getting transport info:", error)
    return { isSuccess: false, message: "Failed to get transport info" }
  }
}

export async function createTransportInfoAction(
  data: InsertTransportInfo
): Promise<ActionState<SelectTransportInfo>> {
  try {
    const [newTransportInfo] = await db
      .insert(transportInfoTable)
      .values(data)
      .returning()

    return {
      isSuccess: true,
      message: "Transport info created successfully",
      data: newTransportInfo
    }
  } catch (error) {
    console.error("Error creating transport info:", error)
    return { isSuccess: false, message: "Failed to create transport info" }
  }
}

export async function updateTransportInfoAction(
  id: string,
  data: Partial<Omit<SelectTransportInfo, "id" | "created_at" | "updated_at">>
): Promise<ActionState<SelectTransportInfo>> {
  try {
    const [updatedTransportInfo] = await db
      .update(transportInfoTable)
      .set(data)
      .where(eq(transportInfoTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Transport info updated successfully",
      data: updatedTransportInfo
    }
  } catch (error) {
    console.error("Error updating transport info:", error)
    return { isSuccess: false, message: "Failed to update transport info" }
  }
}

export async function deleteTransportInfoAction(
  id: string
): Promise<ActionState<void>> {
  try {
    await db.delete(transportInfoTable).where(eq(transportInfoTable.id, id))

    return {
      isSuccess: true,
      message: "Transport info deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting transport info:", error)
    return { isSuccess: false, message: "Failed to delete transport info" }
  }
} 