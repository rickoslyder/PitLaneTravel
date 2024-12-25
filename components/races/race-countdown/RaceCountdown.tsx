"use client"

import { useEffect, useState } from "react"
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds
} from "date-fns"
import { cn } from "@/lib/utils"

interface RaceCountdownProps {
  /** The date of the race */
  raceDate: string
  /** Additional class names */
  className?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function RaceCountdown({ raceDate, className }: RaceCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const race = new Date(raceDate)

      if (now >= race) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        }
      }

      const days = differenceInDays(race, now)
      const hours = differenceInHours(race, now) % 24
      const minutes = differenceInMinutes(race, now) % 60
      const seconds = differenceInSeconds(race, now) % 60

      return {
        days,
        hours,
        minutes,
        seconds
      }
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [raceDate])

  const isRaceOver = new Date() >= new Date(raceDate)

  if (isRaceOver) {
    return (
      <div
        className={cn(
          "bg-muted/50 text-muted-foreground flex items-center justify-center rounded-lg border p-4 text-center",
          className
        )}
      >
        Race has ended
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-4", className)}>
      <div className="bg-card flex flex-col items-center justify-center rounded-lg border p-4">
        <div className="text-3xl font-bold">{timeLeft.days}</div>
        <div className="text-muted-foreground text-sm">Days</div>
      </div>
      <div className="bg-card flex flex-col items-center justify-center rounded-lg border p-4">
        <div className="text-3xl font-bold">{timeLeft.hours}</div>
        <div className="text-muted-foreground text-sm">Hours</div>
      </div>
      <div className="bg-card flex flex-col items-center justify-center rounded-lg border p-4">
        <div className="text-3xl font-bold">{timeLeft.minutes}</div>
        <div className="text-muted-foreground text-sm">Minutes</div>
      </div>
      <div className="bg-card flex flex-col items-center justify-center rounded-lg border p-4">
        <div className="text-3xl font-bold">{timeLeft.seconds}</div>
        <div className="text-muted-foreground text-sm">Seconds</div>
      </div>
    </div>
  )
}
