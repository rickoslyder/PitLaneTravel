"use server"

import { db } from "@/db/db"
import { worldPlugsTable, SelectWorldPlug } from "@/db/schema"
import { ActionState } from "@/types"
import { eq } from "drizzle-orm"

export async function getPlugsByCountryAction(
  countryName: string
): Promise<ActionState<SelectWorldPlug[]>> {
  try {
    const plugs = await db
      .select()
      .from(worldPlugsTable)
      .where(eq(worldPlugsTable.name, countryName))

    return {
      isSuccess: true,
      message: "Plugs retrieved successfully",
      data: plugs
    }
  } catch (error) {
    console.error("Error getting plugs:", error)
    return { isSuccess: false, message: "Failed to get plugs" }
  }
} 