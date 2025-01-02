"use client"

import { useState } from "react"
import { SelectFlightBooking } from "@/db/schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatDateTime } from "@/lib/utils"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { TripSelector } from "@/components/trips/TripSelector"
import { addFlightBookingToTripAction } from "@/actions/db/flight-bookings-actions"
import { toast } from "sonner"
import { Loader2, Plus, ArrowRight, Plane, Check } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

interface BookingsListProps {
  bookings: SelectFlightBooking[]
  userId: string
}

function BookingCard({
  booking,
  onAddToTrip
}: {
  booking: SelectFlightBooking
  onAddToTrip: () => void
}) {
  const router = useRouter()
  const offerData = booking.offerData as any

  // Get outbound and return flight data
  const outboundFlight = offerData?.slices?.[0]?.segments?.[0]
  const returnFlight = offerData?.slices?.[1]?.segments?.[0]

  // Format flight times
  const formatFlightTime = (datetime: string) => {
    if (!datetime) return null
    const date = new Date(datetime)
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true
      })
    }
  }

  const outboundTimes = outboundFlight && {
    departure: formatFlightTime(outboundFlight.departing_at),
    arrival: formatFlightTime(outboundFlight.arriving_at)
  }

  const returnTimes = returnFlight && {
    departure: formatFlightTime(returnFlight.departing_at),
    arrival: formatFlightTime(returnFlight.arriving_at)
  }

  // Get status badge variant
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-4">
            {/* Header Section */}
            <div>
              <div className="mb-2 flex items-center gap-4">
                <Badge
                  variant={getStatusBadgeVariant(booking.status)}
                  className="capitalize"
                >
                  {booking.status}
                </Badge>
                <Badge variant="outline">
                  {offerData.total_amount} {offerData.total_currency}
                </Badge>
              </div>

              {/* Airline Info */}
              <CardTitle className="flex items-center gap-2 text-xl">
                <Plane className="size-5" />
                <span className="font-medium">{offerData.owner.name}</span>
              </CardTitle>

              {/* Flight Numbers */}
              <div className="text-muted-foreground mt-1 text-sm">
                Flight {outboundFlight?.marketing_carrier_flight_number}
                {returnFlight &&
                  ` / ${returnFlight.marketing_carrier_flight_number}`}
              </div>

              {/* Booking Info */}
              <div className="mt-2 space-y-1">
                <p className="text-muted-foreground text-sm">
                  Booking Reference:{" "}
                  {booking.bookingReference || "Not yet assigned"}
                </p>
                <p className="text-muted-foreground text-sm">
                  Booked on: {formatDateTime(booking.createdAt.toString())}
                </p>
              </div>
            </div>

            {/* Flight Details */}
            <div className="grid gap-6">
              {/* Outbound Flight */}
              {outboundFlight && outboundTimes && (
                <div className="space-y-2">
                  <Badge
                    variant="secondary"
                    className="mb-2 px-4 py-1 text-base"
                  >
                    Outbound Flight
                  </Badge>
                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="mb-1 text-base font-medium">
                        Departure
                      </div>
                      <div className="text-muted-foreground">
                        {outboundTimes.departure?.date} at{" "}
                        {outboundTimes.departure?.time}
                      </div>
                      <div className="text-muted-foreground">
                        {outboundFlight.origin.city?.name ||
                          outboundFlight.origin.city_name}{" "}
                        ({outboundFlight.origin.iata_code})
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="mb-1 text-base font-medium">Arrival</div>
                      <div className="text-muted-foreground">
                        {outboundTimes.arrival?.date} at{" "}
                        {outboundTimes.arrival?.time}
                      </div>
                      <div className="text-muted-foreground">
                        {outboundFlight.destination.city?.name ||
                          outboundFlight.destination.city_name}{" "}
                        ({outboundFlight.destination.iata_code})
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Return Flight */}
              {returnFlight && returnTimes && (
                <div className="space-y-2">
                  <Badge
                    variant="secondary"
                    className="mb-2 px-4 py-1 text-base"
                  >
                    Return Flight
                  </Badge>
                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="mb-1 text-base font-medium">
                        Departure
                      </div>
                      <div className="text-muted-foreground">
                        {returnTimes.departure?.date} at{" "}
                        {returnTimes.departure?.time}
                      </div>
                      <div className="text-muted-foreground">
                        {returnFlight.origin.city?.name ||
                          returnFlight.origin.city_name}{" "}
                        ({returnFlight.origin.iata_code})
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="mb-1 text-base font-medium">Arrival</div>
                      <div className="text-muted-foreground">
                        {returnTimes.arrival?.date} at{" "}
                        {returnTimes.arrival?.time}
                      </div>
                      <div className="text-muted-foreground">
                        {returnFlight.destination.city?.name ||
                          returnFlight.destination.city_name}{" "}
                        ({returnFlight.destination.iata_code})
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex justify-end gap-4">
          {booking.status === "confirmed" &&
            (booking.addedToTrip ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      disabled
                      className="text-green-600"
                      onClick={() =>
                        booking.tripId &&
                        router.push(`/trips/${booking.tripId}`)
                      }
                    >
                      <Check className="mr-2 size-4" />
                      Added to Trip
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to view trip details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button variant="outline" onClick={onAddToTrip}>
                <Plus className="mr-2 size-4" />
                Add to Trip
              </Button>
            ))}
          <Button
            onClick={() =>
              router.push(`/flights/confirmation?bookingId=${booking.id}`)
            }
          >
            View Details
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function BookingsList({ bookings, userId }: BookingsListProps) {
  const [isAddingToTrip, setIsAddingToTrip] = useState(false)
  const [selectedBooking, setSelectedBooking] =
    useState<SelectFlightBooking | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [showRedirectConfirm, setShowRedirectConfirm] = useState(false)
  const router = useRouter()

  console.log("Booking data:", bookings)

  const handleAddToTrip = async (tripId: string) => {
    if (!selectedBooking) return

    setSelectedTripId(tripId)
    setIsLoading(true)

    try {
      const { isSuccess } = await addFlightBookingToTripAction(
        selectedBooking.id,
        tripId
      )
      if (!isSuccess) {
        throw new Error("Failed to add booking to trip")
      }
      toast.success("Flight booking added to trip")
      setShowRedirectConfirm(true)
    } catch (error) {
      console.error("Error adding booking to trip:", error)
      toast.error("Failed to add booking to trip")
      setIsAddingToTrip(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRedirectConfirm = (shouldRedirect: boolean) => {
    setShowRedirectConfirm(false)
    setIsAddingToTrip(false)
    if (shouldRedirect && selectedTripId) {
      router.push(`/trips/${selectedTripId}`)
    }
    router.refresh()
  }

  const pendingBookings = bookings.filter(b => b.status === "pending")
  const confirmedBookings = bookings.filter(b => b.status === "confirmed")
  const otherBookings = bookings.filter(
    b => !["pending", "confirmed"].includes(b.status)
  )

  return (
    <div className="space-y-8">
      <Tabs defaultValue="confirmed">
        <TabsList>
          <TabsTrigger value="confirmed">
            Confirmed{" "}
            {confirmedBookings.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {confirmedBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending{" "}
            {pendingBookings.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="other">
            Other{" "}
            {otherBookings.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {otherBookings.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="confirmed" className="space-y-4">
          {confirmedBookings.length === 0 ? (
            <p className="text-muted-foreground">No confirmed bookings</p>
          ) : (
            confirmedBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onAddToTrip={() => {
                  setSelectedBooking(booking)
                  setIsAddingToTrip(true)
                }}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingBookings.length === 0 ? (
            <p className="text-muted-foreground">No pending bookings</p>
          ) : (
            pendingBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onAddToTrip={() => {
                  setSelectedBooking(booking)
                  setIsAddingToTrip(true)
                }}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          {otherBookings.length === 0 ? (
            <p className="text-muted-foreground">No other bookings</p>
          ) : (
            otherBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onAddToTrip={() => {
                  setSelectedBooking(booking)
                  setIsAddingToTrip(true)
                }}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isAddingToTrip} onOpenChange={setIsAddingToTrip}>
        <DialogContent>
          {showRedirectConfirm ? (
            <>
              <DialogHeader>
                <DialogTitle>Success!</DialogTitle>
                <DialogDescription>
                  Would you like to view the trip now?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2 sm:justify-start">
                <Button
                  variant="secondary"
                  onClick={() => handleRedirectConfirm(false)}
                >
                  Stay Here
                </Button>
                <Button onClick={() => handleRedirectConfirm(true)}>
                  View Trip
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Add to Trip</DialogTitle>
                <DialogDescription>
                  Select a trip to add this flight booking to
                </DialogDescription>
              </DialogHeader>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="text-muted-foreground size-8 animate-spin" />
                </div>
              ) : (
                <TripSelector
                  onSelect={handleAddToTrip}
                  isLoading={isLoading}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
