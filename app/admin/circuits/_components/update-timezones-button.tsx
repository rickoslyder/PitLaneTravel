"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function UpdateTimezonesButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/circuits/update-timezones", {
        method: "POST"
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const data = await response.json()
      toast.success(data.message)
    } catch (error) {
      console.error("Error updating timezones:", error)
      toast.error("Failed to update circuit timezones")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleUpdate} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Updating Timezones...
        </>
      ) : (
        "Update Circuit Timezones"
      )}
    </Button>
  )
}
