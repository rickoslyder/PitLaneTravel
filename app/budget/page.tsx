import { Metadata } from "next"
import { BudgetEstimator } from "@/components/budget/budget-estimator"

export const metadata: Metadata = {
  title: "Race Weekend Budget Estimator | PitLane Travel",
  description:
    "Estimate the full cost of your race weekend — tickets, flights, accommodation and spending money — for any series and party size."
}

export default function BudgetPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Race Weekend Budget Estimator
        </h1>
        <p className="text-muted-foreground">
          Get a realistic all-in estimate for your trip. Adjust the inputs to
          match your plans — figures are indicative and in GBP.
        </p>
      </header>
      <BudgetEstimator />
    </div>
  )
}
