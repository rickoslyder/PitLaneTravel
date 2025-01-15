"use client"

import { useState, useEffect } from "react"
import { SelectTicket, SelectTicketPackage } from "@/db/schema"

interface TicketData {
  tickets: (SelectTicket & { features: any[]; currentPrice: any })[]
  packages: (SelectTicketPackage & { tickets: any[] })[]
}

export function useTickets(raceId: string) {
  const [data, setData] = useState<TicketData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/races/${raceId}/tickets`)
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error("Error fetching tickets:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [raceId])

  return { data, loading }
}
