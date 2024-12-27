"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectCircuit } from "@/db/schema"
import { useState } from "react"
import { toast } from "sonner"
import { updateCircuitAction } from "@/actions/db/circuits-actions"
import { Circle as CircuitIcon, MapPin, Globe, Image } from "lucide-react"

interface CircuitFormProps {
  circuit: SelectCircuit
}

export default function CircuitForm({ circuit }: CircuitFormProps) {
  const [name, setName] = useState(circuit.name)
  const [country, setCountry] = useState(circuit.country)
  const [location, setLocation] = useState(circuit.location)
  const [latitude, setLatitude] = useState(circuit.latitude || "")
  const [longitude, setLongitude] = useState(circuit.longitude || "")
  const [imageUrl, setImageUrl] = useState(circuit.imageUrl || "")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateCircuitAction(circuit.id, {
        name,
        country,
        location,
        latitude,
        longitude,
        imageUrl
      })

      if (result.isSuccess) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">Edit Circuit</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            <div className="flex items-center gap-2">
              <CircuitIcon className="size-4" />
              Circuit Name
            </div>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter circuit name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">
            <div className="flex items-center gap-2">
              <Globe className="size-4" />
              Country
            </div>
          </Label>
          <Input
            id="country"
            value={country}
            onChange={e => setCountry(e.target.value)}
            placeholder="Enter country"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">
            <div className="flex items-center gap-2">
              <MapPin className="size-4" />
              Location
            </div>
          </Label>
          <Input
            id="location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Enter location"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="latitude">
              <div className="flex items-center gap-2">
                <MapPin className="size-4" />
                Latitude
              </div>
            </Label>
            <Input
              id="latitude"
              value={latitude}
              onChange={e => setLatitude(e.target.value)}
              placeholder="Enter latitude"
              type="number"
              step="any"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">
              <div className="flex items-center gap-2">
                <MapPin className="size-4" />
                Longitude
              </div>
            </Label>
            <Input
              id="longitude"
              value={longitude}
              onChange={e => setLongitude(e.target.value)}
              placeholder="Enter longitude"
              type="number"
              step="any"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">
            <div className="flex items-center gap-2">
              <Image className="size-4" />
              Image URL
            </div>
          </Label>
          <Input
            id="imageUrl"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="Enter image URL"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Circuit"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
