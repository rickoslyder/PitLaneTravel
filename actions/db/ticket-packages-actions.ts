"use server"

import { db } from "@/db/db"
import {
  InsertTicketPackage,
  SelectTicketPackage,
  ticketPackagesTable,
  packageTicketsTable,
  ticketsTable,
  SelectTicket
} from "@/db/schema"
import { ActionState } from "@/types"
import { eq } from "drizzle-orm"

export async function createTicketPackageAction(
  data: InsertTicketPackage,
  tickets: { ticketId: number; quantity: string; discountPercentage?: string }[]
): Promise<ActionState<SelectTicketPackage>> {
  try {
    const [newPackage] = await db
      .insert(ticketPackagesTable)
      .values(data)
      .returning()

    await db.insert(packageTicketsTable).values(
      tickets.map(ticket => ({
        packageId: newPackage.id,
        ...ticket,
        quantity: Number(ticket.quantity)
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

export async function getTicketPackageAction(
  id: number
): Promise<ActionState<SelectTicketPackage>> {
  try {
    const [ticketPackage] = await db
      .select()
      .from(ticketPackagesTable)
      .where(eq(ticketPackagesTable.id, id))

    if (!ticketPackage) {
      return { isSuccess: false, message: "Ticket package not found" }
    }

    return {
      isSuccess: true,
      message: "Ticket package retrieved successfully",
      data: ticketPackage
    }
  } catch (error) {
    console.error("Error getting ticket package:", error)
    return { isSuccess: false, message: "Failed to get ticket package" }
  }
}

export async function getAllTicketPackagesAction(): Promise<
  ActionState<SelectTicketPackage[]>
> {
  try {
    const packages = await db.select().from(ticketPackagesTable)
    return {
      isSuccess: true,
      message: "Ticket packages retrieved successfully",
      data: packages
    }
  } catch (error) {
    console.error("Error getting ticket packages:", error)
    return { isSuccess: false, message: "Failed to get ticket packages" }
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

export async function updatePackageTicketsAction(
  packageId: number,
  tickets: { ticketId: number; quantity: string; discountPercentage?: string }[]
): Promise<ActionState<void>> {
  try {
    // Delete existing package tickets
    await db
      .delete(packageTicketsTable)
      .where(eq(packageTicketsTable.packageId, packageId))

    // Insert new package tickets
    await db.insert(packageTicketsTable).values(
      tickets.map(ticket => ({
        packageId,
        ...ticket,
        quantity: Number(ticket.quantity)
      }))
    )

    return {
      isSuccess: true,
      message: "Package tickets updated successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error updating package tickets:", error)
    return { isSuccess: false, message: "Failed to update package tickets" }
  }
}

export async function deleteTicketPackageAction(
  id: number
): Promise<ActionState<void>> {
  try {
    await db.delete(ticketPackagesTable).where(eq(ticketPackagesTable.id, id))
    return {
      isSuccess: true,
      message: "Ticket package deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting ticket package:", error)
    return { isSuccess: false, message: "Failed to delete ticket package" }
  }
} 