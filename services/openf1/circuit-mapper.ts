import { eq } from "drizzle-orm"
import { db } from "@/db/db"
import { circuitsTable } from "@/db/schema"
import { OpenF1Client } from "./client"
import { OpenF1Circuit } from "./types"

export class CircuitMapper {
  private client: OpenF1Client

  constructor() {
    this.client = new OpenF1Client()
  }

  /**
   * Initialize OpenF1 mappings for all circuits in our database
   */
  async initializeCircuitMappings() {
    const circuits = await db.select().from(circuitsTable)
    let mappedCount = 0

    for (const circuit of circuits) {
      try {
        // Skip if already mapped
        if (circuit.openf1Key) continue

        // Try to find matching OpenF1 circuit
        const openF1Circuit = await this.client.findCircuitByName(circuit.name)

        if (openF1Circuit) {
          await db
            .update(circuitsTable)
            .set({
              openf1Key: openF1Circuit.circuit_key,
              openf1ShortName: openF1Circuit.circuit_short_name
            })
            .where(eq(circuitsTable.id, circuit.id))

          mappedCount++
        } else {
          console.warn(`No OpenF1 mapping found for circuit: ${circuit.name}`)
        }
      } catch (error) {
        console.error(
          `Error mapping circuit ${circuit.name}:`,
          error instanceof Error ? error.message : error
        )
      }
    }

    return {
      totalCircuits: circuits.length,
      mappedCircuits: mappedCount
    }
  }

  /**
   * Get OpenF1 circuit key for a given circuit ID
   */
  async getOpenF1Key(circuitId: string): Promise<number | null> {
    const circuit = await db
      .select({ openf1Key: circuitsTable.openf1Key })
      .from(circuitsTable)
      .where(eq(circuitsTable.id, circuitId))
      .limit(1)
      .then(rows => rows[0])

    return circuit?.openf1Key ?? null
  }

  /**
   * Get our circuit ID for a given OpenF1 circuit key
   */
  async getCircuitId(openF1Key: number): Promise<string | null> {
    const circuit = await db
      .select({ id: circuitsTable.id })
      .from(circuitsTable)
      .where(eq(circuitsTable.openf1Key, openF1Key))
      .limit(1)
      .then(rows => rows[0])

    return circuit?.id ?? null
  }

  /**
   * Get OpenF1 circuit details for a given circuit ID
   */
  async getOpenF1Circuit(circuitId: string): Promise<OpenF1Circuit | null> {
    const openF1Key = await this.getOpenF1Key(circuitId)
    if (!openF1Key) return null

    try {
      return await this.client.getCircuitByKey(openF1Key)
    } catch (error) {
      console.error(
        `Error fetching OpenF1 circuit details for key ${openF1Key}:`,
        error instanceof Error ? error.message : error
      )
      return null
    }
  }

  /**
   * Verify circuit mapping integrity
   */
  async verifyMappings() {
    const circuits = await db
      .select({
        id: circuitsTable.id,
        name: circuitsTable.name,
        openf1Key: circuitsTable.openf1Key
      })
      .from(circuitsTable)

    const results = {
      total: circuits.length,
      mapped: 0,
      unmapped: 0,
      verified: 0,
      failed: 0,
      failures: [] as { circuitId: string; name: string; reason: string }[]
    }

    for (const circuit of circuits) {
      if (!circuit.openf1Key) {
        results.unmapped++
        results.failures.push({
          circuitId: circuit.id,
          name: circuit.name,
          reason: "No OpenF1 mapping"
        })
        continue
      }

      results.mapped++

      try {
        const openF1Circuit = await this.client.getCircuitByKey(circuit.openf1Key)
        if (openF1Circuit) {
          results.verified++
        } else {
          results.failed++
          results.failures.push({
            circuitId: circuit.id,
            name: circuit.name,
            reason: "OpenF1 circuit not found"
          })
        }
      } catch (error) {
        results.failed++
        results.failures.push({
          circuitId: circuit.id,
          name: circuit.name,
          reason: error instanceof Error ? error.message : String(error)
        })
      }
    }

    return results
  }
} 