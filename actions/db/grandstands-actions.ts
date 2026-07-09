/*
<ai_context>
Server actions for grandstands (circuit seating-area guide). Public reads; admin writes.
</ai_context>
*/

"use server"

import { db } from "@/db/db"
import {
  InsertGrandstand,
  SelectGrandstand,
  grandstandsTable
} from "@/db/schema/grandstands-schema"
import { circuitsTable, SelectCircuit } from "@/db/schema"
import { ActionState } from "@/types"
import { asc, desc, eq } from "drizzle-orm"
import { requireAdmin, AuthError } from "@/lib/auth"

export async function getGrandstandsByCircuitAction(
  circuitId: string
): Promise<ActionState<SelectGrandstand[]>> {
  try {
    const rows = await db
      .select()
      .from(grandstandsTable)
      .where(eq(grandstandsTable.circuitId, circuitId))
      .orderBy(desc(grandstandsTable.viewRating))
    return {
      isSuccess: true,
      message: "Grandstands retrieved successfully",
      data: rows
    }
  } catch (error) {
    console.error("Error getting grandstands:", error)
    return { isSuccess: false, message: "Failed to get grandstands" }
  }
}

export interface CircuitWithGrandstands extends SelectCircuit {
  grandstands: SelectGrandstand[]
}

/** All circuits that have at least one grandstand documented, for the guide index. */
export async function getCircuitsWithGrandstandsAction(): Promise<
  ActionState<CircuitWithGrandstands[]>
> {
  try {
    const rows = await db
      .select({ circuit: circuitsTable, grandstand: grandstandsTable })
      .from(grandstandsTable)
      .innerJoin(circuitsTable, eq(grandstandsTable.circuitId, circuitsTable.id))
      .orderBy(asc(circuitsTable.name))

    const byCircuit = new Map<string, CircuitWithGrandstands>()
    for (const { circuit, grandstand } of rows) {
      const existing = byCircuit.get(circuit.id)
      if (existing) {
        existing.grandstands.push(grandstand)
      } else {
        byCircuit.set(circuit.id, { ...circuit, grandstands: [grandstand] })
      }
    }

    return {
      isSuccess: true,
      message: "Circuits with grandstands retrieved successfully",
      data: Array.from(byCircuit.values())
    }
  } catch (error) {
    console.error("Error getting circuits with grandstands:", error)
    return { isSuccess: false, message: "Failed to get circuits with grandstands" }
  }
}

export async function createGrandstandAction(
  grandstand: InsertGrandstand
): Promise<ActionState<SelectGrandstand>> {
  try {
    await requireAdmin()
    const [row] = await db
      .insert(grandstandsTable)
      .values(grandstand)
      .returning()
    return { isSuccess: true, message: "Grandstand created", data: row }
  } catch (error) {
    if (error instanceof AuthError) {
      return { isSuccess: false, message: error.message }
    }
    console.error("Error creating grandstand:", error)
    return { isSuccess: false, message: "Failed to create grandstand" }
  }
}

export async function updateGrandstandAction(
  id: string,
  data: Partial<InsertGrandstand>
): Promise<ActionState<SelectGrandstand>> {
  try {
    await requireAdmin()
    const [row] = await db
      .update(grandstandsTable)
      .set(data)
      .where(eq(grandstandsTable.id, id))
      .returning()
    if (!row) return { isSuccess: false, message: "Grandstand not found" }
    return { isSuccess: true, message: "Grandstand updated", data: row }
  } catch (error) {
    if (error instanceof AuthError) {
      return { isSuccess: false, message: error.message }
    }
    console.error("Error updating grandstand:", error)
    return { isSuccess: false, message: "Failed to update grandstand" }
  }
}

export async function deleteGrandstandAction(
  id: string
): Promise<ActionState<void>> {
  try {
    await requireAdmin()
    await db.delete(grandstandsTable).where(eq(grandstandsTable.id, id))
    return { isSuccess: true, message: "Grandstand deleted", data: undefined }
  } catch (error) {
    if (error instanceof AuthError) {
      return { isSuccess: false, message: error.message }
    }
    console.error("Error deleting grandstand:", error)
    return { isSuccess: false, message: "Failed to delete grandstand" }
  }
}
