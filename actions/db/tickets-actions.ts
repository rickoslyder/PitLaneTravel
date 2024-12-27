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
  InsertTicketFeatureMapping,
  ticketFeatureMappingsTable,
  InsertTicketPackage,
  SelectTicketPackage,
  ticketPackagesTable,
  InsertPackageTicket,
  packageTicketsTable
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
    const [newTicket] = await db.insert(ticketsTable).values(data).returning()

    // Add pricing
    await db.insert(ticketPricingTable).values({
      ticketId: newTicket.id,
      ...pricing
    })

    // Add features if provided
    if (featureIds?.length) {
      await db.insert(ticketFeatureMappingsTable).values(
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
): Promise<ActionState<SelectTicket[]>> {
  try {
    const raceTickets = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.raceId, raceId))

    return {
      isSuccess: true,
      message: "Race tickets retrieved successfully",
      data: raceTickets
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

// Ticket Packages Actions
export async function createTicketPackageAction(
  data: InsertTicketPackage,
  tickets: { ticketId: number; quantity: number; discountPercentage?: string }[]
): Promise<ActionState<SelectTicketPackage>> {
  try {
    const [newPackage] = await db
      .insert(ticketPackagesTable)
      .values(data)
      .returning()

    await db.insert(packageTicketsTable).values(
      tickets.map(ticket => ({
        packageId: newPackage.id,
        ticketId: ticket.ticketId,
        quantity: ticket.quantity,
        discountPercentage: ticket.discountPercentage
      }))
    )

    return {
      isSuccess: true,
      message: "Ticket package created successfully",
      data: newPackage
    }
  } catch (error) {
    console.error("Error creating ticket package:", error)
    return { isSuccess: false, message: "Failed to create ticket package" }
  }
}

export async function getPackageTicketsAction(
  packageId: number
): Promise<ActionState<(SelectTicket & { quantity: number; discountPercentage: string | null })[]>> {
  try {
    const tickets = await db
      .select({
        id: ticketsTable.id,
        raceId: ticketsTable.raceId,
        title: ticketsTable.title,
        description: ticketsTable.description,
        ticketType: ticketsTable.ticketType,
        availability: ticketsTable.availability,
        daysIncluded: ticketsTable.daysIncluded,
        isChildTicket: ticketsTable.isChildTicket,
        resellerUrl: ticketsTable.resellerUrl,
        createdAt: ticketsTable.createdAt,
        updatedAt: ticketsTable.updatedAt,
        updatedBy: ticketsTable.updatedBy,
        quantity: packageTicketsTable.quantity,
        discountPercentage: packageTicketsTable.discountPercentage
      })
      .from(packageTicketsTable)
      .innerJoin(
        ticketsTable,
        eq(packageTicketsTable.ticketId, ticketsTable.id)
      )
      .where(eq(packageTicketsTable.packageId, packageId))

    return {
      isSuccess: true,
      message: "Package tickets retrieved successfully",
      data: tickets
    }
  } catch (error) {
    console.error("Error getting package tickets:", error)
    return { isSuccess: false, message: "Failed to get package tickets" }
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

export async function getTicketsAction(): Promise<ActionState<SelectTicket[]>> {
  try {
    const tickets = await db
      .select()
      .from(ticketsTable)
      .orderBy(desc(ticketsTable.createdAt))

    return {
      isSuccess: true,
      message: "Tickets retrieved successfully",
      data: tickets
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
