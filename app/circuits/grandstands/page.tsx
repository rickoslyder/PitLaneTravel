import { Binoculars } from "lucide-react"
import { Metadata } from "next"
import Link from "next/link"
import { getCircuitsWithGrandstandsAction } from "@/actions/db/grandstands-actions"
import { slugify } from "@/lib/series"

export const metadata: Metadata = {
  title: "Grandstand Guides | PitLane Travel",
  description:
    "Grandstand guides for F1, MotoGP, IndyCar, WEC and Formula E circuits: the view, the shade, the price and what fans who sat there say."
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
          Compare stored grandstand notes where they exist — view rating, price
          tier, shade and what a stand overlooks. Coverage varies by circuit.
          Missing stands stay unknown.
        </p>
      </header>

      {hasContent ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {circuits!.map(circuit => (
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
                stored grandstand notes
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">
            Seat guides for this circuit are on the way.
          </p>
          <p className="mt-2">
            In the meantime,{" "}
            <Link href="/races" className="text-primary hover:underline">
              browse the race calendar
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  )
}
