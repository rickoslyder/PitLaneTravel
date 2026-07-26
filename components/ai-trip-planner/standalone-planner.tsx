"use client"

import { useState } from "react"
import { AiTripPlanner } from "@/components/ai-trip-planner"
import { useToast } from "@/lib/hooks/use-toast"

/**
 * Standalone entry point for the AI planning assistant (not tied to a saved trip).
 * Suggestions the user "adds" are copied to the clipboard so they can paste them into
 * a trip they create later.
 */
export function StandalonePlanner() {
  const { toast } = useToast()
  const [added, setAdded] = useState<string[]>([])

  const handleAddActivity = async (activity: string) => {
    setAdded(prev => [...prev, activity])
    try {
      await navigator.clipboard.writeText(activity)
      toast({
        title: "Suggestion copied",
        description: "Paste it into your trip itinerary when you create one."
      })
    } catch {
      toast({ title: "Suggestion noted", description: activity })
    }
  }

  return (
    <div className="space-y-4">
      <AiTripPlanner onAddActivity={handleAddActivity} standalone />
      {added.length > 0 && (
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 text-sm font-semibold">
            Saved suggestions ({added.length})
          </h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {added.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
