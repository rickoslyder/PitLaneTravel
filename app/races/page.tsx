"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { RacesPage } from "@/components/races/RacesPage"
import { getRacesAction } from "@/actions/db/races-actions"
import { getProfileByUserIdAction } from "@/actions/db/profiles-actions"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "F1 Race Calendar 2025 | PitLane Travel",
  description:
    "Plan your perfect F1 weekend with our comprehensive 2025 race calendar. Compare venues, explore circuits, and book your Formula 1 experience with confidence."
}

export default async function RacesServerPage() {
  const { userId } = await auth()

  if (userId) {
    // return redirect("/login")
    const { data: profile } = await getProfileByUserIdAction(userId)
    if (!profile) {
      return redirect("/signup")
    }
  }

  const { data: races } = await getRacesAction()

  return (
    <div className="flex-1 p-4 pt-0">
      <RacesPage initialRaces={races ?? []} />
    </div>
  )
}
