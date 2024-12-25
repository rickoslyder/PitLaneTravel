"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Race } from "@/types/race"
import { Check, Info, Ticket } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { WaitlistForm } from "./WaitlistForm"

interface TicketSectionProps {
  /** The race data */
  race: Race
}

interface TicketCategory {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  availability: "available" | "sold_out" | "low_stock" | "pending"
  isPopular?: boolean
  daysIncluded: {
    thursday?: boolean
    friday?: boolean
    saturday?: boolean
    sunday?: boolean
  }
}

const TICKET_CATEGORIES: TicketCategory[] = [
  {
    id: "general",
    name: "General Admission",
    description: "Access to general admission areas and basic amenities",
    price: 299,
    features: [
      "Standing areas around the circuit",
      "Access to food courts",
      "Big screen viewing",
      "Basic facilities"
    ],
    availability: "available",
    daysIncluded: {
      friday: true,
      saturday: true,
      sunday: true
    }
  },
  {
    id: "grandstand",
    name: "Grandstand",
    description: "Reserved seating in covered grandstands with excellent views",
    price: 599,
    features: [
      "Reserved seating",
      "Covered grandstand",
      "Premium viewing positions",
      "Access to all general admission areas",
      "Enhanced facilities"
    ],
    availability: "low_stock",
    isPopular: true,
    daysIncluded: {
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true
    }
  },
  {
    id: "vip",
    name: "VIP Hospitality",
    description: "Premium experience with exclusive access and hospitality",
    price: 1299,
    features: [
      "Exclusive hospitality suite",
      "Gourmet catering",
      "Premium open bar",
      "Paddock access",
      "Driver appearances",
      "VIP parking",
      "Dedicated host"
    ],
    availability: "pending",
    daysIncluded: {
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true
    }
  }
]

export function TicketSection({ race }: TicketSectionProps) {
  const getAvailabilityColor = (
    availability: TicketCategory["availability"]
  ) => {
    switch (availability) {
      case "available":
        return "bg-green-500/10 text-green-500"
      case "sold_out":
        return "bg-red-500/10 text-red-500"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500"
      case "low_stock":
        return "bg-orange-500/10 text-orange-500"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getAvailabilityText = (
    availability: TicketCategory["availability"]
  ) => {
    switch (availability) {
      case "available":
        return "Available"
      case "sold_out":
        return "Sold Out"
      case "pending":
        return "Coming Soon"
      case "low_stock":
        return "Low Stock"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {TICKET_CATEGORIES.map(ticket => (
          <Card
            key={ticket.id}
            className={cn(
              "relative",
              ticket.isPopular && "border-primary shadow-lg"
            )}
          >
            {ticket.isPopular && (
              <Badge
                className="absolute -top-2 left-1/2 -translate-x-1/2"
                variant="default"
              >
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {ticket.name}
                <Badge
                  variant="secondary"
                  className={getAvailabilityColor(ticket.availability)}
                >
                  {getAvailabilityText(ticket.availability)}
                </Badge>
              </CardTitle>
              <CardDescription>{ticket.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">${ticket.price}</div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Days Included:</div>
                <div className="flex gap-2">
                  {Object.entries(ticket.daysIncluded).map(
                    ([day, included]) =>
                      included && (
                        <Badge key={day} variant="outline">
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </Badge>
                      )
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Features:</div>
                <ul className="space-y-2">
                  {ticket.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="mt-1 size-4 text-green-500" />
                      <span className="text-muted-foreground text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              {ticket.availability === "available" ? (
                <Button className="w-full">
                  <Ticket className="mr-2 size-4" />
                  Book Now
                </Button>
              ) : (
                <WaitlistForm
                  raceId={race.id}
                  ticketCategoryId={ticket.id}
                  ticketCategoryName={ticket.name}
                  disabled={ticket.availability === "sold_out"}
                />
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Ticket Comparison
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="text-muted-foreground size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  Compare features across different ticket types
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                {TICKET_CATEGORIES.map(ticket => (
                  <TableHead key={ticket.id}>{ticket.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Price</TableCell>
                {TICKET_CATEGORIES.map(ticket => (
                  <TableCell key={ticket.id}>${ticket.price}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Thursday Access</TableCell>
                {TICKET_CATEGORIES.map(ticket => (
                  <TableCell key={ticket.id}>
                    {ticket.daysIncluded.thursday ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Friday Access</TableCell>
                {TICKET_CATEGORIES.map(ticket => (
                  <TableCell key={ticket.id}>
                    {ticket.daysIncluded.friday ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Saturday Access</TableCell>
                {TICKET_CATEGORIES.map(ticket => (
                  <TableCell key={ticket.id}>
                    {ticket.daysIncluded.saturday ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Sunday Access</TableCell>
                {TICKET_CATEGORIES.map(ticket => (
                  <TableCell key={ticket.id}>
                    {ticket.daysIncluded.sunday ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Seating</TableCell>
                {TICKET_CATEGORIES.map(ticket => (
                  <TableCell key={ticket.id}>
                    {ticket.id === "general"
                      ? "Standing"
                      : ticket.id === "grandstand"
                        ? "Reserved Seat"
                        : "Premium Suite"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Hospitality</TableCell>
                {TICKET_CATEGORIES.map(ticket => (
                  <TableCell key={ticket.id}>
                    {ticket.id === "vip" ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Paddock Access</TableCell>
                {TICKET_CATEGORIES.map(ticket => (
                  <TableCell key={ticket.id}>
                    {ticket.id === "vip" ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
