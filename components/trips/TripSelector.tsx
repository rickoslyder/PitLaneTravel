"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  getUserTripsAction,
  createTripAction
} from "@/actions/db/trips-actions"
import { SelectTrip } from "@/db/schema"
import { Loader2, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@clerk/nextjs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface TripSelectorProps {
  onSelect: (tripId: string, setOpen: (open: boolean) => void) => void
  isLoading?: boolean
  raceId?: string
}

export function TripSelector({
  onSelect,
  isLoading,
  raceId
}: TripSelectorProps) {
  const { userId } = useAuth()
  const [trips, setTrips] = useState<SelectTrip[]>([])
  const [error, setError] = useState<string>()
  const [isFetching, setIsFetching] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTrip, setNewTrip] = useState({
    title: "",
    description: ""
  })

  useEffect(() => {
    fetchTrips()
  }, [userId])

  const fetchTrips = async () => {
    if (!userId) {
      setError("Please sign in to view your trips")
      setIsFetching(false)
      return
    }

    try {
      const { data, isSuccess } = await getUserTripsAction(userId)
      if (!isSuccess) {
        throw new Error("Failed to fetch trips")
      }
      setTrips(data || [])
    } catch (error) {
      console.error("Error fetching trips:", error)
      setError("Failed to load trips")
    } finally {
      setIsFetching(false)
    }
  }

  const handleCreateTrip = async () => {
    if (!userId) return
    if (!newTrip.title.trim()) {
      toast.error("Please enter a trip title")
      return
    }
    if (!raceId) {
      toast.error("No race selected")
      return
    }

    setIsCreating(true)
    try {
      const result = await createTripAction({
        userId,
        title: newTrip.title.trim(),
        description: newTrip.description.trim() || "No description provided",
        raceId,
        visibility: "private",
        status: "planning",
        sharedWith: []
      })

      if (!result.isSuccess || !result.data) {
        throw new Error("Failed to create trip")
      }

      toast.success("Trip created successfully")
      setTrips(prev => [...prev, result.data])
      setShowCreateDialog(false)
      setNewTrip({ title: "", description: "" })
      onSelect(result.data.id, setShowCreateDialog)
    } catch (error) {
      console.error("Error creating trip:", error)
      toast.error("Failed to create trip")
    } finally {
      setIsCreating(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Select a Trip</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 size-4" />
              New Trip
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Trip</DialogTitle>
              <DialogDescription>
                Create a new trip to add your flight booking to
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Trip Title</Label>
                <Input
                  id="title"
                  value={newTrip.title}
                  onChange={e =>
                    setNewTrip(prev => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., Monaco GP 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newTrip.description}
                  onChange={e =>
                    setNewTrip(prev => ({
                      ...prev,
                      description: e.target.value
                    }))
                  }
                  placeholder="Add any notes about your trip..."
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateTrip} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Trip"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {trips.length === 0 ? (
        <Alert>
          <AlertDescription>
            You don't have any trips yet. Create your first trip to add this
            booking to it.
          </AlertDescription>
        </Alert>
      ) : (
        trips.map(trip => (
          <Card
            key={trip.id}
            className="hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => onSelect(trip.id, setShowCreateDialog)}
          >
            <CardContent className="p-4">
              <div className="font-medium">{trip.title}</div>
              {trip.description && (
                <div className="text-muted-foreground text-sm">
                  {trip.description}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
