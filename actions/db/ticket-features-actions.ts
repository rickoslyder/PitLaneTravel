"use server"

import { db } from "@/db/db"
import {
  InsertTicketFeature,
  SelectTicketFeature,
  ticketFeaturesTable,
  InsertTicketFeatureMapping,
  ticketFeatureMappingsTable
} from "@/db/schema"
import { ActionState } from "@/types"
import { and, eq } from "drizzle-orm"

export async function createTicketFeatureAction(
  data: InsertTicketFeature
): Promise<ActionState<SelectTicketFeature>> {
  try {
    const [newFeature] = await db
      .insert(ticketFeaturesTable)
      .values(data)
      .returning()
    return {
      isSuccess: true,
      message: "Ticket feature created successfully",
      data: newFeature
    }
  } catch (error) {
    console.error("Error creating ticket feature:", error)
    return { isSuccess: false, message: "Failed to create ticket feature" }
  }
}

export async function getAllTicketFeaturesAction(): Promise<
  ActionState<SelectTicketFeature[]>
> {
  try {
    const features = await db.select().from(ticketFeaturesTable)
    return {
      isSuccess: true,
      message: "Ticket features retrieved successfully",
      data: features
    }
  } catch (error) {
    console.error("Error getting ticket features:", error)
    return { isSuccess: false, message: "Failed to get ticket features" }
  }
}

export async function getTicketFeaturesAction(
  ticketId: number
): Promise<ActionState<SelectTicketFeature[]>> {
  try {
    const features = await db
      .select({
        id: ticketFeaturesTable.id,
        name: ticketFeaturesTable.name,
        description: ticketFeaturesTable.description
      })
      .from(ticketFeatureMappingsTable)
      .innerJoin(
        ticketFeaturesTable,
        eq(ticketFeatureMappingsTable.featureId, ticketFeaturesTable.id)
      )
      .where(eq(ticketFeatureMappingsTable.ticketId, ticketId))

    return {
      isSuccess: true,
      message: "Ticket features retrieved successfully",
      data: features
    }
  } catch (error) {
    console.error("Error getting ticket features:", error)
    return { isSuccess: false, message: "Failed to get ticket features" }
  }
}

export async function addFeatureToTicketAction(
  ticketId: number,
  featureId: number
): Promise<ActionState<void>> {
  try {
    await db.insert(ticketFeatureMappingsTable).values({
      ticketId,
      featureId
    })

    return {
      isSuccess: true,
      message: "Feature added to ticket successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error adding feature to ticket:", error)
    return { isSuccess: false, message: "Failed to add feature to ticket" }
  }
}

export async function removeFeatureFromTicketAction(
  ticketId: number,
  featureId: number
): Promise<ActionState<void>> {
  try {
    await db
      .delete(ticketFeatureMappingsTable)
      .where(
        and(
          eq(ticketFeatureMappingsTable.ticketId, ticketId),
          eq(ticketFeatureMappingsTable.featureId, featureId)
        )
      )

    return {
      isSuccess: true,
      message: "Feature removed from ticket successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error removing feature from ticket:", error)
    return { isSuccess: false, message: "Failed to remove feature from ticket" }
  }
} 