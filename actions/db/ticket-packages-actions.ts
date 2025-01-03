"use server"

import { db } from "@/db/db"
import {
  InsertTicketPackage,
  SelectTicketPackage,
  ticketPackagesTable,
  packageTicketsTable,
  ticketsTable,
  SelectTicket,
  ticketPricingTable,
  SelectTicketPricing,
  racesTable
} from "@/db/schema"
import { ActionState } from "@/types"
import { and, eq, desc, isNull } from "drizzle-orm"

interface PackageTicket extends SelectTicket {
  currentPrice?: SelectTicketPricing
  quantity: number
  discountPercentage?: string
}

interface PackageWithTickets extends SelectTicketPackage {
  tickets?: PackageTicket[]
}

interface PackageWithRace extends SelectTicketPackage {
  race: {
    name: string
    date: Date
    season: number
    round: number
    country: string
  }
}

export async function createTicketPackageAction(
  data: InsertTicketPackage,
  tickets: { ticketId: number; quantity: number; discountPercentage?: string }[]
): Promise<ActionState<SelectTicketPackage>> {
  try {
    return await db.transaction(async (tx) => {
      // Create the package
      const [newPackage] = await tx
        .insert(ticketPackagesTable)
        .values({
          ...data,
          basePrice: data.basePrice?.toString() ?? "0",
          maxQuantity: data.maxQuantity ?? "100",
          validFrom: data.validFrom ?? new Date(),
          isFeatured: data.isFeatured ?? false
        })
        .returning()

      // Add tickets if provided
      if (tickets.length > 0) {
        await tx.insert(packageTicketsTable).values(
          tickets.map(ticket => ({
            packageId: newPackage.id,
            ticketId: ticket.ticketId,
            quantity: ticket.quantity,
            discountPercentage: ticket.discountPercentage
          }))
        )
      }

      return {
        isSuccess: true,
        message: "Ticket package created successfully",
        data: newPackage
      }
    })
  } catch (error) {
    console.error("Error creating ticket package:", error)
    return { isSuccess: false, message: "Failed to create ticket package" }
  }
}

export async function getTicketPackageAction(
  id: number
): Promise<ActionState<PackageWithTickets>> {
  try {
    // Get the package
    const [ticketPackage] = await db
      .select()
      .from(ticketPackagesTable)
      .where(eq(ticketPackagesTable.id, id))

    if (!ticketPackage) {
      return { isSuccess: false, message: "Ticket package not found" }
    }

    // Get the tickets in the package with their current pricing
    const packageTickets = await db
      .select({
        ticket: ticketsTable,
        pricing: ticketPricingTable,
        quantity: packageTicketsTable.quantity,
        discountPercentage: packageTicketsTable.discountPercentage
      })
      .from(packageTicketsTable)
      .innerJoin(
        ticketsTable,
        eq(ticketsTable.id, packageTicketsTable.ticketId)
      )
      .leftJoin(
        ticketPricingTable,
        and(
          eq(ticketPricingTable.ticketId, ticketsTable.id),
          isNull(ticketPricingTable.validTo)
        )
      )
      .where(eq(packageTicketsTable.packageId, id))

    // Combine the data
    const result: PackageWithTickets = {
      ...ticketPackage,
      tickets: packageTickets.map(pt => ({
        ...pt.ticket,
        currentPrice: pt.pricing || undefined,
        quantity: Number(pt.quantity),
        discountPercentage: pt.discountPercentage || undefined
      }))
    }

    return {
      isSuccess: true,
      message: "Ticket package retrieved successfully",
      data: result
    }
  } catch (error) {
    console.error("Error getting ticket package:", error)
    return { isSuccess: false, message: "Failed to get ticket package" }
  }
}

