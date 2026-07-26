import { Binoculars, Star } from "lucide-react"
import { Metadata } from "next"
import Link from "next/link"
import { getCircuitsWithGrandstandsAction } from "@/actions/db/grandstands-actions"
import { slugify } from "@/lib/series"

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {circuits!.map(circuit => {
            // The stand the guide rates highest, surfaced as the card's teaser.
            const top = [...circuit.grandstands].sort(
              (a, b) => (b.viewRating ?? 0) - (a.viewRating ?? 0)
            )[0]
            return (
              <Link
                key={circuit.id}
                href={`/circuits/${slugify(circuit.name)}/grandstands`}
                className="group rounded-lg border p-5 transition-colors hover:border-primary hover:bg-muted/40"
              >
                <h2 className="font-semibold group-hover:text-primary">
                  {circuit.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {circuit.location}, {circuit.country}
                </p>
                <p className="mt-3 text-sm">
                  <span className="font-medium">
                    {circuit.grandstands.length}
                  </span>{" "}
                  grandstands compared
                </p>
                {top && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    Top pick: {top.name}
                  </p>
                )}
              </Link>
            )
          })}
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
