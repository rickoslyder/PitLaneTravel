import { Metadata } from "next"
import { getRacesAction } from "@/actions/db/races-actions"
import { RaceCompare } from "@/components/races/race-compare"

export const metadata: Metadata = {
  title: "Compare Race Weekends | PitLane Travel",
  description:
    "Compare race weekends side by side — dates, circuits, countries and series — to decide which trip to book across F1, MotoGP, Formula E, IndyCar and WEC."
}

export default async function CompareRacesPage() {
  const { data: races } = await getRacesAction()

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Compare Race Weekends
        </h1>
        <p className="text-muted-foreground">
          Pick two or three races to compare side by side and decide where to go.
        </p>
      </header>
      <RaceCompare races={races ?? []} />
    </div>
  )
}
