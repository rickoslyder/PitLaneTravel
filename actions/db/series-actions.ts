/*
<ai_context>
Server actions for top-level racing series (F1, Formula E, MotoGP, IndyCar, WEC).
Public reads; admin-guarded writes. Not to be confused with supporting-series-actions
(support races within a race weekend).
</ai_context>
*/

"use server"

import { db } from "@/db/db"
import {
  InsertSeries,
  SelectSeries,
  seriesTable
} from "@/db/schema/series-schema"
import { ActionState } from "@/types"
import { asc, eq } from "drizzle-orm"
import { requireAdmin, AuthError } from "@/lib/auth"

export async function getAllSeriesAction(
  includeInactive = false
): Promise<ActionState<SelectSeries[]>> {
  try {
    const rows = includeInactive
      ? await db.select().from(seriesTable).orderBy(asc(seriesTable.sortOrder))
      : await db
          .select()
          .from(seriesTable)
          .where(eq(seriesTable.isActive, true))
          .orderBy(asc(seriesTable.sortOrder))

    return {
      isSuccess: true,
      message: "Series retrieved successfully",
      data: rows
    }
  } catch (error) {
    console.error("Error getting series:", error)
    return { isSuccess: false, message: "Failed to get series" }
  }
}

export async function getSeriesBySlugAction(
  slug: string
): Promise<ActionState<SelectSeries>> {
  try {
    const [series] = await db
      .select()
      .from(seriesTable)
      .where(eq(seriesTable.slug, slug))
      .limit(1)

    if (!series) {
      return { isSuccess: false, message: "Series not found" }
    }

    return {
      isSuccess: true,
      message: "Series retrieved successfully",
      data: series
    }
  } catch (error) {
    console.error("Error getting series by slug:", error)
    return { isSuccess: false, message: "Failed to get series" }
  }
}

export async function createSeriesAction(
  series: InsertSeries
): Promise<ActionState<SelectSeries>> {
  try {
    await requireAdmin()
    const [newSeries] = await db.insert(seriesTable).values(series).returning()
    return {
      isSuccess: true,
      message: "Series created successfully",
      data: newSeries
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { isSuccess: false, message: error.message }
    }
    console.error("Error creating series:", error)
    return { isSuccess: false, message: "Failed to create series" }
  }
}

export async function updateSeriesAction(
  id: string,
  data: Partial<InsertSeries>
): Promise<ActionState<SelectSeries>> {
  try {
    await requireAdmin()
    const [updated] = await db
      .update(seriesTable)
      .set(data)
      .where(eq(seriesTable.id, id))
      .returning()

    if (!updated) {
      return { isSuccess: false, message: "Series not found" }
    }

    return {
      isSuccess: true,
      message: "Series updated successfully",
      data: updated
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { isSuccess: false, message: error.message }
    }
    console.error("Error updating series:", error)
    return { isSuccess: false, message: "Failed to update series" }
  }
}

export async function deleteSeriesAction(
  id: string
): Promise<ActionState<void>> {
  try {
    await requireAdmin()
    // Races reference series with ON DELETE RESTRICT; deleting a series with races
    // will fail at the DB level, which is the desired safety behaviour.
    await db.delete(seriesTable).where(eq(seriesTable.id, id))
    return {
      isSuccess: true,
      message: "Series deleted successfully",
      data: undefined
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { isSuccess: false, message: error.message }
    }
    console.error("Error deleting series:", error)
    return {
      isSuccess: false,
      message:
        "Failed to delete series (series with existing races cannot be deleted)"
    }
  }
}
