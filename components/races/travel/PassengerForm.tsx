"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { DuffelPassengerTitle, DuffelPassengerType } from "@/types/duffel"

interface PassengerFormProps {
  passengerCount: number
  onSubmit: (passengers: PassengerInfo[]) => void
  onCancel: () => void
}

export interface PassengerInfo {
  type: DuffelPassengerType
  title: DuffelPassengerTitle
  given_name: string
  family_name: string
  email: string
  phone: string
  born_on: string
  gender: "m" | "f" | "o"
}

export function PassengerForm({
  passengerCount,
  onSubmit,
  onCancel
}: PassengerFormProps) {
  const [passengers, setPassengers] = useState<PassengerInfo[]>(
    Array(passengerCount)
      .fill(null)
      .map(() => ({
        type: "adult",
        title: "mr",
        given_name: "",
        family_name: "",
        email: "",
        phone: "",
        born_on: "",
        gender: "m"
      }))
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(passengers)
  }

  const updatePassenger = (
    index: number,
    field: keyof PassengerInfo,
    value: string
  ) => {
    setPassengers(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {passengers.map((passenger, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>Passenger {index + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Select
                  value={passenger.title}
                  onValueChange={value =>
                    updatePassenger(index, "title", value)
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
                <Label>Gender</Label>
                <Select
                  value={passenger.gender}
                  onValueChange={value =>
                    updatePassenger(index, "gender", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m">Male</SelectItem>
                    <SelectItem value="f">Female</SelectItem>
                    <SelectItem value="o">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={passenger.given_name}
                  onChange={e =>
                    updatePassenger(index, "given_name", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={passenger.family_name}
                  onChange={e =>
                    updatePassenger(index, "family_name", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={passenger.email}
                  onChange={e =>
                    updatePassenger(index, "email", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={passenger.phone}
                  onChange={e =>
                    updatePassenger(index, "phone", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={passenger.born_on}
                  onChange={e =>
                    updatePassenger(index, "born_on", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Passenger Type</Label>
                <Select
                  value={passenger.type}
                  onValueChange={value => updatePassenger(index, "type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select passenger type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adult">Adult</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="infant_without_seat">
                      Infant (No Seat)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Continue to Booking</Button>
      </div>
    </form>
  )
}
