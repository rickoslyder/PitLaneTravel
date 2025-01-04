"use client"

import { getRaceHistoryAction } from "@/actions/db/race-history-actions"
import { SelectRaceHistory } from "@/db/schema/race-history-schema"
import { useEffect, useState } from "react"

export function useRaceHistory(raceId: string) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<SelectRaceHistory | null>(null)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const result = await getRaceHistoryAction(raceId)
        if (result.isSuccess) {
          setHistory(result.data)
        } else {
          setError(result.message)
        }
      } catch (error) {
        setError("Failed to fetch race history")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [raceId])

  return { loading, error, history }
}