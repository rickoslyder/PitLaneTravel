"use server"

import { db } from "@/db/db"
import {
  InsertTicket,
  SelectTicket,
  ticketsTable,
  InsertTicketPricing,
  SelectTicketPricing,
  ticketPricingTable,
  InsertTicketFeature,
  SelectTicketFeature,
  ticketFeaturesTable,
  ticketFeatureMappingsTable,
  racesTable
} from "@/db/schema"
import { ActionState } from "@/types"
import { eq, and, isNull, desc } from "drizzle-orm"

// Ticket Actions
export async function createTicketAction(
  data: InsertTicket,
  pricing: Omit<InsertTicketPricing, "id" | "ticketId">,
  featureIds?: number[]
): Promise<ActionState<SelectTicket>> {
  try {
    // Debug log the incoming data
    console.log("Creating ticket with data:", {
      ...data,
      seatingDetails: data.seatingDetails || "NO_SEATING_DETAILS"
    })

    // Start transaction to ensure all related data is created
    return await db.transaction(async (tx) => {
      // Create ticket
      const [newTicket] = await tx.insert(ticketsTable).values(data).returning()

      // Debug log the created ticket
      console.log("Created ticket:", {
        ...newTicket,
        seatingDetails: newTicket.seatingDetails || "NO_SEATING_DETAILS"
      })

      // Add pricing with validation
      if (!pricing.validFrom) {
        pricing.validFrom = new Date()
      }

      // Ensure validFrom is a Date object
      if (typeof pricing.validFrom === 'string') {
        pricing.validFrom = new Date(pricing.validFrom)
      }

      // Ensure validTo is a Date object if it exists
      if (pricing.validTo && typeof pricing.validTo === 'string') {
        pricing.validTo = new Date(pricing.validTo)
      }

      await tx.insert(ticketPricingTable).values({
        ticketId: newTicket.id,
        price: pricing.price.toString(), // Convert to string for DB
        currency: pricing.currency,
        validFrom: pricing.validFrom,
        validTo: pricing.validTo
      })

      // Add features if provided
      if (featureIds?.length) {
        await tx.insert(ticketFeatureMappingsTable).values(
          featureIds.map(featureId => ({
            ticketId: newTicket.id,
            featureId
          }))
        )
      }

      return {
        isSuccess: true,
        message: "Ticket created successfully",
        data: newTicket
      }
    })
  } catch (error) {
    console.error("Error creating ticket:", error)
    return { isSuccess: false, message: "Failed to create ticket" }
  }
}

export async function getTicketAction(
  id: number
): Promise<ActionState<SelectTicket>> {
  try {
    const [ticket] = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.id, id))

    if (!ticket) {
      return { isSuccess: false, message: "Ticket not found" }
    }

    return {
      isSuccess: true,
      message: "Ticket retrieved successfully",
      data: ticket
    }
  } catch (error) {
    console.error("Error getting ticket:", error)
    return { isSuccess: false, message: "Failed to get ticket" }
  }
}

export async function getRaceTicketsAction(
  raceId: string
): Promise<ActionState<(SelectTicket & { currentPrice?: SelectTicketPricing; features?: SelectTicketFeature[] })[]>> {
  try {
    // Get tickets with their current pricing and features
    const tickets = await db
      .select({
        ticket: ticketsTable,
        currentPrice: ticketPricingTable,
        features: ticketFeaturesTable
      })
      .from(ticketsTable)
      .leftJoin(
        ticketPricingTable,
        and(
          eq(ticketPricingTable.ticketId, ticketsTable.id),
          isNull(ticketPricingTable.validTo)
        )
      )
      .leftJoin(
        ticketFeatureMappingsTable,
        eq(ticketFeatureMappingsTable.ticketId, ticketsTable.id)
      )
      .leftJoin(
        ticketFeaturesTable,
        eq(ticketFeaturesTable.id, ticketFeatureMappingsTable.featureId)
      )
      .where(eq(ticketsTable.raceId, raceId))

    // Group features by ticket
    const groupedTickets = tickets.reduce((acc, row) => {
      const ticketId = row.ticket.id
      if (!acc[ticketId]) {
        acc[ticketId] = {
          ...row.ticket,
          currentPrice: row.currentPrice,
          features: row.features ? [row.features] : []
        }
      } else if (row.features) {
        acc[ticketId].features.push(row.features)
      }
      return acc
    }, {} as Record<number, any>)

    return {
      isSuccess: true,
      message: "Race tickets retrieved successfully",
      data: Object.values(groupedTickets)
    }
  } catch (error) {
    console.error("Error getting race tickets:", error)
    return { isSuccess: false, message: "Failed to get race tickets" }
  }
}

// Ticket Features Actions
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

export async function getTicketFeaturesAction(
  ticketId: number
): Promise<ActionState<SelectTicketFeature[]>> {
  try {
    const features = await db
      .select()
      .from(ticketFeatureMappingsTable)
      .innerJoin(
        ticketFeaturesTable,
        eq(ticketFeaturesTable.id, ticketFeatureMappingsTable.featureId)
      )
      .where(eq(ticketFeatureMappingsTable.ticketId, ticketId))

    return {
      isSuccess: true,
      message: "Ticket features retrieved successfully",
      data: features.map(f => f.ticket_features)
    }
  } catch (error) {
    console.error("Error getting ticket features:", error)
    return { isSuccess: false, message: "Failed to get ticket features" }
  }
}

