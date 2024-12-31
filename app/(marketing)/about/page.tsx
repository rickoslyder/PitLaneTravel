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
          Your companion for planning the perfect Formula 1 race weekend. We
          help F1 fans research, compare, and organize their Grand Prix
          experiences.
        </p>
        <Link href="/races">
          <Button className="bg-[#E10600] hover:bg-[#FF0800]">
            View 2025 Race Calendar
          </Button>
        </Link>
      </div>

      {/* Mission Section */}
      <div className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Our Mission</h2>
        <div className="text-muted-foreground mx-auto max-w-3xl text-center text-lg leading-relaxed">
          <p>
            <b>
              At PitLane Travel, we believe that experiencing Formula 1 live is
              one of the most thrilling sporting events in the world.
            </b>{" "}
            Our mission is to help F1 fans make informed decisions about their
            race weekends by providing comprehensive information, community
            insights, and planning tools.
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
              <h3 className="mb-2 text-xl font-semibold">Information</h3>
              <p className="text-muted-foreground">
                Providing accurate and comprehensive F1 travel information
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Heart className="mx-auto mb-4 size-8 text-[#E10600]" />
              <h3 className="mb-2 text-xl font-semibold">Passion</h3>
              <p className="text-muted-foreground">
                Sharing our love for Formula 1 racing with fans worldwide
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="mx-auto mb-4 size-8 text-[#E10600]" />
              <h3 className="mb-2 text-xl font-semibold">Community</h3>
              <p className="text-muted-foreground">
                Building a helpful community of F1 fans and travelers
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Flag className="mx-auto mb-4 size-8 text-[#E10600]" />
              <h3 className="mb-2 text-xl font-semibold">Accessibility</h3>
              <p className="text-muted-foreground">
                Making F1 travel planning easier for everyone
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
            <h3 className="mb-4 text-xl font-semibold">
              Comprehensive Information
            </h3>
            <p className="text-muted-foreground">
              Access detailed information about each F1 circuit, including
              transportation options, accommodation areas, and local tips to
              help you make informed decisions.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold">Community Insights</h3>
            <p className="text-muted-foreground">
              Learn from the experiences of other F1 fans who have attended
              races. Read reviews, tips, and recommendations from the community.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold">Planning Tools</h3>
            <p className="text-muted-foreground">
              Use our planning tools to organize your race weekend, from
              comparing different grandstands to creating a detailed itinerary.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold">Regular Updates</h3>
            <p className="text-muted-foreground">
              Stay informed with the latest information about race schedules,
              circuit changes, and local events around each Grand Prix.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="rounded-lg bg-gradient-to-r from-gray-50 to-white p-8 text-center dark:from-gray-800 dark:to-gray-900">
        <h2 className="mb-4 text-2xl font-bold">
          Start Planning Your F1 Adventure
        </h2>
        <p className="text-muted-foreground mx-auto mb-6 max-w-2xl">
          Join our community of F1 fans and start planning your perfect race
          weekend with our comprehensive guides and tools.
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
