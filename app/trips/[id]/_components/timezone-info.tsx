"use client"

import { Clock } from "lucide-react"
import { useEffect, useState } from "react"

interface TimezoneInfoProps {
  timezoneId: string | null | undefined
  timezoneName: string | null | undefined
}

export function TimezoneInfo({ timezoneId, timezoneName }: TimezoneInfoProps) {
  const [timeDifference, setTimeDifference] = useState<number>(0)

  useEffect(() => {
    if (timezoneId) {
      const now = new Date()
      const localTimeString = now.toLocaleTimeString("en-US", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hour12: false,
        hour: "numeric"
      })
      const targetTimeString = now.toLocaleTimeString("en-US", {
        timeZone: timezoneId,
        hour12: false,
        hour: "numeric"
      })

      const localHour = parseInt(localTimeString)
      const targetHour = parseInt(targetTimeString)

      // Calculate difference considering day wrap-around
      let diff = targetHour - localHour
      if (diff > 12) diff -= 24
      if (diff < -12) diff += 24

      setTimeDifference(diff)
    }
  }, [timezoneId])

  if (!timezoneId || !timezoneName) {
    return null
  }

  const formatTimeDifference = (diff: number) => {
    if (diff === 0) return "same timezone as you"
    const ahead = diff > 0
    const hours = Math.abs(diff)
    return `${hours} hour${hours !== 1 ? "s" : ""} ${ahead ? "ahead of" : "behind"} your timezone`
  }

  return (
    <div className="flex items-center gap-2">
      <Clock className="text-primary size-5" />
      <span>
        {timezoneName} - {formatTimeDifference(timeDifference)}
      </span>
    </div>
  )
}
