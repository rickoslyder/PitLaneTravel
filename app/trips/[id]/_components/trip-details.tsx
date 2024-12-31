"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SelectTrip } from "@/db/schema"
import { RaceWithDetails } from "@/types/race"
import { Trip } from "@/types/trip"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateTripAction } from "@/actions/db/trips-actions"

import { TripHeader } from "./trip-header"
import { RaceInfo } from "./race-info"
import { TripInfoTab } from "./trip-info-tab"
import { FlightsTab } from "./flights-tab"
import { AccommodationTab } from "./accommodation-tab"
import { TransportTab } from "./transport-tab"
import { PackingTab } from "./packing-tab"
import { AiTab } from "./ai-tab"

interface TripDetailsProps {
  trip: Trip
  race: RaceWithDetails
  userId: string
}

export function TripDetails({ trip, race, userId }: TripDetailsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("info")
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTrip, setEditedTrip] = useState<Trip>(trip)
  const [editingSection, setEditingSection] = useState<string | null>(null)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const result = await updateTripAction(trip.id, userId, {
        title: editedTrip.title,
        description: editedTrip.description,
        status: editedTrip.status,
        visibility: editedTrip.visibility,
        flights: editedTrip.flights,
        accommodation: editedTrip.accommodation,
        transportationNotes: editedTrip.transportationNotes,
        packingList: editedTrip.packingList,
        customNotes: editedTrip.customNotes
      })
      if (result.isSuccess) {
        toast.success("Trip details updated successfully")
        router.refresh()
        setIsEditing(false)
        setEditingSection(null)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to update trip details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddActivity = (activity: string) => {
    setEditedTrip(prev => ({
      ...prev,
      customNotes: {
        ...prev.customNotes,
        activities: [...(prev.customNotes?.activities || []), activity]
      }
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <TripHeader
        trip={trip}
        userId={userId}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        editedTrip={editedTrip}
        setEditedTrip={setEditedTrip}
        onSave={handleSave}
        isLoading={isLoading}
      />

      <RaceInfo race={race} />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="info">Trip Info</TabsTrigger>
          <TabsTrigger value="flights">Flights</TabsTrigger>
          <TabsTrigger value="accommodation">Accommodation</TabsTrigger>
          <TabsTrigger value="transport">Transport</TabsTrigger>
          <TabsTrigger value="packing">Packing</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <TripInfoTab race={race} description={trip.description} />
        </TabsContent>

        <TabsContent value="flights">
          <FlightsTab
            trip={trip}
            userId={userId}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
            editedTrip={editedTrip}
            setEditedTrip={setEditedTrip}
          />
        </TabsContent>

        <TabsContent value="accommodation">
          <AccommodationTab
            trip={trip}
            userId={userId}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
            editedTrip={editedTrip}
            setEditedTrip={setEditedTrip}
          />
        </TabsContent>

        <TabsContent value="transport">
          <TransportTab
            trip={trip}
            userId={userId}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
            editedTrip={editedTrip}
            setEditedTrip={setEditedTrip}
          />
        </TabsContent>

        <TabsContent value="packing">
          <PackingTab
            trip={trip}
            race={race}
            userId={userId}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
            editedTrip={editedTrip}
            setEditedTrip={setEditedTrip}
          />
        </TabsContent>

        <TabsContent value="ai">
          <AiTab
            trip={trip}
            race={race}
            userId={userId}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
            editedTrip={editedTrip}
            setEditedTrip={setEditedTrip}
            onAddActivity={handleAddActivity}
          />
        </TabsContent>
      </Tabs>

      {isEditing && (
        <div className="fixed bottom-4 right-4 flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEditedTrip(trip)
              setIsEditing(false)
              setEditingSection(null)
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      )}
    </motion.div>
  )
}
