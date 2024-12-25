"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { RaceWithDetails, LocalAttraction } from "@/types/race"
import { useAuth } from "@clerk/nextjs"
import { format } from "date-fns"
import { CalendarIcon, Clock, MapPin, Plus, Star, Trash } from "lucide-react"
import { useEffect, useState } from "react"
import { Calendar } from "../ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  createItineraryAction,
  deleteItineraryAction,
  getItinerariesAction,
  updateItineraryAction
} from "@/actions/db/itinerary-actions"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface Activity {
  id: string
  name: string
  type?: string
  price?: {
    amount: number
    currency: string
  }
  rating?: number
  category?: string
  distance?: string
  duration?: string
  location?: {
    lat: number
    lng: number
  }
  timeSlot?: string
  description?: string
  visitDuration?: string
}

interface ItineraryData {
  activities: Activity[]
  date: string
}

interface SavedItinerary {
  id: string
  name: string
  description: string | undefined
  itinerary: ItineraryData
  createdAt: string
  updatedAt: string
}

interface RaceItineraryProps {
  race: RaceWithDetails
}

export function RaceItinerary({ race }: RaceItineraryProps) {
  const { userId } = useAuth()
  const [activeTab, setActiveTab] = useState("create")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date>()
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([])
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([])
  const [editingItinerary, setEditingItinerary] =
    useState<SavedItinerary | null>(null)

  useEffect(() => {
    if (userId) {
      fetchItineraries()
    }
  }, [userId, race.id])

  const fetchItineraries = async () => {
    if (!userId) return

    const result = await getItinerariesAction(userId, race.id)
    if (result.isSuccess) {
      setSavedItineraries(
        result.data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || undefined,
          itinerary: item.itinerary as ItineraryData,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString()
        }))
      )
    } else {
      toast.error(result.message)
    }
  }

  const handleSave = async () => {
    if (!userId || !name || !date || selectedActivities.length === 0) {
      toast.error("Please fill in all required fields")
      return
    }

    const itineraryData = {
      activities: selectedActivities,
      date: date.toISOString()
    }

    if (editingItinerary) {
      const result = await updateItineraryAction(userId, editingItinerary.id, {
        name,
        description: description || null,
        itinerary: itineraryData
      })

      if (result.isSuccess) {
        toast.success(result.message)
        await fetchItineraries()
        resetForm()
      } else {
        toast.error(result.message)
      }
    } else {
      const result = await createItineraryAction(
        userId,
        race.id,
        name,
        description || null,
        itineraryData
      )

      if (result.isSuccess) {
        toast.success(result.message)
        await fetchItineraries()
        resetForm()
      } else {
        toast.error(result.message)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!userId) return

    const result = await deleteItineraryAction(userId, id)
    if (result.isSuccess) {
      toast.success(result.message)
      await fetchItineraries()
    } else {
      toast.error(result.message)
    }
  }

  const handleEdit = (itinerary: SavedItinerary) => {
    setEditingItinerary(itinerary)
    setName(itinerary.name)
    setDescription(itinerary.description || "")
    setDate(new Date(itinerary.itinerary.date))
    setSelectedActivities(itinerary.itinerary.activities)
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setDate(undefined)
    setSelectedActivities([])
    setEditingItinerary(null)
    setIsDialogOpen(false)
  }

  const handleActivitySelect = (activity: Activity) => {
    if (selectedActivities.some(a => a.id === activity.id)) {
      setSelectedActivities(
        selectedActivities.filter(a => a.id !== activity.id)
      )
    } else {
      setSelectedActivities([...selectedActivities, activity])
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList>
        <TabsTrigger value="create">Create Itinerary</TabsTrigger>
        <TabsTrigger value="saved">Saved Itineraries</TabsTrigger>
      </TabsList>

      <TabsContent value="create" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Available Activities</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" />
                Create Itinerary
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingItinerary ? "Edit" : "Create"} Itinerary
                </DialogTitle>
                <DialogDescription>
                  Plan your activities for the race weekend
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="My Race Weekend"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="A brief description of your itinerary"
                  />
                </div>

                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Selected Activities</Label>
                  <div className="space-y-2">
                    {selectedActivities.map(activity => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between rounded border p-2"
                      >
                        <span>{activity.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleActivitySelect(activity)}
                        >
                          <Trash className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {race.circuit?.local_attractions?.map((activity: LocalAttraction) => (
            <div
              key={activity.id}
              className={cn(
                "cursor-pointer rounded-lg border p-4 transition-colors",
                selectedActivities.some(a => a.id === activity.id)
                  ? "border-primary"
                  : "hover:border-primary/50"
              )}
              onClick={() => handleActivitySelect(activity)}
            >
              <div className="mb-2 flex items-start justify-between">
                <h4 className="font-medium">{activity.name}</h4>
                {activity.price_range && (
                  <div className="text-muted-foreground text-sm">
                    {activity.price_range}
                  </div>
                )}
              </div>

              <div className="text-muted-foreground space-y-2 text-sm">
                {activity.distance_from_circuit && (
                  <div className="flex items-center">
                    <MapPin className="mr-2 size-4" />
                    {activity.distance_from_circuit}km from circuit
                  </div>
                )}
                {activity.estimated_duration && (
                  <div className="flex items-center">
                    <Clock className="mr-2 size-4" />
                    {activity.estimated_duration}
                  </div>
                )}
                {activity.description && <p>{activity.description}</p>}

                <div className="mt-4 flex flex-wrap gap-2">
                  {activity.booking_required && (
                    <Badge
                      variant="outline"
                      className="bg-yellow-500/10 text-yellow-500"
                    >
                      Booking Required
                    </Badge>
                  )}
                  {activity.recommended_times?.map(
                    (time: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-blue-500/10 text-blue-500"
                      >
                        {time}
                      </Badge>
                    )
                  )}
                </div>

                {activity.f1_relevance && (
                  <div className="bg-primary/10 mt-2 rounded-md p-2 text-xs">
                    <strong>F1 Connection:</strong> {activity.f1_relevance}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="saved" className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savedItineraries.map(itinerary => (
            <div key={itinerary.id} className="rounded-lg border p-4">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{itinerary.name}</h4>
                  {itinerary.description && (
                    <p className="text-muted-foreground text-sm">
                      {itinerary.description}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(itinerary)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(itinerary.id)}
                  >
                    <Trash className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {itinerary.itinerary.activities.map(activity => (
                  <div
                    key={activity.id}
                    className="bg-muted rounded p-2 text-sm"
                  >
                    <div className="font-medium">{activity.name}</div>
                    {activity.timeSlot && (
                      <div className="text-muted-foreground">
                        {activity.timeSlot}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
