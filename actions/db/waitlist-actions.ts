"use server"

import { db } from "@/db/db"
import { InsertWaitlist, SelectWaitlist, waitlistTable } from "@/db/schema"
import { ActionState } from "@/types"
import { and, eq } from "drizzle-orm"

export async function createWaitlistEntryAction(
    waitlist: InsertWaitlist
): Promise<ActionState<SelectWaitlist>> {
    try {
        const [newEntry] = await db
            .insert(waitlistTable)
            .values(waitlist)
            .returning()

        return {
            isSuccess: true,
            message: "Successfully joined waitlist",
            data: newEntry
        }
    } catch (error) {
        console.error("Error creating waitlist entry:", error)
        return { isSuccess: false, message: "Failed to join waitlist" }
    }
}

export async function getWaitlistEntriesAction(
    userId: string,
    raceId: string
): Promise<ActionState<SelectWaitlist[]>> {
    try {
        const entries = await db
            .select()
            .from(waitlistTable)
            .where(
                and(
                    eq(waitlistTable.userId, userId),
                    eq(waitlistTable.raceId, raceId)
                )
            )

        return {
            isSuccess: true,
            message: "Successfully retrieved waitlist entries",
            data: entries
        }
    } catch (error) {
        console.error("Error getting waitlist entries:", error)
        return { isSuccess: false, message: "Failed to get waitlist entries" }
    }
}

export async function updateWaitlistEntryAction(
    id: string,
    userId: string,
    data: Partial<InsertWaitlist>
): Promise<ActionState<SelectWaitlist>> {
    try {
        const [updatedEntry] = await db
            .update(waitlistTable)
            .set(data)
            .where(
                and(eq(waitlistTable.id, id), eq(waitlistTable.userId, userId))
            )
            .returning()

        if (!updatedEntry) {
            return {
                isSuccess: false,
                message: "Waitlist entry not found"
            }
        }

        return {
            isSuccess: true,
            message: "Successfully updated waitlist entry",
            data: updatedEntry
        }
    } catch (error) {
        console.error("Error updating waitlist entry:", error)
        return { isSuccess: false, message: "Failed to update waitlist entry" }
    }
}

export async function deleteWaitlistEntryAction(
    id: string,
    userId: string
): Promise<ActionState<void>> {
    try {
        await db
            .delete(waitlistTable)
            .where(
                and(eq(waitlistTable.id, id), eq(waitlistTable.userId, userId))
            )

        return {
            isSuccess: true,
            message: "Successfully removed from waitlist",
            data: undefined
        }
    } catch (error) {
        console.error("Error deleting waitlist entry:", error)
        return { isSuccess: false, message: "Failed to remove from waitlist" }
    }
} 