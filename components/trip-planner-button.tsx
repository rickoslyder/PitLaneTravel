"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Calendar, PlaneLanding, Hotel, MapPin } from "lucide-react"
import { RaceWithDetails } from "@/types/race"
import { useRouter } from "next/navigation"
import { createTripAction } from "@/actions/db/trips-actions"
import { toast } from "sonner"

interface TripPlannerButtonProps {
  race: RaceWithDetails
  userId?: string | null
  existingTripId?: string
}

export function TripPlannerButton({
  race,
  userId,
  existingTripId
}: TripPlannerButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  const handleCreateTrip = async () => {
    if (!userId) {
      toast.error("Please sign in to create a trip plan")
      return
    }

    try {
      const result = await createTripAction({
        userId,
        raceId: race.id,
        title: `${race.name} Trip`,
        description: `Trip plan for ${race.name}`,
        visibility: "private",
        status: "planning",
        sharedWith: []
      })

      if (result.isSuccess) {
        toast.success("Trip plan created!")
        router.push(`/trips/${result.data.id}`)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to create trip plan")
    }
  }

  const handleViewTrip = () => {
    if (existingTripId) {
      router.push(`/trips/${existingTripId}`)
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2">
            <Calendar className="size-4" />
            Plan Your Trip
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {existingTripId ? (
            <DropdownMenuItem onClick={handleViewTrip} className="gap-2">
              <Calendar className="size-4" />
              View Your Trip Plan
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={handleCreateTrip} className="gap-2">
              <Calendar className="size-4" />
              Create Trip Plan
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DialogTrigger asChild>
            <DropdownMenuItem className="gap-2">
              <PlaneLanding className="size-4" />
              Search Flights
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogTrigger asChild>
            <DropdownMenuItem className="gap-2">
              <Hotel className="size-4" />
              Find Hotels
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogTrigger asChild>
            <DropdownMenuItem className="gap-2">
              <MapPin className="size-4" />
              Explore Area
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Coming Soon</DialogTitle>
          <DialogDescription>
            Direct flight and hotel booking integration coming soon! For now, we
            recommend:
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Skyscanner for flights</li>
              <li>Booking.com for hotels</li>
              <li>Google Maps for local exploration</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
