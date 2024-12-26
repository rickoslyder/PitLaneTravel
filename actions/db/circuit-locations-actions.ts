"use server"

import { db } from "@/db/db"
import { circuitLocationsTable, InsertCircuitLocation, SelectCircuitLocation } from "@/db/schema"
import { ActionState } from "@/types"
import { eq, and } from "drizzle-orm"

export async function createCircuitLocationAction(
  location: InsertCircuitLocation
): Promise<ActionState<SelectCircuitLocation>> {
  try {
    const [newLocation] = await db
      .insert(circuitLocationsTable)
      .values(location)
      .returning()

    return {
      isSuccess: true,
      message: "Circuit location created successfully",
      data: newLocation
    }
  } catch (error) {
    console.error("Error creating circuit location:", error)
    return { isSuccess: false, message: "Failed to create circuit location" }
  }
}

export async function getCircuitLocationsAction(
  circuitId: string
): Promise<ActionState<SelectCircuitLocation[]>> {
  try {
    const locations = await db
      .select()
      .from(circuitLocationsTable)
      .where(eq(circuitLocationsTable.circuitId, circuitId))

    return {
      isSuccess: true,
      message: "Circuit locations retrieved successfully",
      data: locations
    }
  } catch (error) {
    console.error("Error getting circuit locations:", error)
    return { isSuccess: false, message: "Failed to get circuit locations" }
  }
}

export async function getCityLocationAction(
  circuitId: string
): Promise<ActionState<SelectCircuitLocation | undefined>> {
  try {
    const [cityLocation] = await db
      .select()
      .from(circuitLocationsTable)
      .where(
        and(
          eq(circuitLocationsTable.circuitId, circuitId),
          eq(circuitLocationsTable.type, "city_center")
        )
      )

    return {
      isSuccess: true,
      message: "City location retrieved successfully",
      data: cityLocation
    }
  } catch (error) {
    console.error("Error getting city location:", error)
    return { isSuccess: false, message: "Failed to get city location" }
  }
}

export async function updateCircuitLocationAction(
  id: string,
  data: Partial<InsertCircuitLocation>
): Promise<ActionState<SelectCircuitLocation>> {
  try {
    const [updatedLocation] = await db
      .update(circuitLocationsTable)
      .set(data)
      .where(eq(circuitLocationsTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Circuit location updated successfully",
      data: updatedLocation
    }
  } catch (error) {
    console.error("Error updating circuit location:", error)
    return { isSuccess: false, message: "Failed to update circuit location" }
  }
}

export async function deleteCircuitLocationAction(
  id: string
): Promise<ActionState<void>> {
  try {
    await db
      .delete(circuitLocationsTable)
      .where(eq(circuitLocationsTable.id, id))

    return {
      isSuccess: true,
      message: "Circuit location deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting circuit location:", error)
    return { isSuccess: false, message: "Failed to delete circuit location" }
  }
} 