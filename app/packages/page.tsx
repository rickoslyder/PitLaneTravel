import { Metadata } from "next"
import Link from "next/link"
import { Package } from "lucide-react"

export const metadata: Metadata = {
  title: "Race Weekend Packages | PitLane Travel",
  description:
    "PitLane Travel does not currently sell race-weekend packages. Browse the five-series calendar to plan a self-directed trip."
}

export default function PackagesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-8">
      <header className="space-y-2 text-center">
        <Package className="mx-auto size-12 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">
          Race Weekend Packages
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          PitLane Travel does not currently sell race-weekend packages. It is a
          decision layer for self-directed travellers, not a package principal.
        </p>
      </header>

      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        <p className="text-lg font-medium">
          PitLane Travel does not currently sell race-weekend packages
        </p>
        <p className="mt-2">
          There is no package inventory and no package partner to hand off to.
          Use the live planning routes to compare events and assemble the trip
          yourself.
        </p>
        <p className="mt-4">
          Browse{" "}
          <Link href="/races" className="text-primary hover:underline">
            the race calendar
          </Link>
          ,{" "}
          <Link href="/races/compare" className="text-primary hover:underline">
            compare races
          </Link>
          , or open{" "}
          <Link
            href="/circuits/grandstands"
            className="text-primary hover:underline"
          >
            stored grandstand notes
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
