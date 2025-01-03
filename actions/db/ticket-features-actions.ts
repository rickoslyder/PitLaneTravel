"use server"

import { db } from "@/db/db"
import { ticketFeatureMappingsTable, ticketFeaturesTable } from "@/db/schema"
import { ActionState } from "@/types"
import { SelectTicketFeature, InsertTicketFeature } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { desc } from "drizzle-orm"

export async function getAllTicketFeaturesAction(): Promise<ActionState<SelectTicketFeature[]>> {
    try {
        const features = await db.select().from(ticketFeaturesTable).orderBy(desc(ticketFeaturesTable.name))
        return {
            isSuccess: true,
            message: "Features retrieved successfully",
            data: features
        }
    } catch (error) {
        console.error("Error getting features:", error)
        return { isSuccess: false, message: "Failed to get features" }
    }
}

export async function getTicketFeaturesAction(ticketId: number): Promise<ActionState<SelectTicketFeature[]>> {
    try {
        const features = await db
            .select({
                feature: ticketFeaturesTable
            })
            .from(ticketFeatureMappingsTable)
            .innerJoin(
                ticketFeaturesTable,
                eq(ticketFeaturesTable.id, ticketFeatureMappingsTable.featureId)
            )
            .where(eq(ticketFeatureMappingsTable.ticketId, ticketId))

        return {
            isSuccess: true,
            message: "Features retrieved successfully",
            data: features.map(f => f.feature)
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
            message: "Feature added successfully",
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
            message: "Feature removed successfully",
            data: undefined
        }
    } catch (error) {
        console.error("Error removing feature from ticket:", error)
        return { isSuccess: false, message: "Failed to remove feature from ticket" }
    }
}

export async function toggleTicketFeatureAction(
    id: number,
    isActive: boolean
): Promise<ActionState<void>> {
    try {
        await db
            .update(ticketFeaturesTable)
            .set({ isActive })
            .where(eq(ticketFeaturesTable.id, id))

        return {
            isSuccess: true,
            message: `Feature ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: undefined
        }
    } catch (error) {
        console.error("Error toggling feature status:", error)
        return { isSuccess: false, message: "Failed to toggle feature status" }
    }
}

export async function updateTicketFeatureAction(
    id: number,
    data: Partial<InsertTicketFeature>
): Promise<ActionState<SelectTicketFeature>> {
    try {
        const [updatedFeature] = await db
            .update(ticketFeaturesTable)
            .set(data)
            .where(eq(ticketFeaturesTable.id, id))
            .returning()

        return {
            isSuccess: true,
            message: "Feature updated successfully",
            data: updatedFeature
        }
    } catch (error) {
        console.error("Error updating feature:", error)
        return { isSuccess: false, message: "Failed to update feature" }
    }
} 