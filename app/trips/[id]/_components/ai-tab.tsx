"use client"

import { Trip } from "@/types/trip"
import { RaceWithDetails } from "@/types/race"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Globe, X } from "lucide-react"
import { Dispatch, SetStateAction } from "react"
import { AiTripPlanner } from "@/components/ai-trip-planner"

interface AiTabProps {
  trip: Trip
  race: RaceWithDetails
  userId: string
  editingSection: string | null
  setEditingSection: (section: string | null) => void
  editedTrip: Trip
  setEditedTrip: Dispatch<SetStateAction<Trip>>
  onAddActivity: (activity: string) => void
}

export function AiTab({
  trip,
  race,
  userId,
  editingSection,
  setEditingSection,
  editedTrip,
  setEditedTrip,
  onAddActivity
}: AiTabProps) {
  const handleAiNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        customNotes: {
          ...prev.customNotes,
          aiAssistant: e.target.value
        }
      })
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>AI Assistant</CardTitle>
        {trip.userId === userId && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() =>
              setEditingSection(editingSection === "ai" ? null : "ai")
            }
          >
            {editingSection === "ai" ? (
              <>
                <X className="size-4" />
                Cancel Edit
              </>
            ) : (
              <>
                <Edit className="size-4" />
                Edit AI Notes
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editingSection === "ai" ? (
          <div className="space-y-4">
            <div>
              <Textarea
                placeholder="Enter AI assistant notes"
                value={editedTrip.customNotes?.aiAssistant || ""}
                onChange={handleAiNotesChange}
              />
            </div>
          </div>
        ) : (
          <AiTripPlanner
            tripDetails={{
              id: trip.id,
              userId: trip.userId,
              raceId: trip.raceId,
              title: trip.title,
              description: trip.description,
              visibility: trip.visibility,
              sharedWith: trip.sharedWith || [],
              race: {
                id: race.id,
                circuit_id: race.circuit_id,
                name: race.name,
                date: race.date,
                season: race.season,
                round: race.round,
                country: race.country,
                description: race.description,
                weekend_start: race.weekend_start,
                weekend_end: race.weekend_end,
                status: race.status,
                slug: race.slug,
                is_sprint_weekend: race.is_sprint_weekend,
                openf1_meeting_key: race.openf1_meeting_key,
                openf1_session_key: race.openf1_session_key,
                created_at: race.created_at,
                updated_at: race.updated_at,
                circuit: race.circuit
                  ? {
                      id: race.circuit.id,
                      name: race.circuit.name,
                      location: race.circuit.location,
                      country: race.circuit.country,
                      latitude: race.circuit.latitude,
                      longitude: race.circuit.longitude,
                      image_url: race.circuit.image_url,
                      openf1_key: race.circuit.openf1_key,
                      openf1_short_name: race.circuit.openf1_short_name,
                      created_at: race.circuit.created_at,
                      updated_at: race.circuit.updated_at,
                      details: race.circuit.details,
                      airports: race.circuit.airports,
                      local_attractions: race.circuit.local_attractions,
                      transport_info: race.circuit.transport_info,
                      locations: race.circuit.locations
                    }
                  : undefined
              }
            }}
            onAddActivity={onAddActivity}
          />
        )}
      </CardContent>
    </Card>
  )
}
