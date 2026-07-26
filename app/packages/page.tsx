import { Metadata } from "next"
import Link from "next/link"
import { Package } from "lucide-react"
import { getAllTicketPackagesAction } from "@/actions/db/ticket-packages-actions"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Race Weekend Travel Packages | PitLane Travel",
  description:
    "Curated race weekend packages bundling tickets, hospitality and extras across F1, MotoGP, Formula E, IndyCar and WEC."
}

const money = (amount: string | number, currency: string) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0
  }).format(Number(amount))

export default async function PackagesPage() {
  const { data: packages } = await getAllTicketPackagesAction()
  // Featured first, then the rest.
  const active = (packages ?? [])
    .slice()
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-8">
      <header className="space-y-2 text-center">
        <Package className="mx-auto size-12 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">
          Race Weekend Packages
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Curated bundles that combine tickets with hospitality and extras — the
          easiest way to lock in your weekend.
        </p>
      </header>

      {active.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {active.map(pkg => (
            <Card key={pkg.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{pkg.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pkg.race.name}
                    </p>
                  </div>
                  {pkg.isFeatured && <Badge>Featured</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 text-sm">
                <p className="line-clamp-4 text-muted-foreground">
                  {pkg.description}
                </p>
                <p className="text-2xl font-bold">
                  {money(pkg.basePrice, pkg.currency)}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/races/${pkg.raceId}`}>View race</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">Packages are on their way.</p>
          <p className="mt-2">
            We&apos;re assembling race-weekend bundles with our ticketing
            partners. In the meantime, browse{" "}
            <Link href="/races" className="text-primary hover:underline">
              the race calendar
            </Link>{" "}
            to plan your trip.
          </p>
        </div>
      )}
    </div>
  )
}
