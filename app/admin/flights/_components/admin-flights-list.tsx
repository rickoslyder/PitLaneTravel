"use client"

import { useState } from "react"
import { SelectFlightBooking } from "@/db/schema"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowRight } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface AdminFlightsListProps {
  bookings: SelectFlightBooking[]
}

export function AdminFlightsList({ bookings }: AdminFlightsListProps) {
  const router = useRouter()

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default" as const
      case "pending":
        return "secondary" as const
      case "failed":
        return "destructive" as const
      case "expired":
      case "cancelled":
        return "outline" as const
      default:
        return "default" as const
    }
  }

  return (
    <div className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking Reference</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Departure</TableHead>
            <TableHead>Arrival</TableHead>
            <TableHead>Added to Trip</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map(booking => {
            const offerData = booking.offerData as any
            const outboundFlight = offerData?.slices?.[0]?.segments?.[0]

            return (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">
                  {booking.bookingReference || "Not assigned"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusBadgeVariant(booking.status)}
                    className="capitalize"
                  >
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {outboundFlight ? (
                    <div>
                      <div>{outboundFlight.origin.iata_code}</div>
                      <div className="text-muted-foreground text-sm">
                        {new Date(outboundFlight.departing_at).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>
                  {outboundFlight ? (
                    <div>
                      <div>{outboundFlight.destination.iata_code}</div>
                      <div className="text-muted-foreground text-sm">
                        {new Date(outboundFlight.arriving_at).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={booking.addedToTrip ? "default" : "secondary"}
                  >
                    {booking.addedToTrip ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(booking.createdAt.toString())}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/flights/confirmation?bookingId=${booking.id}`
                      )
                    }
                  >
                    View Details
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
