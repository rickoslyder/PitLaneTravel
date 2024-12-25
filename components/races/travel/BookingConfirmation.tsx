"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TransformedFlightOffer } from "@/types/duffel"
import { PassengerInfo } from "./PassengerForm"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { Separator } from "@/components/ui/separator"

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
                {flight.segments[0].flight_number}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">From</div>
              <div className="font-medium">{flight.departure.airport}</div>
              <div className="text-muted-foreground text-sm">
                {formatDate(flight.departure.time)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">To</div>
              <div className="font-medium">{flight.arrival.airport}</div>
              <div className="text-muted-foreground text-sm">
                {formatDate(flight.arrival.time)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Duration</div>
              <div className="font-medium">{flight.duration}</div>
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

        {flight.segments.map((segment, index) => (
          <div key={index}>
            <h3 className="mb-2 font-medium">
              Flight Segment {index + 1}: {segment.departure.airport} →{" "}
              {segment.arrival.airport}
            </h3>
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
                        {bag.quantity} × {bag.weight}
                        {bag.unit}
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
                        {bag.quantity} × {bag.weight}
                        {bag.unit}
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

        <div className="flex justify-end gap-4">
          <Button onClick={onDone}>Done</Button>
        </div>
      </CardContent>
    </Card>
  )
}
