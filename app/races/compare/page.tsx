"use server"

import { Scale, CalendarClock } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Compare F1 Race Weekends | Event Comparison Tool | PitLane Travel",
  description:
    "Make informed decisions by comparing Formula 1 race weekends side by side. Compare costs, weather, accommodation options, and fan experiences across different Grand Prix events."
}

export default async function CompareRacesPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-8 px-4 text-center">
      <div className="relative">
        <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#B17A50] to-[#c19573] opacity-50 blur"></div>
        <div className="relative rounded-lg bg-white p-6 dark:bg-[#131211]">
          <Scale className="mx-auto size-16 text-[#B17A50] dark:text-[#c19573]" />
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-[#2e2c29] dark:text-white">
          Race Weekend Comparison
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-[#494641] dark:text-[#c19573]">
          Our advanced race comparison tool is in development. Soon you'll be
          able to compare different F1 race weekends side by side to make
          informed travel decisions.
        </p>
      </div>

      <div className="flex items-center space-x-2 text-[#494641] dark:text-[#c19573]">
        <CalendarClock className="size-5" />
        <span>Expected Launch: Early 2025</span>
      </div>

      <div className="mt-8 space-y-4 text-sm text-[#494641] dark:text-[#c19573]">
        <p>Compare races based on:</p>
        <ul className="list-inside list-disc space-y-2">
          <li>Total trip cost analysis</li>
          <li>Weather patterns and best seasons</li>
          <li>Local accommodation options</li>
          <li>Travel accessibility scores</li>
          <li>Fan experience ratings</li>
          <li>Circuit viewing quality</li>
        </ul>
      </div>
    </div>
  )
}
