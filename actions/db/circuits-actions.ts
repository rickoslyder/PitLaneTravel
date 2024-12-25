"use server"

import { db } from "@/db/db"
import {
  InsertCircuit,
  SelectCircuit,
  circuitsTable,
  InsertCircuitDetails,
  SelectCircuitDetails,
  circuitDetailsTable,
  InsertAirport,
  SelectAirport,
  airportsTable,
  InsertLocalAttraction,
  SelectLocalAttraction,
  localAttractionsTable
} from "@/db/schema"
import { ActionState } from "@/types"
import { eq } from "drizzle-orm"

// Circuit Actions
export async function createCircuitAction(
  data: InsertCircuit
): Promise<ActionState<SelectCircuit>> {
  try {
    const [newCircuit] = await db.insert(circuitsTable).values(data).returning()
    return {
      isSuccess: true,
      message: "Circuit created successfully",
      data: newCircuit
    }
  } catch (error) {
    console.error("Error creating circuit:", error)
    return { isSuccess: false, message: "Failed to create circuit" }
  }
}

export async function getCircuitAction(
  id: string
): Promise<ActionState<SelectCircuit>> {
  try {
    const [circuit] = await db
      .select()
      .from(circuitsTable)
      .where(eq(circuitsTable.id, id))

    if (!circuit) {
      return { isSuccess: false, message: "Circuit not found" }
    }

    return {
      isSuccess: true,
      message: "Circuit retrieved successfully",
      data: circuit
    }
  } catch (error) {
    console.error("Error getting circuit:", error)
    return { isSuccess: false, message: "Failed to get circuit" }
  }
}

export async function getCircuitsAction(): Promise<ActionState<SelectCircuit[]>> {
  try {
    const allCircuits = await db.select().from(circuitsTable)
    return {
      isSuccess: true,
      message: "Circuits retrieved successfully",
      data: allCircuits
    }
  } catch (error) {
    console.error("Error getting circuits:", error)
    return { isSuccess: false, message: "Failed to get circuits" }
  }
}

export async function updateCircuitAction(
  id: string,
  data: Partial<InsertCircuit>
): Promise<ActionState<SelectCircuit>> {
  try {
    const [updatedCircuit] = await db
      .update(circuitsTable)
      .set(data)
      .where(eq(circuitsTable.id, id))
      .returning()

    if (!updatedCircuit) {
      return { isSuccess: false, message: "Circuit not found" }
    }

    return {
      isSuccess: true,
      message: "Circuit updated successfully",
      data: updatedCircuit
    }
  } catch (error) {
    console.error("Error updating circuit:", error)
    return { isSuccess: false, message: "Failed to update circuit" }
  }
}

// Circuit Details Actions
export async function createCircuitDetailsAction(
  data: InsertCircuitDetails
): Promise<ActionState<SelectCircuitDetails>> {
  try {
    const [newDetails] = await db
      .insert(circuitDetailsTable)
      .values(data)
      .returning()
    return {
      isSuccess: true,
      message: "Circuit details created successfully",
      data: newDetails
    }
  } catch (error) {
    console.error("Error creating circuit details:", error)
    return { isSuccess: false, message: "Failed to create circuit details" }
  }
}

export async function getCircuitDetailsAction(
  circuitId: string
): Promise<ActionState<SelectCircuitDetails>> {
  try {
    const [details] = await db
      .select()
      .from(circuitDetailsTable)
      .where(eq(circuitDetailsTable.circuitId, circuitId))

    if (!details) {
      return { isSuccess: false, message: "Circuit details not found" }
    }

    return {
      isSuccess: true,
      message: "Circuit details retrieved successfully",
      data: details
    }
  } catch (error) {
    console.error("Error getting circuit details:", error)
    return { isSuccess: false, message: "Failed to get circuit details" }
  }
}

// Circuit Airport Actions
export async function createCircuitAirportAction(
  data: InsertAirport
): Promise<ActionState<SelectAirport>> {
  try {
    const [newAirport] = await db.insert(airportsTable).values(data).returning()
    return {
      isSuccess: true,
      message: "Circuit airport created successfully",
      data: newAirport
    }
  } catch (error) {
    console.error("Error creating circuit airport:", error)
    return { isSuccess: false, message: "Failed to create circuit airport" }
  }
}

export async function getCircuitAirportsAction(
  circuitId: string
): Promise<ActionState<SelectAirport[]>> {
  try {
    const airports = await db
      .select()
      .from(airportsTable)
      .where(eq(airportsTable.circuitId, circuitId))

    return {
      isSuccess: true,
      message: "Circuit airports retrieved successfully",
      data: airports
    }
  } catch (error) {
    console.error("Error getting circuit airports:", error)
    return { isSuccess: false, message: "Failed to get circuit airports" }
  }
}

// Circuit Attraction Actions
export async function createCircuitAttractionAction(
  data: InsertLocalAttraction
): Promise<ActionState<SelectLocalAttraction>> {
  try {
    const [newAttraction] = await db
      .insert(localAttractionsTable)
      .values(data)
      .returning()
    return {
      isSuccess: true,
      message: "Circuit attraction created successfully",
      data: newAttraction
    }
  } catch (error) {
    console.error("Error creating circuit attraction:", error)
    return { isSuccess: false, message: "Failed to create circuit attraction" }
  }
}

export async function getCircuitAttractionsAction(
  circuitId: string
): Promise<ActionState<SelectLocalAttraction[]>> {
  try {
    const attractions = await db
      .select()
      .from(localAttractionsTable)
      .where(eq(localAttractionsTable.circuitId, circuitId))

    return {
      isSuccess: true,
      message: "Circuit attractions retrieved successfully",
      data: attractions
    }
  } catch (error) {
    console.error("Error getting circuit attractions:", error)
    return { isSuccess: false, message: "Failed to get circuit attractions" }
  }
}
