"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface RaceStatus {
  status: "upcoming" | "live" | "completed" | "cancelled"
  openf1Data?: {
    sessionType: string
    date: string
  }
}

export default function RacePage({ params }: { params: { id: string } }) {
  const [status, setStatus] = useState<RaceStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/races/${params.id}/status`)
        if (!response.ok) throw new Error("Failed to fetch race status")
        const data = await response.json()
        setStatus(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      }
    }

    // Fetch immediately and then every 30 seconds
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)

    return () => clearInterval(interval)
  }, [params.id])

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  if (!status) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-4">
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Race Status</h1>
          <Badge
            variant={
              status.status === "live"
                ? "destructive"
                : status.status === "completed"
                  ? "default"
                  : "secondary"
            }
          >
            {status.status.toUpperCase()}
          </Badge>
        </div>

        {status.openf1Data && (
          <div className="mt-4">
            <h2 className="mb-2 text-xl font-semibold">Live Data</h2>
            <div className="space-y-2">
              <p>Session: {status.openf1Data.sessionType}</p>
              <p>
                Last Updated:{" "}
                {new Date(status.openf1Data.date).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
