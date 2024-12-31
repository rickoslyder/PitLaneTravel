"use client"

import { Trip } from "@/types/trip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Car, X } from "lucide-react"
import { Dispatch, SetStateAction } from "react"

interface TransportTabProps {
  trip: Trip
  userId: string
  editingSection: string | null
  setEditingSection: (section: string | null) => void
  editedTrip: Trip
  setEditedTrip: Dispatch<SetStateAction<Trip>>
}

export function TransportTab({
  trip,
  userId,
  editingSection,
  setEditingSection,
  editedTrip,
  setEditedTrip
}: TransportTabProps) {
  const handleTransportNotesChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        transportationNotes: e.target.value
      })
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transport Notes</CardTitle>
        {trip.userId === userId && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() =>
              setEditingSection(
                editingSection === "transport" ? null : "transport"
              )
            }
          >
            {editingSection === "transport" ? (
              <>
                <X className="size-4" />
                Cancel Edit
              </>
            ) : (
              <>
                <Edit className="size-4" />
                Edit Transport
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editingSection === "transport" ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Textarea
                placeholder="Enter details about local transportation, rental cars, or other transport arrangements..."
                value={editedTrip.transportationNotes || ""}
                onChange={handleTransportNotesChange}
                className="min-h-[200px]"
              />
              <p className="text-muted-foreground text-xs">
                Include information about getting to and from the circuit, local
                transport options, parking details, etc.
              </p>
            </div>
          </div>
        ) : (
          <div>
            {trip.transportationNotes ? (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p>{trip.transportationNotes}</p>
              </div>
            ) : (
              <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
                <Car className="mb-4 size-12 opacity-50" />
                <p>No transportation notes added yet.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
