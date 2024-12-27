"use server"

import { db } from "@/db/db"
import { profilesTable, ticketsTable, meetupsTable } from "@/db/schema"
import { ActionState } from "@/types"
import { and, eq, gt } from "drizzle-orm"

interface DashboardData {
    userCount: number
    adminCount: number
    ticketCount: number
    meetupCount: number
    activeNow: number
}

export async function getDashboardDataAction(): Promise<ActionState<DashboardData>> {
    try {
        // Get total users and admin count
        const users = await db.select().from(profilesTable)
        const userCount = users.length
        const adminCount = users.filter(user => user.isAdmin).length

        // Get active tickets count
        const tickets = await db.select().from(ticketsTable)
        const ticketCount = tickets.length

        // Get upcoming meetups count
        const now = new Date()
        const meetups = await db
            .select()
            .from(meetupsTable)
            .where(gt(meetupsTable.date, now))
        const meetupCount = meetups.length

        // For active now, we'll return a placeholder value
        // In a real app, this would come from a real-time service
        const activeNow = 42

        return {
            isSuccess: true,
            message: "Dashboard data retrieved successfully",
            data: {
                userCount,
                adminCount,
                ticketCount,
                meetupCount,
                activeNow
            }
        }
    } catch (error) {
        console.error("Error getting dashboard data:", error)
        return { isSuccess: false, message: "Failed to get dashboard data" }
    }
} 