"use client"

import { Trip } from "@/types/trip"
import { RaceWithDetails } from "@/types/race"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, List, Plus, X } from "lucide-react"
import { Dispatch, SetStateAction, useMemo } from "react"

interface PackingTabProps {
  trip: Trip
  race: RaceWithDetails
  userId: string
  editingSection: string | null
  setEditingSection: (section: string | null) => void
  editedTrip: Trip
  setEditedTrip: Dispatch<SetStateAction<Trip>>
}

export function PackingTab({
  trip,
  race,
  userId,
  editingSection,
  setEditingSection,
  editedTrip,
  setEditedTrip
}: PackingTabProps) {
  const suggestedPackingItems = useMemo(() => {
    const baseItems = [
      "Race tickets",
      "Passport",
      "Comfortable walking shoes",
      "Camera",
      "Power bank",
      "Hat/Cap",
      "Sunscreen"
    ]

    // Add location-specific items
    if (
      race.country === "Saudi Arabia" ||
      race.country === "United Arab Emirates" ||
      race.country === "Qatar" ||
      race.country === "Bahrain"
    ) {
      baseItems.push(
        "Light, modest clothing",
        "Sunglasses",
        "Portable fan",
        "Water bottle"
      )
    }

    return baseItems
  }, [race.country])

  const handlePackingListUpdate = (items: string[]) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        packingList: items
      })
    )
  }

  const handleAddItem = (item: string) => {
    if (!editedTrip.packingList.includes(item)) {
      handlePackingListUpdate([...editedTrip.packingList, item])
    }
  }

  const handleRemoveItem = (index: number) => {
    const newList = [...editedTrip.packingList]
    newList.splice(index, 1)
    handlePackingListUpdate(newList)
  }

  const handleCustomItemAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement
    if (e.key === "Enter" && input.value.trim()) {
      handleAddItem(input.value.trim())
      input.value = ""
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Packing List</CardTitle>
        {trip.userId === userId && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() =>
              setEditingSection(editingSection === "packing" ? null : "packing")
            }
          >
            {editingSection === "packing" ? (
              <>
                <X className="size-4" />
                Cancel Edit
              </>
            ) : (
              <>
                <Edit className="size-4" />
                Edit Packing List
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editingSection === "packing" ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {suggestedPackingItems.map(item => (
                <Button
                  key={item}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddItem(item)}
                >
                  <Plus className="mr-2 size-4" />
                  {item}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              {editedTrip.packingList.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span>{item}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add custom item"
                onKeyPress={handleCustomItemAdd}
              />
              <Button
                variant="outline"
                onClick={e => {
                  const input = e.currentTarget
                    .previousElementSibling as HTMLInputElement
                  if (input.value.trim()) {
                    handleAddItem(input.value.trim())
                    input.value = ""
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
            {editedTrip.packingList.length > 0 ? (
              <div className="w-full space-y-2">
                {editedTrip.packingList.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="bg-primary size-2 rounded-full" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <List className="mb-4 size-12 opacity-50" />
                <p>No packing list items added yet.</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
