import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { getCircuitsWithGrandstandsAction } from "@/actions/db/grandstands-actions"
import { GrandstandCard } from "@/components/grandstands/grandstand-card"
import { slugify } from "@/lib/series"

interface PageProps {
  params: Promise<{ slug: string }>
}

/** Circuits have no slug column, so resolve by slugifying the stored name. */
async function findCircuit(slug: string) {
  const { data: circuits } = await getCircuitsWithGrandstandsAction()
  return (circuits ?? []).find(c => slugify(c.name) === slug) ?? null
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const circuit = await findCircuit(slug)
  if (!circuit) return { title: "Grandstand Guide | PitLane Travel" }

  return {
    title: `Best Grandstands at ${circuit.name} | Seat Guide | PitLane Travel`,
    description: `Which grandstand should you book at ${circuit.name}, ${circuit.location}? Compare all ${circuit.grandstands.length} stands on view rating, price, shade, big screens and the corners they overlook.`,
    keywords: [
      `best grandstand ${circuit.name}`,
      `${circuit.name} seating guide`,
      `${circuit.name} tickets which stand`,
      `where to sit ${circuit.name}`
    ]
  }
}

export default async function CircuitGrandstandsPage({ params }: PageProps) {
  const { slug } = await params
  const circuit = await findCircuit(slug)
  if (!circuit) return notFound()

  const ranked = [...circuit.grandstands].sort(
    (a, b) => (b.viewRating ?? 0) - (a.viewRating ?? 0)
  )

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-8">
      <Link
        href="/circuits/grandstands"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        All grandstand guides
      </Link>

      <header className="space-y-2 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Best grandstands at {circuit.name}
        </h1>
        <p className="text-muted-foreground">
          {circuit.location}, {circuit.country} · {ranked.length} stands compared
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ranked.map(g => (
          <GrandstandCard key={g.id} grandstand={g} />
        ))}
      </div>
    </div>
  )
}
