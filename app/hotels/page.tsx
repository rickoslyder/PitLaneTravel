import { Metadata } from "next"
import { Building2, ExternalLink, MapPin } from "lucide-react"
import { getCircuitsAction } from "@/actions/db/circuits-actions"
import { buildHotelSearchUrl } from "@/lib/affiliate"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Where to Stay | External hotel search | PitLane Travel",
  description:
    "Open a generic Booking.com city search for a circuit's city and country. PitLane does not verify, rank, or partner on stays. Confirm distance and terms on the provider."
}

export default async function HotelsPage() {
  const { data: circuits } = await getCircuitsAction()
  const sorted = (circuits ?? [])
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-8">
      <header className="space-y-2 text-center">
        <Building2 className="mx-auto size-12 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">Where to Stay</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          This is a generic external hotel search on Booking.com, using the
          circuit&apos;s city and country. Stays are not verified, ranked, or
          circuit-specific. Confirm distance and booking terms on the provider.
        </p>
      </header>

      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map(circuit => (
            <Card key={circuit.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <h3 className="font-semibold">{circuit.name}</h3>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {circuit.location}, {circuit.country}
                </p>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button asChild variant="outline" className="w-full">
                  <a
                    href={buildHotelSearchUrl({
                      location: circuit.location,
                      country: circuit.country
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Search on Booking.com
                    <ExternalLink className="ml-2 size-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          Circuit list is loading. Check back shortly.
        </div>
      )}
    </div>
  )
}
