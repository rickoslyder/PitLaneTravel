/*
<ai_context>
This server page returns a simple "About Page" component as a (marketing) route.
</ai_context>
*/

"use server"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Flag, Heart, MapPin, Search, Users } from "lucide-react"
import Link from "next/link"

export default async function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">
          About PitLane Travel
        </h1>
        <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
          A decision layer for self-directed travellers. Compare race weekends
          across Formula 1, Formula E, MotoGP, IndyCar and WEC, then hand off to
          external suppliers.
        </p>
        <Link href="/races">
          <Button className="bg-[#E10600] hover:bg-[#FF0800]">
            View Race Calendar
          </Button>
        </Link>
      </div>

      {/* Mission Section */}
      <div className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Our Mission</h2>
        <div className="text-muted-foreground mx-auto max-w-3xl text-center text-lg leading-relaxed">
          <p>
            <b>
              PitLane Travel helps travellers choose which race to attend and
              assemble the trip themselves.
            </b>{" "}
            It is not an OTA, travel agency, package principal, or community
            platform. Coverage depth varies; missing facts stay unknown.
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Our Values</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Search className="mx-auto mb-4 size-8 text-[#E10600]" />
              <h3 className="mb-2 text-xl font-semibold">Inspectable tools</h3>
              <p className="text-muted-foreground">
                Calendar, race pages, circuit pages and compare tools you can
                open yourself
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Heart className="mx-auto mb-4 size-8 text-[#E10600]" />
              <h3 className="mb-2 text-xl font-semibold">Five-series scope</h3>
              <p className="text-muted-foreground">
                Public catalogue stays Formula 1, Formula E, MotoGP, IndyCar and
                WEC
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="mx-auto mb-4 size-8 text-[#E10600]" />
              <h3 className="mb-2 text-xl font-semibold">Unknown stays unknown</h3>
              <p className="text-muted-foreground">
                Coverage depth is labelled. Missing logistics or viewing notes
                are left unknown
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Flag className="mx-auto mb-4 size-8 text-[#E10600]" />
              <h3 className="mb-2 text-xl font-semibold">Labelled handoffs</h3>
              <p className="text-muted-foreground">
                External flight and hotel search is labelled. Confirm terms on
                the provider
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Why Use PitLane Travel
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-xl font-semibold">Race calendar</h3>
            <p className="text-muted-foreground">
              Browse events across the five named series. Every supported event
              stays discoverable.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold">
              Race and circuit pages
            </h3>
            <p className="text-muted-foreground">
              Open pages where coverage exists, including grandstand notes when
              they are published. Missing depth stays unknown.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold">Planning tools</h3>
            <p className="text-muted-foreground">
              Compare events and assemble a self-directed weekend, then follow
              labelled external search handoffs.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold">Flights and packages</h3>
            <p className="text-muted-foreground">
              PitLane Travel does not currently sell race-weekend packages. It
              does not book or issue flights.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="rounded-lg bg-gradient-to-r from-gray-50 to-white p-8 text-center dark:from-gray-800 dark:to-gray-900">
        <h2 className="mb-4 text-2xl font-bold">Start from a real event</h2>
        <p className="text-muted-foreground mx-auto mb-6 max-w-2xl">
          Open the five-series calendar and plan the trip yourself.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/races">
            <Button className="bg-[#E10600] hover:bg-[#FF0800]">
              <Flag className="mr-2 size-4" />
              Explore Races
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
