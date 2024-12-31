"use client"

import { Trip, Accommodation } from "@/types/trip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Hotel, X } from "lucide-react"
import { Dispatch, SetStateAction } from "react"

interface AccommodationTabProps {
  trip: Trip
  userId: string
  editingSection: string | null
  setEditingSection: (section: string | null) => void
  editedTrip: Trip
  setEditedTrip: Dispatch<SetStateAction<Trip>>
}

export function AccommodationTab({
  trip,
  userId,
  editingSection,
  setEditingSection,
  editedTrip,
  setEditedTrip
}: AccommodationTabProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        accommodation: {
          ...prev.accommodation,
          name: e.target.value
        } as Accommodation
      })
    )
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        accommodation: {
          ...prev.accommodation,
          location: e.target.value
        } as Accommodation
      })
    )
  }

  const handleRoomTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        accommodation: {
          ...prev.accommodation,
          roomType: e.target.value
        } as Accommodation
      })
    )
  }

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        accommodation: {
          ...prev.accommodation,
          checkIn: e.target.value
        } as Accommodation
      })
    )
  }

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        accommodation: {
          ...prev.accommodation,
          checkOut: e.target.value
        } as Accommodation
      })
    )
  }

  const handleBookingRefChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        accommodation: {
          ...prev.accommodation,
          bookingReference: e.target.value
        } as Accommodation
      })
    )
  }

  const handleConfirmationCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        accommodation: {
          ...prev.accommodation,
          confirmationCode: e.target.value
        } as Accommodation
      })
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Accommodation Details</CardTitle>
        {trip.userId === userId && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() =>
              setEditingSection(
                editingSection === "accommodation" ? null : "accommodation"
              )
            }
          >
            {editingSection === "accommodation" ? (
              <>
                <X className="size-4" />
                Cancel Edit
              </>
            ) : (
              <>
                <Edit className="size-4" />
                Edit Accommodation
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editingSection === "accommodation" ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Hotel Name</Label>
                <Input
                  placeholder="e.g. Hilton Garden Inn"
                  value={editedTrip.accommodation?.name ?? ""}
                  onChange={handleNameChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="e.g. 123 Main Street"
                  value={editedTrip.accommodation?.location ?? ""}
                  onChange={handleLocationChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Room Type</Label>
                <Input
                  placeholder="e.g. Double Room"
                  value={editedTrip.accommodation?.roomType ?? ""}
                  onChange={handleRoomTypeChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Check-in</Label>
                <Input
                  placeholder="e.g. 2024-03-15 15:00"
                  value={editedTrip.accommodation?.checkIn ?? ""}
                  onChange={handleCheckInChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Check-out</Label>
                <Input
                  placeholder="e.g. 2024-03-18 11:00"
                  value={editedTrip.accommodation?.checkOut ?? ""}
                  onChange={handleCheckOutChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Booking Reference</Label>
                <Input
                  placeholder="e.g. HGI123456"
                  value={editedTrip.accommodation?.bookingReference ?? ""}
                  onChange={handleBookingRefChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmation Code</Label>
                <Input
                  placeholder="e.g. CONF123"
                  value={editedTrip.accommodation?.confirmationCode ?? ""}
                  onChange={handleConfirmationCodeChange}
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            {trip.accommodation &&
            Object.values(trip.accommodation).some(value => value !== null) ? (
              <div className="grid gap-4 md:grid-cols-2">
                {trip.accommodation.name && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Name</div>
                    <div className="text-muted-foreground">
                      {trip.accommodation.name}
                    </div>
                  </div>
                )}
                {trip.accommodation.location && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Location</div>
                    <div className="text-muted-foreground">
                      {trip.accommodation.location}
                    </div>
                  </div>
                )}
                {trip.accommodation.roomType && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Room Type</div>
                    <div className="text-muted-foreground">
                      {trip.accommodation.roomType}
                    </div>
                  </div>
                )}
                {trip.accommodation.checkIn && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Check-in</div>
                    <div className="text-muted-foreground">
                      {trip.accommodation.checkIn}
                    </div>
                  </div>
                )}
                {trip.accommodation.checkOut && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Check-out</div>
                    <div className="text-muted-foreground">
                      {trip.accommodation.checkOut}
                    </div>
                  </div>
                )}
                {trip.accommodation.bookingReference && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Booking Reference</div>
                    <div className="text-muted-foreground">
                      {trip.accommodation.bookingReference}
                    </div>
                  </div>
                )}
                {trip.accommodation.confirmationCode && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Confirmation Code</div>
                    <div className="text-muted-foreground">
                      {trip.accommodation.confirmationCode}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
                <Hotel className="mb-4 size-12 opacity-50" />
                <p>No accommodation details added yet.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
