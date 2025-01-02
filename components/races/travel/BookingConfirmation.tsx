"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { TransformedFlightOffer } from "@/types/duffel"
import { PassengerInfo } from "./PassengerForm"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog"
import { TripSelector } from "@/components/trips/TripSelector"
import { toast } from "react-hot-toast"
import {
  addFlightBookingToTripAction,
  getFlightBookingByReferenceAction
} from "@/actions/db/flight-bookings-actions"

interface BookingConfirmationProps {
  flight: TransformedFlightOffer
  passengers: PassengerInfo[]
  onDone: () => void
  bookingReference?: string
}

export function BookingConfirmation({
  flight,
  passengers,
  onDone,
  bookingReference
}: BookingConfirmationProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true
    }).format(date)
  }

  const handleAddToTrip = async (tripId: string) => {
    if (!bookingReference) return

    try {
      // First get the booking by reference
      const bookingResult =
        await getFlightBookingByReferenceAction(bookingReference)
      if (!bookingResult.isSuccess || !bookingResult.data) {
        throw new Error("Booking not found")
      }

      // Then add it to the trip using the booking ID
      const result = await addFlightBookingToTripAction(
        bookingResult.data.id,
        tripId
      )
      if (result.isSuccess) {
        toast.success("Flight booking added to trip")
        onDone?.()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error adding booking to trip:", error)
      toast.error("Failed to add booking to trip")
    }
  }

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Booking Confirmation</CardTitle>
        {bookingReference && (
          <p className="text-muted-foreground">
            Booking Reference: {bookingReference}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-2 font-medium">Flight Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-muted-foreground text-sm">Airline</div>
              <div className="font-medium">{flight.airline.name}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Flight Number</div>
              <div className="font-medium">
                {flight.slices?.[0]?.segments?.[0]?.flight_number}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">From</div>
              <div className="font-medium">
                {flight.slices?.[0]?.segments?.[0]?.departure?.airport}
              </div>
              <div className="text-muted-foreground text-sm">
                {formatDate(flight.slices?.[0]?.segments?.[0]?.departure?.time)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">To</div>
              <div className="font-medium">
                {flight.slices?.[0]?.segments?.[0]?.arrival?.airport}
              </div>
              <div className="text-muted-foreground text-sm">
                {formatDate(flight.slices?.[0]?.segments?.[0]?.arrival?.time)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Duration</div>
              <div className="font-medium">{flight.slices?.[0]?.duration}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Price</div>
              <div className="font-medium">
                {flight.total_amount} {flight.total_currency}
              </div>
            </div>
          </div>
        </div>

        {flight.conditions && (
          <div>
            <h3 className="mb-2 font-medium">Fare Conditions</h3>
            <div className="space-y-4">
              <Alert>
                <Info className="size-4" />
                <AlertDescription>
                  Changes allowed: {flight.conditions.changeable ? "Yes" : "No"}
                  {flight.conditions.change_fee &&
                    ` (Fee: ${flight.conditions.change_fee})`}
                </AlertDescription>
              </Alert>
              <Alert>
                <Info className="size-4" />
                <AlertDescription>
                  Refunds allowed: {flight.conditions.refundable ? "Yes" : "No"}
                  {flight.conditions.refund_fee &&
                    ` (Fee: ${flight.conditions.refund_fee})`}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        {flight.slices?.map((slice, index) => (
          <div key={index}>
            <h3 className="mb-2 font-medium">
              {index === 0 ? "Outbound" : "Return"} Flight
            </h3>
            {slice.segments.map((segment, segmentIndex) => (
              <div key={segmentIndex}>
                <h3 className="mb-2 font-medium">
                  Flight Segment {segmentIndex + 1}: {segment.departure.airport}{" "}
                  → {segment.arrival.airport}
                </h3>
              </div>
            ))}
          </div>
        ))}

        {flight.baggage && (
          <div>
            <h3 className="mb-2 font-medium">Baggage Allowance</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {flight.baggage.checked.length > 0 && (
                <div>
                  <div className="text-muted-foreground text-sm">
                    Checked Baggage
                  </div>
                  <div className="font-medium">
                    {flight.baggage.checked.map((bag, i) => (
                      <div key={i}>
                        {bag.quantity} checked bag
                        {bag.quantity !== 1 ? "s" : ""}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {flight.baggage.carry_on.length > 0 && (
                <div>
                  <div className="text-muted-foreground text-sm">
                    Cabin Baggage
                  </div>
                  <div className="font-medium">
                    {flight.baggage.carry_on.map((bag, i) => (
                      <div key={i}>
                        {bag.quantity} cabin bag{bag.quantity !== 1 ? "s" : ""}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <Separator />

        <div>
          <h3 className="mb-2 font-medium">Passenger Details</h3>
          {passengers.map((passenger, index) => (
            <Card key={index} className="mb-4">
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-muted-foreground text-sm">Name</div>
                    <div className="font-medium">
                      {passenger.title} {passenger.given_name}{" "}
                      {passenger.family_name}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm">Gender</div>
                    <div className="font-medium capitalize">
                      {passenger.gender}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm">Email</div>
                    <div className="font-medium">{passenger.email}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm">Phone</div>
                    <div className="font-medium">{passenger.phone}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm">
                      Date of Birth
                    </div>
                    <div className="font-medium">
                      {new Date(passenger.born_on).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm">
                      Passenger Type
                    </div>
                    <div className="font-medium capitalize">
                      {passenger.type.replace("_", " ")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onDone}>
          Done
        </Button>
        {bookingReference && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add to Trip</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add to Trip</DialogTitle>
                <DialogDescription>
                  Select a trip to add this flight booking to
                </DialogDescription>
              </DialogHeader>
              <TripSelector
                onSelect={tripId => {
                  handleAddToTrip(tripId)
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  )
}
