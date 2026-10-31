/*
<ai_context>
This server page returns a simple "About Page" component as a (marketing) route.
</ai_context>
*/

"use server"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { siteCopy } from "@/config/site-copy"
import { getPackagesAvailability } from "@/lib/packages-availability"
import { Flag, Heart, MapPin, Search, Users } from "lucide-react"
import Link from "next/link"
import { AffiliateDisclosure } from "@/components/partners/affiliate-disclosure"

export default async function AboutPage() {
  const { siteWide } = await getPackagesAvailability()
  const copy = siteCopy(siteWide)
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">
          About PitLane Travel
        </h1>
        <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
          {siteWide
            ? "The best race weekends go to people who've done it before. They know which stand has the view, which hotel isn't stuck in race traffic and when to leave the circuit. PitLane Travel puts that know-how on the race page for Formula 1, MotoGP, IndyCar, WEC and Formula E. Then get the ticket to match or, for F1 and MotoGP, book a race package or VIP hospitality through PitLane, flights included if you want them."
            : "The best race weekends go to people who've done it before. They know which stand has the view, which hotel isn't stuck in race traffic and when to leave the circuit. PitLane Travel puts that know-how on the race page for Formula 1, MotoGP, IndyCar, WEC and Formula E, so you can pick your race, your seat and your ticket knowing what you're getting."}
        </p>
        <Link href="/races">
          <Button>Find your race</Button>
        </Link>
      </div>

      {/* Mission Section */}
      <div className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold">What we do</h2>
        <div className="text-muted-foreground mx-auto max-w-3xl text-center text-lg leading-relaxed">
          <p>{copy.aboutMission}</p>
          <div className="mx-auto mt-6 max-w-3xl text-left">
            <AffiliateDisclosure />
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold">What we care about</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Search className="text-foreground mx-auto mb-4 size-8" />
              <h3 className="mb-2 text-xl font-semibold">Fans first</h3>
              <p className="text-muted-foreground">
                Written for the person in the grandstand, not the brochure.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Heart className="text-foreground mx-auto mb-4 size-8" />
              <h3 className="mb-2 text-xl font-semibold">Five series</h3>
              <p className="text-muted-foreground">
                F1, MotoGP, IndyCar, WEC and Formula E, side by side.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="text-foreground mx-auto mb-4 size-8" />
              <h3 className="mb-2 text-xl font-semibold">Know before you go</h3>
              <p className="text-muted-foreground">
                Dated, sourced detail on seats, rules and getting home.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Flag className="text-foreground mx-auto mb-4 size-8" />
              <h3 className="mb-2 text-xl font-semibold">{copy.aboutBudget.title}</h3>
              <p className="text-muted-foreground">{copy.aboutBudget.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold">
          What you can do here
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-xl font-semibold">
              Every race, one calendar
            </h3>
            <p className="text-muted-foreground">
              Five series, this season and next.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold">Know your seat</h3>
            <p className="text-muted-foreground">
              What each grandstand looks onto, before you buy.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold">Find tickets</h3>
            <p className="text-muted-foreground">
              Straight to tickets for your race and your stand.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold">{copy.aboutDoCard.title}</h3>
            <p className="text-muted-foreground">{copy.aboutDoCard.description}</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="rounded-lg bg-gradient-to-r from-gray-50 to-white p-8 text-center dark:from-gray-800 dark:to-gray-900">
        <h2 className="mb-4 text-2xl font-bold">Ready to go?</h2>
        <div className="flex justify-center gap-4">
          <Link href="/races">
            <Button>
              <Flag className="mr-2 size-4" />
              Find your race
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline">
              <MapPin className="mr-2 size-4" />
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
