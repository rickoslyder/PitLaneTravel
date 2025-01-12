"use server"

import { Sparkles, CalendarClock, Bot } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI F1 Trip Planner | Smart Travel Assistant | PitLane Travel",
  description:
    "Plan your perfect F1 race weekend with our AI-powered trip planner. Get personalized recommendations for flights, hotels, and activities based on your preferences and budget."
}

export default async function TripPlannerPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-8 px-4 text-center">
      <div className="relative">
        <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#B17A50] to-[#c19573] opacity-50 blur"></div>
        <div className="relative rounded-lg bg-white p-6 dark:bg-[#131211]">
          <Bot className="mx-auto size-16 text-[#B17A50] dark:text-[#c19573]" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-[#2e2c29] dark:text-white">
            AI Trip Planner
          </h1>
          <Sparkles className="size-8 text-[#B17A50] dark:text-[#c19573]" />
        </div>
        <p className="mx-auto max-w-2xl text-lg text-[#494641] dark:text-[#c19573]">
          Your personal F1 travel assistant is coming soon. Our AI-powered
          planner will help you create the perfect race weekend itinerary,
          tailored to your preferences and budget.
        </p>
      </div>

      <div className="flex items-center space-x-2 text-[#494641] dark:text-[#c19573]">
        <CalendarClock className="size-5" />
        <span>Expected Launch: Early 2025</span>
      </div>

      <div className="mt-8 space-y-4 text-sm text-[#494641] dark:text-[#c19573]">
        <p>Features coming to AI Trip Planner:</p>
        <ul className="list-inside list-disc space-y-2">
          <li>Personalized itinerary generation</li>
          <li>Smart budget optimization</li>
          <li>Weather-aware scheduling</li>
          <li>Local event recommendations</li>
          <li>Group coordination tools</li>
          <li>Real-time travel updates</li>
        </ul>
      </div>
    </div>
  )
}
