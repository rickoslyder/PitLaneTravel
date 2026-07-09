import { Binoculars } from "lucide-react"
import { Metadata } from "next"
import { getCircuitsWithGrandstandsAction } from "@/actions/db/grandstands-actions"
import { GrandstandCard } from "@/components/grandstands/grandstand-card"

export const metadata: Metadata = {
  title: "Grandstand Guides | Best Seats at Every Circuit | PitLane Travel",
  description:
    "Compare grandstands at motorsport circuits worldwide — view ratings, price tiers, shade, big screens and what each stand overlooks. Find the best seats for F1, MotoGP, Formula E, IndyCar and WEC."
}

export default async function GrandstandsPage() {
  const { data: circuits } = await getCircuitsWithGrandstandsAction()
  const hasContent = circuits && circuits.length > 0

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-4 sm:p-8">
      <header className="space-y-3 text-center">
        <Binoculars className="mx-auto size-12 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">Grandstand Guides</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Find your perfect viewing spot. Compare each stand&apos;s view rating,
          price tier, shade and what it overlooks — so you book the right seat
          the first time.
        </p>
      </header>

      {hasContent ? (
        <div className="space-y-12">
          {circuits!.map(circuit => (
            <section key={circuit.id} className="space-y-4">
              <div className="flex items-baseline justify-between border-b pb-2">
                <h2 className="text-2xl font-bold">{circuit.name}</h2>
                <span className="text-sm text-muted-foreground">
                  {circuit.location}, {circuit.country}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {circuit.grandstands.map(g => (
                  <GrandstandCard key={g.id} grandstand={g} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">
            Grandstand guides are being written.
          </p>
          <p className="mt-2">
            We&apos;re documenting the best seats at each circuit — view ratings,
            shade, and what every stand overlooks. Check back soon.
          </p>
        </div>
      )}
    </div>
  )
}
