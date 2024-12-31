import { eq } from "drizzle-orm"
import { db } from "@/db/db"
import { racesTable, supportingSeriesTable } from "@/db/schema"
import { OpenF1Client } from "./client"
import { OpenF1Session } from "./types"

export class SessionUpdater {
  private client: OpenF1Client
  private pollingInterval: number // milliseconds
  private isPolling: boolean
  private currentSeason: number

  constructor(pollingInterval = 30000) { // Default to 30 seconds
    this.client = new OpenF1Client()
    this.pollingInterval = pollingInterval
    this.isPolling = false
    this.currentSeason = new Date().getFullYear()
  }

  /**
   * Start polling for session updates
   */
  async startPolling() {
    if (this.isPolling) return
    this.isPolling = true
    
    console.log("Starting OpenF1 session polling...")
    
    while (this.isPolling) {
      try {
        await this.updateAllSessions()
        await new Promise(resolve => setTimeout(resolve, this.pollingInterval))
      } catch (error) {
        console.error(
          "Error during session update:",
          error instanceof Error ? error.message : error
        )
      }
    }
  }

  /**
   * Stop polling for session updates
   */
  stopPolling() {
    this.isPolling = false
    console.log("Stopping OpenF1 session polling...")
  }

  /**
   * Update all active sessions
   */
  private async updateAllSessions() {
    const sessions = await this.client.getSessions(this.currentSeason)
    
    // Update F1 races
    const races = await db
      .select({
        id: racesTable.id,
        openf1SessionKey: racesTable.openf1SessionKey,
        status: racesTable.status
      })
      .from(racesTable)
      .where(eq(racesTable.season, this.currentSeason))

    for (const race of races) {
      if (!race.openf1SessionKey) continue

      const session = sessions.find(s => s.session_key === race.openf1SessionKey)
      if (!session) continue

      const newStatus = this.mapF1SessionStatus(session.status)
      if (newStatus !== race.status) {
        await db
          .update(racesTable)
          .set({ status: newStatus })
          .where(eq(racesTable.id, race.id))

        console.log(`Updated race ${race.id} status to ${newStatus}`)
      }
    }

    // Update supporting series
    const supportingSeries = await db
      .select({
        id: supportingSeriesTable.id,
        openf1SessionKey: supportingSeriesTable.openf1SessionKey,
        status: supportingSeriesTable.status
      })
      .from(supportingSeriesTable)
      .innerJoin(
        racesTable,
        eq(supportingSeriesTable.raceId, racesTable.id)
      )
      .where(eq(racesTable.season, this.currentSeason))

    for (const series of supportingSeries) {
      if (!series.openf1SessionKey) continue

      const session = sessions.find(s => s.session_key === series.openf1SessionKey)
      if (!session) continue

      const newStatus = this.mapSupportingSeriesStatus(session.status)
      if (newStatus !== series.status) {
        await db
          .update(supportingSeriesTable)
          .set({ status: newStatus })
          .where(eq(supportingSeriesTable.id, series.id))

        console.log(`Updated supporting series ${series.id} status to ${newStatus}`)
      }
    }
  }

  /**
   * Map OpenF1 session status to F1 race status
   */
  private mapF1SessionStatus(openF1Status: string): "upcoming" | "in_progress" | "completed" | "cancelled" {
    switch (openF1Status.toLowerCase()) {
      case "started":
        return "in_progress"
      case "finished":
        return "completed"
      case "cancelled":
        return "cancelled"
      default:
        return "upcoming"
    }
  }

  /**
   * Map OpenF1 session status to supporting series status
   */
  private mapSupportingSeriesStatus(openF1Status: string): "scheduled" | "live" | "completed" | "delayed" | "cancelled" {
    switch (openF1Status.toLowerCase()) {
      case "started":
        return "live"
      case "finished":
        return "completed"
      case "delayed":
        return "delayed"
      case "cancelled":
        return "cancelled"
      default:
        return "scheduled"
    }
  }
} 