export async function getRacePackagesAction(
  raceId: string
): Promise<ActionState<PackageWithTickets[]>> {
  try {
    // Get all packages for the race
    const packages = await db
      .select()
      .from(ticketPackagesTable)
      .where(
        and(
          eq(ticketPackagesTable.raceId, raceId),
          isNull(ticketPackagesTable.validTo)
        )
      )
      .orderBy(desc(ticketPackagesTable.createdAt))

    // Get tickets for each package
    const packagesWithTickets = await Promise.all(
      packages.map(async (pkg) => {
        const packageTickets = await db
          .select({
            ticket: ticketsTable,
            pricing: ticketPricingTable,
            quantity: packageTicketsTable.quantity,
            discountPercentage: packageTicketsTable.discountPercentage
          })
          .from(packageTicketsTable)
          .innerJoin(
            ticketsTable,
            eq(ticketsTable.id, packageTicketsTable.ticketId)
          )
          .leftJoin(
            ticketPricingTable,
            and(
              eq(ticketPricingTable.ticketId, ticketsTable.id),
              isNull(ticketPricingTable.validTo)
            )
          )
          .where(eq(packageTicketsTable.packageId, pkg.id))

        return {
          ...pkg,
          tickets: packageTickets.map(pt => ({
            ...pt.ticket,
            currentPrice: pt.pricing || undefined,
            quantity: Number(pt.quantity),
            discountPercentage: pt.discountPercentage || undefined
          }))
        }
      })
    )

    return {
      isSuccess: true,
      message: "Race packages retrieved successfully",
      data: packagesWithTickets
    }
  } catch (error) {
    console.error("Error getting race packages:", error)
    return { isSuccess: false, message: "Failed to get race packages" }
  }
}

export async function updateTicketPackageAction(
  id: number,
  data: Partial<InsertTicketPackage>
): Promise<ActionState<SelectTicketPackage>> {
  try {
    const [updatedPackage] = await db
      .update(ticketPackagesTable)
      .set(data)
      .where(eq(ticketPackagesTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Ticket package updated successfully",
      data: updatedPackage
    }
  } catch (error) {
    console.error("Error updating ticket package:", error)
    return { isSuccess: false, message: "Failed to update ticket package" }
  }
}

export async function updatePackageTicketsAction(
  packageId: number,
  tickets: { ticketId: number; quantity: number; discountPercentage?: string }[]
): Promise<ActionState<void>> {
  try {
    return await db.transaction(async (tx) => {
      // Remove existing tickets
      await tx
        .delete(packageTicketsTable)
        .where(eq(packageTicketsTable.packageId, packageId))

      // Add new tickets
      if (tickets.length > 0) {
        await tx.insert(packageTicketsTable).values(
          tickets.map(ticket => ({
            packageId,
            ticketId: ticket.ticketId,
            quantity: ticket.quantity,
            discountPercentage: ticket.discountPercentage
          }))
        )
      }

      return {
        isSuccess: true,
        message: "Package tickets updated successfully",
        data: undefined
      }
    })
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

export async function togglePackageFeaturedAction(
  id: number,
  isFeatured: boolean
): Promise<ActionState<SelectTicketPackage>> {
  try {
    const [updatedPackage] = await db
      .update(ticketPackagesTable)
      .set({ isFeatured })
      .where(eq(ticketPackagesTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: `Package ${isFeatured ? "featured" : "unfeatured"} successfully`,
      data: updatedPackage
    }
  } catch (error) {
    console.error("Error toggling package featured status:", error)
    return { isSuccess: false, message: "Failed to toggle package featured status" }
  }
}

export async function getAllTicketPackagesAction(): Promise<ActionState<PackageWithRace[]>> {
  try {
    const packages = await db
      .select()
      .from(ticketPackagesTable)
      .innerJoin(racesTable, eq(ticketPackagesTable.raceId, racesTable.id))
      .orderBy(desc(ticketPackagesTable.createdAt))

    const formattedPackages: PackageWithRace[] = packages.map(pkg => ({
      ...pkg.ticket_packages,
      race: {
        name: pkg.races.name,
        date: pkg.races.date,
        season: pkg.races.season,
        round: pkg.races.round,
        country: pkg.races.country
      }
    }))

    return {
      isSuccess: true,
      message: "Packages retrieved successfully",
      data: formattedPackages
    }
  } catch (error) {
    console.error("Error getting packages:", error)
    return { isSuccess: false, message: "Failed to get packages" }
  }
} 