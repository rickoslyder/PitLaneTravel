"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Plus, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { SelectFlightBooking } from "@/db/schema"
import { useRouter } from "next/navigation"
import { addFlightBookingToTripAction } from "@/actions/db/flight-bookings-actions"
import { toast } from "sonner"
import { useState } from "react"
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
import {
  formatTime,
  formatDate,
  formatDuration,
  formatPassengerTitle
} from "@/lib/utils"

interface BookingConfirmationPageProps {
  booking: SelectFlightBooking
}

export function BookingConfirmationPage({
  booking
}: BookingConfirmationPageProps) {
  const router = useRouter()
  const [isAddingToTrip, setIsAddingToTrip] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [showRedirectConfirm, setShowRedirectConfirm] = useState(false)

  const formatDate = (date: Date) => {
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
    setSelectedTripId(tripId)
    setIsLoading(true)
    try {
      const { isSuccess } = await addFlightBookingToTripAction(
        booking.id,
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

  const offer = booking.offerData as any
  const passengers = booking.passengerData as any[]

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Booking Confirmation</CardTitle>
        {booking.bookingReference && (
          <p className="text-muted-foreground">
            Booking Reference: {booking.bookingReference}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-2 font-medium">Flight Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-muted-foreground text-sm">Airline</div>
              <div className="font-medium">{offer.owner.name}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Flight Number</div>
              <div className="font-medium">
                {offer.slices[0].segments[0].operating_carrier_flight_number}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">From</div>
              <div className="font-medium">{booking.departureIata}</div>
              <div className="text-muted-foreground text-sm">
                {formatDate(booking.departureTime)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">To</div>
              <div className="font-medium">{booking.arrivalIata}</div>
              <div className="text-muted-foreground text-sm">
                {formatDate(booking.arrivalTime)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Duration</div>
              <div className="font-medium">{offer.slices[0].duration}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Price</div>
              <div className="font-medium">
                {booking.totalAmount} {booking.totalCurrency}
              </div>
            </div>
          </div>
        </div>

        {offer.conditions && (
          <div>
            <h3 className="mb-2 font-medium">Fare Conditions</h3>
            <div className="space-y-4">
              <Alert>
                <Info className="size-4" />
                <AlertDescription>
                  Changes allowed:{" "}
                  {offer.conditions.change_before_departure?.allowed
                    ? "Yes"
                    : "No"}
                  {offer.conditions.change_before_departure?.penalty_amount &&
                    ` (Fee: ${offer.conditions.change_before_departure.penalty_amount})`}
                </AlertDescription>
              </Alert>
              <Alert>
                <Info className="size-4" />
                <AlertDescription>
                  Refunds allowed:{" "}
                  {offer.conditions.refund_before_departure?.allowed
                    ? "Yes"
                    : "No"}
                  {offer.conditions.refund_before_departure?.penalty_amount &&
                    ` (Fee: ${offer.conditions.refund_before_departure.penalty_amount})`}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        {offer.slices[0].segments.map((segment: any, index: number) => (
          <div key={index}>
            <h3 className="mb-2 font-medium">
              Flight Segment {index + 1}: {segment.origin.iata_code} →{" "}
              {segment.destination.iata_code}
            </h3>
          </div>
        ))}

        {offer.slices[0].segments[0].passengers?.[0]?.baggages && (
          <div>
            <h3 className="mb-2 font-medium">Baggage Allowance</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {offer.slices[0].segments[0].passengers[0].baggages
                .filter((b: any) => b.type === "checked")
                .map((bag: any, i: number) => (
                  <div key={i}>
                    <div className="text-muted-foreground text-sm">
                      Checked Baggage
                    </div>
                    <div className="font-medium">
                      {bag.quantity} checked bag{bag.quantity !== 1 ? "s" : ""}
                    </div>
                  </div>
                ))}
              {offer.slices[0].segments[0].passengers[0].baggages
                .filter((b: any) => b.type === "carry_on")
                .map((bag: any, i: number) => (
                  <div key={i}>
                    <div className="text-muted-foreground text-sm">
                      Cabin Baggage
                    </div>
                    <div className="font-medium">
                      {bag.quantity} cabin bag{bag.quantity !== 1 ? "s" : ""}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <Separator />

        <div>
          <h3 className="mb-2 font-medium">Passenger Details</h3>
          {passengers.map((passenger: any, index: number) => (
            <Card key={index} className="mb-4">
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-muted-foreground text-sm">Name</div>
                    <div className="font-medium">
                      {formatPassengerTitle(passenger.title)}{" "}
                      {passenger.given_name} {passenger.family_name}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm">Email</div>
                    <div className="font-medium">{passenger.email}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm">Phone</div>
                    <div className="font-medium">{passenger.phone_number}</div>
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

        <div className="flex justify-end gap-4">
          {!booking.addedToTrip && (
            <Dialog open={isAddingToTrip} onOpenChange={setIsAddingToTrip}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 size-4" />
                  Add to Trip
                </Button>
              </DialogTrigger>
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
          )}
          <Button onClick={() => router.push("/flights")}>Done</Button>
        </div>
      </CardContent>
    </Card>
  )
}
