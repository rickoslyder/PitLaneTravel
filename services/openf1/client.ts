import { OpenF1Circuit, OpenF1Error, OpenF1Session } from "./types"

export class OpenF1Client {
  private baseUrl = "https://api.openf1.org/v1"
  private cache: Map<string, { data: any; timestamp: number }>
  private cacheTimeout: number = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.cache = new Map()
  }

  private async fetchWithCache<T>(endpoint: string): Promise<T> {
    const cacheKey = endpoint
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`)

      if (!response.ok) {
        throw new OpenF1Error(
          `Failed to fetch data from OpenF1: ${response.statusText}`,
          response.status,
          endpoint
        )
      }

      const data = await response.json()

      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      })

      return data as T
    } catch (error) {
      if (error instanceof OpenF1Error) {
        throw error
      }
      throw new OpenF1Error(
        `OpenF1 API Error: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        endpoint
      )
    }
  }

  async getCircuits(): Promise<OpenF1Circuit[]> {
    return this.fetchWithCache<OpenF1Circuit[]>("/circuits")
  }

  async getCircuitByKey(circuitKey: number): Promise<OpenF1Circuit> {
    const circuits = await this.getCircuits()
    const circuit = circuits.find((c) => c.circuit_key === circuitKey)

    if (!circuit) {
      throw new OpenF1Error(
        `Circuit not found with key: ${circuitKey}`,
        404,
        `/circuits?circuit_key=${circuitKey}`
      )
    }

    return circuit
  }

  async findCircuitByName(name: string): Promise<OpenF1Circuit | null> {
    const circuits = await this.getCircuits()
    const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, "")

    return (
      circuits.find(
        (c) =>
          c.circuit_name.toLowerCase().replace(/[^a-z0-9]/g, "") ===
            normalizedName ||
          c.circuit_short_name.toLowerCase().replace(/[^a-z0-9]/g, "") ===
            normalizedName
      ) || null
    )
  }

  async getSessions(year: number): Promise<OpenF1Session[]> {
    return this.fetchWithCache<OpenF1Session[]>(`/sessions?year=${year}`)
  }
} 