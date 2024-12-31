"use client"

import { Trip, Flights } from "@/types/trip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Plane, X } from "lucide-react"
import { Dispatch, SetStateAction } from "react"

interface FlightsTabProps {
  trip: Trip
  userId: string
  editingSection: string | null
  setEditingSection: (section: string | null) => void
  editedTrip: Trip
  setEditedTrip: Dispatch<SetStateAction<Trip>>
}

export function FlightsTab({
  trip,
  userId,
  editingSection,
  setEditingSection,
  editedTrip,
  setEditedTrip
}: FlightsTabProps) {
  const handleOutboundDepartureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        flights: {
          ...prev.flights,
          outbound: {
            ...prev.flights?.outbound,
            departure: e.target.value
          }
        } as Flights
      })
    )
  }

  const handleOutboundArrivalChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        flights: {
          ...prev.flights,
          outbound: {
            ...prev.flights?.outbound,
            arrival: e.target.value
          }
        } as Flights
      })
    )
  }

  const handleOutboundBookingRefChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        flights: {
          ...prev.flights,
          outbound: {
            ...prev.flights?.outbound,
            bookingReference: e.target.value
          }
        } as Flights
      })
    )
  }

  const handleOutboundBaggageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        flights: {
          ...prev.flights,
          outbound: {
            ...prev.flights?.outbound,
            baggageAllowance: e.target.value
          }
        } as Flights
      })
    )
  }

  const handleOutboundLayoversChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        flights: {
          ...prev.flights,
          outbound: {
            ...prev.flights?.outbound,
            layovers: e.target.value
              .split(",")
              .map(s => s.trim())
              .filter(Boolean)
          }
        } as Flights
      })
    )
  }

  const handleReturnDepartureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        flights: {
          ...prev.flights,
          return: {
            ...prev.flights?.return,
            departure: e.target.value
          }
        } as Flights
      })
    )
  }

  const handleReturnArrivalChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        flights: {
          ...prev.flights,
          return: {
            ...prev.flights?.return,
            arrival: e.target.value
          }
        } as Flights
      })
    )
  }

  const handleReturnBookingRefChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        flights: {
          ...prev.flights,
          return: {
            ...prev.flights?.return,
            bookingReference: e.target.value
          }
        } as Flights
      })
    )
  }

  const handleReturnBaggageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        flights: {
          ...prev.flights,
          return: {
            ...prev.flights?.return,
            baggageAllowance: e.target.value
          }
        } as Flights
      })
    )
  }

  const handleReturnLayoversChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        flights: {
          ...prev.flights,
          return: {
            ...prev.flights?.return,
            layovers: e.target.value
              .split(",")
              .map(s => s.trim())
              .filter(Boolean)
          }
        } as Flights
      })
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Flight Details</CardTitle>
        {trip.userId === userId && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() =>
              setEditingSection(editingSection === "flights" ? null : "flights")
            }
          >
            {editingSection === "flights" ? (
              <>
                <X className="size-4" />
                Cancel Edit
              </>
            ) : (
              <>
                <Edit className="size-4" />
                Edit Flights
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editingSection === "flights" ? (
          <div className="space-y-8">
            {/* Outbound Flight */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-medium">
                <span className="bg-primary size-2 rounded-full" />
                Outbound Flight
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Departure</Label>
                  <Input
                    placeholder="e.g. LHR 10:00 AM"
                    value={editedTrip.flights?.outbound?.departure ?? ""}
                    onChange={handleOutboundDepartureChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Arrival</Label>
                  <Input
                    placeholder="e.g. CDG 1:00 PM"
                    value={editedTrip.flights?.outbound?.arrival ?? ""}
                    onChange={handleOutboundArrivalChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Booking Reference</Label>
                  <Input
                    placeholder="e.g. ABC123"
                    value={editedTrip.flights?.outbound?.bookingReference ?? ""}
                    onChange={handleOutboundBookingRefChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Baggage Allowance</Label>
                  <Input
                    placeholder="e.g. 23kg checked, 7kg cabin"
                    value={editedTrip.flights?.outbound?.baggageAllowance ?? ""}
                    onChange={handleOutboundBaggageChange}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Layovers</Label>
                  <Input
                    placeholder="e.g. AMS 2h layover"
                    value={
                      editedTrip.flights?.outbound?.layovers?.join(", ") ?? ""
                    }
                    onChange={handleOutboundLayoversChange}
                  />
                  <p className="text-muted-foreground text-xs">
                    Separate multiple layovers with commas
                  </p>
                </div>
              </div>
            </div>

            {/* Return Flight */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-medium">
                <span className="bg-primary size-2 rounded-full" />
                Return Flight
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Departure</Label>
                  <Input
                    placeholder="e.g. CDG 2:00 PM"
                    value={editedTrip.flights?.return?.departure ?? ""}
                    onChange={handleReturnDepartureChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Arrival</Label>
                  <Input
                    placeholder="e.g. LHR 3:00 PM"
                    value={editedTrip.flights?.return?.arrival ?? ""}
                    onChange={handleReturnArrivalChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Booking Reference</Label>
                  <Input
                    placeholder="e.g. XYZ789"
                    value={editedTrip.flights?.return?.bookingReference ?? ""}
                    onChange={handleReturnBookingRefChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Baggage Allowance</Label>
                  <Input
                    placeholder="e.g. 23kg checked, 7kg cabin"
                    value={editedTrip.flights?.return?.baggageAllowance ?? ""}
                    onChange={handleReturnBaggageChange}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Layovers</Label>
                  <Input
                    placeholder="e.g. FRA 1h layover"
                    value={
                      editedTrip.flights?.return?.layovers?.join(", ") ?? ""
                    }
                    onChange={handleReturnLayoversChange}
                  />
                  <p className="text-muted-foreground text-xs">
                    Separate multiple layovers with commas
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {trip.flights?.outbound && (
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-medium">
                  <span className="bg-primary size-2 rounded-full" />
                  Outbound Flight
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Departure</div>
                    <div className="text-muted-foreground">
                      {trip.flights.outbound.departure}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Arrival</div>
                    <div className="text-muted-foreground">
                      {trip.flights.outbound.arrival}
                    </div>
                  </div>
                  {trip.flights.outbound.layovers.length > 0 && (
                    <div className="col-span-2 space-y-1">
                      <div className="text-sm font-medium">Layovers</div>
                      <div className="text-muted-foreground">
                        {trip.flights.outbound.layovers.join(", ")}
                      </div>
                    </div>
                  )}
                  {trip.flights.outbound.bookingReference && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        Booking Reference
                      </div>
                      <div className="text-muted-foreground">
                        {trip.flights.outbound.bookingReference}
                      </div>
                    </div>
                  )}
                  {trip.flights.outbound.baggageAllowance && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        Baggage Allowance
                      </div>
                      <div className="text-muted-foreground">
                        {trip.flights.outbound.baggageAllowance}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {trip.flights?.return && (
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-medium">
                  <span className="bg-primary size-2 rounded-full" />
                  Return Flight
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Departure</div>
                    <div className="text-muted-foreground">
                      {trip.flights.return.departure}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Arrival</div>
                    <div className="text-muted-foreground">
                      {trip.flights.return.arrival}
                    </div>
                  </div>
                  {trip.flights.return.layovers.length > 0 && (
                    <div className="col-span-2 space-y-1">
                      <div className="text-sm font-medium">Layovers</div>
                      <div className="text-muted-foreground">
                        {trip.flights.return.layovers.join(", ")}
                      </div>
                    </div>
                  )}
                  {trip.flights.return.bookingReference && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        Booking Reference
                      </div>
                      <div className="text-muted-foreground">
                        {trip.flights.return.bookingReference}
                      </div>
                    </div>
                  )}
                  {trip.flights.return.baggageAllowance && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        Baggage Allowance
                      </div>
                      <div className="text-muted-foreground">
                        {trip.flights.return.baggageAllowance}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!trip.flights?.outbound && !trip.flights?.return && (
              <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
                <Plane className="mb-4 size-12 opacity-50" />
                <p>No flight details added yet.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
