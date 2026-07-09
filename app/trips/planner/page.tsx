import { Sparkles } from "lucide-react"
import { Metadata } from "next"
import { StandalonePlanner } from "@/components/ai-trip-planner/standalone-planner"

export const metadata: Metadata = {
  title: "AI Trip Planner | PitLane Travel",
  description:
    "Plan your race weekend with an AI assistant — tickets, viewing spots, transport, accommodation and things to do, for any series and circuit."
}

export default async function TripPlannerPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">AI Trip Planner</h1>
          <Sparkles className="size-6 text-primary" />
        </div>
        <p className="text-muted-foreground">
          Ask anything about planning your race weekend — tickets and grandstands,
          getting to the circuit, where to stay, and what to do nearby. Save
          suggestions and drop them into a trip when you&apos;re ready.
        </p>
      </header>
      <StandalonePlanner />
    </div>
  )
}
