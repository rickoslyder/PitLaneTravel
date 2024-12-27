"use server"

import { db } from "@/db/db"
import { adminActivitiesTable, InsertAdminActivity, SelectAdminActivity } from "@/db/schema"
import { ActionState } from "@/types"
import { desc } from "drizzle-orm"

export async function createAdminActivityAction(
    activity: InsertAdminActivity
): Promise<ActionState<SelectAdminActivity>> {
    try {
        const [newActivity] = await db
            .insert(adminActivitiesTable)
            .values(activity)
            .returning()

        return {
            isSuccess: true,
            message: "Activity created successfully",
            data: newActivity
        }
    } catch (error) {
        console.error("Error creating activity:", error)
        return { isSuccess: false, message: "Failed to create activity" }
    }
}

export async function getRecentAdminActivityAction(): Promise<ActionState<SelectAdminActivity[]>> {
    try {
        const activities = await db
            .select()
            .from(adminActivitiesTable)
            .orderBy(desc(adminActivitiesTable.createdAt))
            .limit(10)

        return {
            isSuccess: true,
            message: "Activities retrieved successfully",
            data: activities
        }
    } catch (error) {
        console.error("Error getting activities:", error)
        return { isSuccess: false, message: "Failed to get activities" }
    }
} 