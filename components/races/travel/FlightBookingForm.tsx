"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { TransformedFlightOffer } from "@/types/duffel"
import { toast } from "sonner"

interface FlightBookingFormProps {
  offer: TransformedFlightOffer
  passengerCount: number
  onClose: () => void
}

interface PassengerDetails {
  given_name: string
  family_name: string
  email: string
  phone_number: string
  title: string
  born_on: string
}

export function FlightBookingForm({
  offer,
  passengerCount,
  onClose
}: FlightBookingFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [passengers, setPassengers] = useState<PassengerDetails[]>(
    Array(passengerCount).fill({
      given_name: "",
      family_name: "",
      email: "",
      phone_number: "",
      title: "",
      born_on: ""
    })
  )

  const handleSubmit = async () => {
    // Validate passenger details
    const isValid = passengers.every(passenger => {
      return (
        passenger.given_name &&
        passenger.family_name &&
        passenger.email &&
        passenger.phone_number &&
        passenger.title &&
        passenger.born_on
      )
    })

    if (!isValid) {
      toast.error("Please fill in all passenger details")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/flights/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          offer_id: offer.id,
          passengers
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to book flight")
      }

      toast.success("Flight booked successfully!")
      onClose()
    } catch (error) {
      console.error("Error booking flight:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to book flight"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Book Flight</DialogTitle>
          <DialogDescription>
            Please enter passenger details for your flight from{" "}
            {offer.departure.city} to {offer.arrival.city}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {passengers.map((passenger, index) => (
            <div key={index} className="space-y-4">
              <h4 className="font-medium">
                Passenger {index + 1} of {passengerCount}
              </h4>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Select
                    value={passenger.title}
                    onValueChange={title =>
                      setPassengers(prev =>
                        prev.map((p, i) => (i === index ? { ...p, title } : p))
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mr">Mr</SelectItem>
                      <SelectItem value="mrs">Mrs</SelectItem>
                      <SelectItem value="ms">Ms</SelectItem>
                      <SelectItem value="miss">Miss</SelectItem>
                      <SelectItem value="dr">Dr</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={passenger.born_on}
                    onChange={e =>
                      setPassengers(prev =>
                        prev.map((p, i) =>
                          i === index ? { ...p, born_on: e.target.value } : p
                        )
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={passenger.given_name}
                    onChange={e =>
                      setPassengers(prev =>
                        prev.map((p, i) =>
                          i === index ? { ...p, given_name: e.target.value } : p
                        )
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={passenger.family_name}
                    onChange={e =>
                      setPassengers(prev =>
                        prev.map((p, i) =>
                          i === index
                            ? { ...p, family_name: e.target.value }
                            : p
                        )
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={passenger.email}
                    onChange={e =>
                      setPassengers(prev =>
                        prev.map((p, i) =>
                          i === index ? { ...p, email: e.target.value } : p
                        )
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={passenger.phone_number}
                    onChange={e =>
                      setPassengers(prev =>
                        prev.map((p, i) =>
                          i === index
                            ? { ...p, phone_number: e.target.value }
                            : p
                        )
                      )
                    }
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Booking..." : "Book Flight"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
