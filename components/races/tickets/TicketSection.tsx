"use client"

import { RaceWithDetails } from "@/types/race"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Ticket,
  Star,
  Sun,
  Umbrella,
  Tv,
  Coffee,
  Utensils,
  Wifi
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TicketSectionProps {
  race: RaceWithDetails
}

interface TicketType {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  amenities: string[]
  rating: number
  availability: "high" | "medium" | "low"
  viewQuality: number
  recommended?: boolean
}

// This would come from your database in a real app
const SAMPLE_TICKETS: TicketType[] = [
  {
    id: "general-admission",
    name: "General Admission",
    description:
      "Access to general admission areas with views of multiple corners",
    price: 150,
    features: ["Standing views", "Access to fan zones", "Big screen viewing"],
    amenities: ["Food courts", "Merchandise stands"],
    rating: 4.1,
    availability: "high",
    viewQuality: 3
  },
  {
    id: "grandstand-k",
    name: "Grandstand K",
    description: "Covered seating with views of the start/finish straight",
    price: 450,
    features: [
      "Reserved seating",
      "Covered grandstand",
      "View of pit lane",
      "Start/finish line view"
    ],
    amenities: [
      "Dedicated food court",
      "Premium restrooms",
      "Free water stations",
      "Wi-Fi access"
    ],
    rating: 4.7,
    availability: "medium",
    viewQuality: 4,
    recommended: true
  },
  {
    id: "club-suite",
    name: "Club Suite",
    description: "Premium hospitality suite with the best views and amenities",
    price: 1200,
    features: [
      "VIP seating",
      "Air-conditioned suite",
      "Paddock access",
      "Pit lane walk",
      "Driver appearances"
    ],
    amenities: [
      "Gourmet catering",
      "Open bar",
      "VIP parking",
      "Concierge service",
      "Private restrooms"
    ],
    rating: 4.9,
    availability: "low",
    viewQuality: 5
  }
]

const getAvailabilityColor = (availability: TicketType["availability"]) => {
  switch (availability) {
    case "high":
      return "text-green-500 bg-green-500/10"
    case "medium":
      return "text-yellow-500 bg-yellow-500/10"
    case "low":
      return "text-red-500 bg-red-500/10"
    default:
      return "text-muted-foreground bg-muted"
  }
}

export function TicketSection({ race }: TicketSectionProps) {
  return (
    <div className="space-y-8">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2>Race Tickets</h2>
        <p>
          Choose from our selection of tickets for the {race.name}. All tickets
          include access to the circuit for the entire race weekend.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {SAMPLE_TICKETS.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={cn(
                "relative overflow-hidden transition-shadow hover:shadow-lg",
                ticket.recommended && "border-primary"
              )}
            >
              {ticket.recommended && (
                <div className="bg-primary absolute right-0 top-0 px-2 py-0.5 text-xs text-white">
                  Recommended
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {ticket.name}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {ticket.description}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={getAvailabilityColor(ticket.availability)}
                  >
                    {ticket.availability.charAt(0).toUpperCase() +
                      ticket.availability.slice(1)}{" "}
                    Availability
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">€{ticket.price}</div>
                    <div className="flex items-center gap-1">
                      <Star className="size-4 fill-current text-yellow-400" />
                      <span>{ticket.rating}</span>
                    </div>
                  </div>

                  <div className="bg-muted h-2 rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${(ticket.viewQuality / 5) * 100}%` }}
                    />
                  </div>
                  <div className="text-muted-foreground text-xs">
                    View Quality Score
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-muted-foreground mb-2 text-sm font-medium">
                      Features
                    </div>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      {ticket.features.map(feature => (
                        <li key={feature} className="flex items-center gap-2">
                          <Ticket className="size-4" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-muted-foreground mb-2 text-sm font-medium">
                      Amenities
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ticket.amenities.includes("Food courts") && (
                        <div className="bg-primary/10 flex items-center gap-1 rounded-full px-2 py-1 text-xs">
                          <Utensils className="size-3" />
                          <span>Food</span>
                        </div>
                      )}
                      {ticket.amenities.includes("Wi-Fi access") && (
                        <div className="bg-primary/10 flex items-center gap-1 rounded-full px-2 py-1 text-xs">
                          <Wifi className="size-3" />
                          <span>Wi-Fi</span>
                        </div>
                      )}
                      {ticket.amenities.includes("Covered grandstand") && (
                        <div className="bg-primary/10 flex items-center gap-1 rounded-full px-2 py-1 text-xs">
                          <Umbrella className="size-3" />
                          <span>Covered</span>
                        </div>
                      )}
                      {ticket.amenities.includes("Big screen viewing") && (
                        <div className="bg-primary/10 flex items-center gap-1 rounded-full px-2 py-1 text-xs">
                          <Tv className="size-3" />
                          <span>TV Screen</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  Select Tickets
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compare Views</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {SAMPLE_TICKETS.map(ticket => (
              <div key={ticket.id} className="space-y-4">
                <div className="bg-muted aspect-video rounded-lg">
                  {/* This would be replaced with actual view images */}
                  <div className="flex h-full items-center justify-center">
                    View from {ticket.name}
                  </div>
                </div>
                <div>
                  <div className="font-medium">{ticket.name}</div>
                  <div className="text-muted-foreground mt-1 text-sm">
                    View highlights:
                  </div>
                  <ul className="text-muted-foreground mt-2 list-inside list-disc text-sm">
                    {ticket.features
                      .filter(f => f.includes("view"))
                      .map(feature => (
                        <li key={feature}>{feature}</li>
                      ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
