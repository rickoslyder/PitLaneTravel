import { Bus, Car, MapPin, Train } from "lucide-react"
import { Metadata } from "next"
import { getCircuitsWithTransportAction } from "@/actions/db/transport-info-actions"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Getting to the Circuit | Transport Guides | PitLane Travel",
  description:
    "How to get to every circuit: public transport, shuttles, parking and walking routes for F1, MotoGP, Formula E, IndyCar and WEC race weekends."
}

const TYPE_ICON: Record<string, typeof Car> = {
  train: Train,
  rail: Train,
  bus: Bus,
  shuttle: Bus,
  car: Car,
  parking: Car
}

export default async function TransportPage() {
  const { data: circuits } = await getCircuitsWithTransportAction()
  const hasContent = circuits && circuits.length > 0

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-8">
      <header className="space-y-2 text-center">
        <Car className="mx-auto size-12 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">
          Getting to the Circuit
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Public transport, shuttles, parking and walking routes for every venue
          — so you spend less time in traffic and more time trackside.
        </p>
      </header>

      {hasContent ? (
        <div className="space-y-8">
          {circuits!.map(circuit => (
            <section key={circuit.id} className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <MapPin className="size-5 text-primary" />
                <h2 className="text-2xl font-bold">{circuit.name}</h2>
                <span className="text-sm text-muted-foreground">
                  {circuit.location}, {circuit.country}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {circuit.transport.map(t => {
                  const Icon = TYPE_ICON[t.type?.toLowerCase()] ?? Car
                  return (
                    <Card key={t.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="size-5 text-primary" />
                          <h3 className="font-semibold">{t.name}</h3>
                          {t.type && (
                            <Badge variant="secondary" className="ml-auto">
                              {t.type}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {t.description && (
                          <p className="text-muted-foreground">
                            {t.description}
                          </p>
                        )}
                        {t.options && t.options.length > 0 && (
                          <ul className="list-inside list-disc space-y-1">
                            {t.options.map((o, i) => (
                              <li key={i}>{o}</li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">
            Transport guides are being compiled.
          </p>
          <p className="mt-2">
            We&apos;re documenting how to reach each circuit by train, shuttle and
            car. Check back soon.
          </p>
        </div>
      )}
    </div>
  )
}