// Ticket Pricing Actions
export async function createTicketPricingAction(
  data: InsertTicketPricing
): Promise<ActionState<SelectTicketPricing>> {
  try {
    const [newPricing] = await db
      .insert(ticketPricingTable)
      .values(data)
      .returning()
    return {
      isSuccess: true,
      message: "Ticket pricing created successfully",
      data: newPricing
    }
  } catch (error) {
    console.error("Error creating ticket pricing:", error)
    return { isSuccess: false, message: "Failed to create ticket pricing" }
  }
}

export async function getTicketPricingHistoryAction(
  ticketId: number
): Promise<ActionState<SelectTicketPricing[]>> {
  try {
    const pricing = await db
      .select()
      .from(ticketPricingTable)
      .where(eq(ticketPricingTable.ticketId, ticketId))
      .orderBy(desc(ticketPricingTable.validFrom))

    return {
      isSuccess: true,
      message: "Ticket pricing history retrieved successfully",
      data: pricing
    }
  } catch (error) {
    console.error("Error getting ticket pricing history:", error)
    return { isSuccess: false, message: "Failed to get ticket pricing history" }
  }
}

export async function getTicketsAction(): Promise<ActionState<(SelectTicket & { race: { id: string; name: string; season: number }; pricing?: SelectTicketPricing; features?: SelectTicketFeature[] })[]>> {
  try {
    const tickets = await db
      .select({
        ticket: ticketsTable,
        race: {
          id: racesTable.id,
          name: racesTable.name,
          season: racesTable.season
        },
        pricing: ticketPricingTable,
        feature: ticketFeaturesTable
      })
      .from(ticketsTable)
      .innerJoin(racesTable, eq(ticketsTable.raceId, racesTable.id))
      .leftJoin(
        ticketPricingTable,
        and(
          eq(ticketPricingTable.ticketId, ticketsTable.id),
          isNull(ticketPricingTable.validTo)
        )
      )
      .leftJoin(
        ticketFeatureMappingsTable,
        eq(ticketFeatureMappingsTable.ticketId, ticketsTable.id)
      )
      .leftJoin(
        ticketFeaturesTable,
        eq(ticketFeaturesTable.id, ticketFeatureMappingsTable.featureId)
      )
      .orderBy(desc(ticketsTable.createdAt))

    // Group features by ticket
    const groupedTickets = tickets.reduce((acc, row) => {
      const ticketId = row.ticket.id
      if (!acc[ticketId]) {
        acc[ticketId] = {
          ...row.ticket,
          race: row.race,
          pricing: row.pricing || undefined,
          features: row.feature ? [row.feature] : []
        }
      } else if (row.feature) {
        acc[ticketId].features.push(row.feature)
      }
      return acc
    }, {} as Record<number, any>)

    return {
      isSuccess: true,
      message: "Tickets retrieved successfully",
      data: Object.values(groupedTickets)
    }
  } catch (error) {
    console.error("Error getting tickets:", error)
    return { isSuccess: false, message: "Failed to get tickets" }
  }
}

export async function updateTicketAction(
  id: number,
  data: Partial<InsertTicket>
): Promise<ActionState<SelectTicket>> {
  try {
    const [updatedTicket] = await db
      .update(ticketsTable)
      .set(data)
      .where(eq(ticketsTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Ticket updated successfully",
      data: updatedTicket
    }
  } catch (error) {
    console.error("Error updating ticket:", error)
    return { isSuccess: false, message: "Failed to update ticket" }
  }
}

export async function deleteTicketAction(
  id: number
): Promise<ActionState<void>> {
  try {
    await db.delete(ticketsTable).where(eq(ticketsTable.id, id))

    return {
      isSuccess: true,
      message: "Ticket deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting ticket:", error)
    return { isSuccess: false, message: "Failed to delete ticket" }
  }
}

export async function updateTicketPricingAction(
  ticketId: number,
  pricing: {
    price: number
    currency: string
    validFrom: Date
    validTo?: Date
  }
): Promise<ActionState<void>> {
  try {
    return await db.transaction(async (tx) => {
      // Set end date for current price
      await tx
        .update(ticketPricingTable)
        .set({ validTo: pricing.validFrom })
        .where(
          and(
            eq(ticketPricingTable.ticketId, ticketId),
            isNull(ticketPricingTable.validTo)
          )
        )

      // Insert new price
      await tx.insert(ticketPricingTable).values({
        ticketId,
        price: pricing.price.toString(), // Convert to string for DB
        currency: pricing.currency,
        validFrom: pricing.validFrom,
        validTo: pricing.validTo
      })

      return {
        isSuccess: true,
        message: "Ticket pricing updated successfully",
        data: undefined
      }
    })
  } catch (error) {
    console.error("Error updating ticket pricing:", error)
    return { isSuccess: false, message: "Failed to update ticket pricing" }
  }
}

export async function updateTicketFeaturesAction(
  ticketId: number,
  featureIds: number[]
): Promise<ActionState<void>> {
  try {
    return await db.transaction(async (tx) => {
      // Remove existing features
      await tx
        .delete(ticketFeatureMappingsTable)
        .where(eq(ticketFeatureMappingsTable.ticketId, ticketId))

      // Add new features
      if (featureIds.length > 0) {
        await tx.insert(ticketFeatureMappingsTable).values(
          featureIds.map(featureId => ({
            ticketId,
            featureId
          }))
        )
      }

      return {
        isSuccess: true,
        message: "Ticket features updated successfully",
        data: undefined
      }
    })
  } catch (error) {
    console.error("Error updating ticket features:", error)
    return { isSuccess: false, message: "Failed to update ticket features" }
  }
}
