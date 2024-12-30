"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { SelectTrip } from "@/db/schema"
import { RaceWithDetails } from "@/types/race"
import {
  Trip,
  TripVisibility,
  TripStatus,
  Flights,
  Accommodation
} from "@/types/trip"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { AiTripPlanner } from "@/components/ai-trip-planner"
import {
  Calendar,
  MapPin,
  Share2,
  Plane,
  Hotel,
  Car,
  List,
  Globe,
  Lock,
  Users,
  ChevronRight,
  Timer,
  Ticket,
  Info,
  Edit,
  Save,
  X,
  Plus,
  Loader2
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { shareTripAction, updateTripAction } from "@/actions/db/trips-actions"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

interface TripDetailsProps {
  trip: Trip
  race: RaceWithDetails
  userId: string
}

export function TripDetails({ trip, race, userId }: TripDetailsProps) {
  const router = useRouter()
  const [shareEmail, setShareEmail] = useState("")
  const [isSharing, setIsSharing] = useState(false)
  const [activeTab, setActiveTab] = useState("info")
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTrip, setEditedTrip] = useState<Trip>(trip)
  const [editingSection, setEditingSection] = useState<string | null>(null)

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const result = await shareTripAction(trip.id, userId, shareEmail)
      if (result.isSuccess) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to share trip")
    } finally {
      setIsSharing(false)
    }
  }

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

  const handleVisibilityChange = (newVisibility: TripVisibility) => {
    setEditedTrip(prev => ({
      ...prev,
      visibility: newVisibility
    }))
  }

  const handleStatusChange = (newStatus: TripStatus) => {
    setEditedTrip(prev => ({
      ...prev,
      status: newStatus
    }))
  }

  const handlePackingListUpdate = (items: string[]) => {
    setEditedTrip(prev => ({
      ...prev,
      packingList: items
    }))
  }

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
    if (race.country === "Saudi Arabia") {
      baseItems.push(
        "Light, modest clothing",
        "Sunglasses",
        "Portable fan",
        "Water bottle"
      )
    }

    return baseItems
  }, [race.country])

  const statusColors = {
    planning: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
    booked: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    completed: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
  } as const

  const visibilityColors: Record<TripVisibility, string> = {
    private: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    public: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    shared: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
  } as const

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Breadcrumb */}
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <span>Trips</span>
        <ChevronRight className="size-4" />
        <span className="text-foreground font-medium">{trip.title}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editedTrip.title}
                onChange={e =>
                  setEditedTrip(prev => ({ ...prev, title: e.target.value }))
                }
                className="text-2xl font-bold"
              />
              <Textarea
                value={editedTrip.description}
                onChange={e =>
                  setEditedTrip(prev => ({
                    ...prev,
                    description: e.target.value
                  }))
                }
                className="resize-none"
              />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight">
                {trip.title}
              </h1>
              <p className="text-muted-foreground mt-1">{trip.description}</p>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-2"
        >
          {trip.userId === userId && (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Share2 className="size-4" />
                    Share Trip
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share Trip</DialogTitle>
                    <DialogDescription>
                      Enter the email address of the person you want to share
                      this trip with.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        value={shareEmail}
                        onChange={e => setShareEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleShare}
                      disabled={!shareEmail || isSharing}
                    >
                      {isSharing ? "Sharing..." : "Share"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  if (isEditing) {
                    setEditedTrip(trip)
                    setIsEditing(false)
                  } else {
                    setIsEditing(true)
                  }
                }}
              >
                {isEditing ? (
                  <>
                    <X className="size-4" />
                    Cancel Edit
                  </>
                ) : (
                  <>
                    <Edit className="size-4" />
                    Edit Trip
                  </>
                )}
              </Button>
            </>
          )}
          {isEditing && (
            <Button
              variant="default"
              className="gap-2"
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save className="size-4" />
              Save
            </Button>
          )}
          {isEditing ? (
            <Select
              value={editedTrip.status}
              onValueChange={value => handleStatusChange(value as TripStatus)}
            >
              <SelectTrigger
                className={cn("w-[120px]", statusColors[editedTrip.status])}
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge
              variant="outline"
              className={cn(
                "transition-colors",
                statusColors[editedTrip.status]
              )}
            >
              {editedTrip.status.charAt(0).toUpperCase() +
                editedTrip.status.slice(1)}
            </Badge>
          )}
          <Badge
            variant="outline"
            className={cn(
              "transition-colors",
              visibilityColors[editedTrip.visibility]
            )}
          >
            {editedTrip.visibility === "private" ? (
              <Lock className="mr-1 size-3" />
            ) : editedTrip.visibility === "shared" ? (
              <Users className="mr-1 size-3" />
            ) : (
              <Globe className="mr-1 size-3" />
            )}
            {editedTrip.visibility.charAt(0).toUpperCase() +
              editedTrip.visibility.slice(1)}
          </Badge>
        </motion.div>
      </div>

      {/* Race Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-muted-foreground flex flex-wrap items-center gap-6"
      >
        <div className="flex items-center gap-2">
          <Calendar className="text-primary size-5" />
          <span>
            {race.date ? format(new Date(race.date), "MMM d, yyyy") : "TBD"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="text-primary size-5" />
          <span>
            {race.circuit?.location}, {race.country}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Timer className="text-primary size-5" />
          <span>Race Day</span>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="info" className="gap-2">
            <Info className="size-4" />
            Trip Info
          </TabsTrigger>
          <TabsTrigger value="flights" className="gap-2">
            <Plane className="size-4" />
            Flights
          </TabsTrigger>
          <TabsTrigger value="accommodation" className="gap-2">
            <Hotel className="size-4" />
            Accommodation
          </TabsTrigger>
          <TabsTrigger value="transport" className="gap-2">
            <Car className="size-4" />
            Transport
          </TabsTrigger>
          <TabsTrigger value="packing" className="gap-2">
            <List className="size-4" />
            Packing
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Globe className="size-4" />
            AI Assistant
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="group transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="text-primary size-5" />
                  Trip Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p>{trip.description}</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 font-medium">
                      <Calendar className="text-primary size-4" />
                      Race Weekend Schedule
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Weekend Start:
                        </span>
                        <span>
                          {race.weekend_start
                            ? format(
                                new Date(race.weekend_start),
                                "MMM d, yyyy"
                              )
                            : "TBD"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Practice & Qualifying:
                        </span>
                        <span>
                          {race.weekend_start && race.date
                            ? format(new Date(race.weekend_start), "MMM d") +
                              " - " +
                              format(new Date(race.date), "MMM d, yyyy")
                            : "TBD"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Race Day:</span>
                        <span className="text-primary font-medium">
                          {race.date
                            ? format(new Date(race.date), "MMM d, yyyy")
                            : "TBD"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 font-medium">
                      <MapPin className="text-primary size-4" />
                      Circuit Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Circuit:</span>
                        <span>{race.circuit?.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Location:</span>
                        <span>{race.circuit?.location}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Country:</span>
                        <span>{race.country}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="flights" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Flight Details</CardTitle>
              {trip.userId === userId && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() =>
                    setEditingSection(
                      editingSection === "flights" ? null : "flights"
                    )
                  }
                >
                  {editingSection === "flights" ? (
                    <>
                      <X className="size-4" />
                      Cancel Edit
                    </>
                  ) : (
                    <>
                      <Edit className="size-4" />
                      Edit Flights
                    </>
                  )}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editingSection === "flights" ? (
                <div className="space-y-8">
                  {/* Outbound Flight */}
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 font-medium">
                      <span className="bg-primary size-2 rounded-full" />
                      Outbound Flight
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Departure</Label>
                        <Input
                          placeholder="e.g. LHR 10:00 AM"
                          value={editedTrip.flights?.outbound?.departure ?? ""}
                          onChange={e =>
                            setEditedTrip(prev => ({
                              ...prev,
                              flights: {
                                ...prev.flights,
                                outbound: {
                                  ...prev.flights?.outbound,
                                  departure: e.target.value
                                }
                              } as Flights
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Arrival</Label>
                        <Input
                          placeholder="e.g. CDG 1:00 PM"
                          value={editedTrip.flights?.outbound?.arrival ?? ""}
                          onChange={e =>
                            setEditedTrip(prev => ({
                              ...prev,
                              flights: {
                                ...prev.flights,
                                outbound: {
                                  ...prev.flights?.outbound,
                                  arrival: e.target.value
                                }
                              } as Flights
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Booking Reference</Label>
                        <Input
                          placeholder="e.g. ABC123"
                          value={
                            editedTrip.flights?.outbound?.bookingReference ?? ""
                          }
                          onChange={e =>
                            setEditedTrip(prev => ({
                              ...prev,
                              flights: {
                                ...prev.flights,
                                outbound: {
                                  ...prev.flights?.outbound,
                                  bookingReference: e.target.value
                                }
                              } as Flights
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Baggage Allowance</Label>
                        <Input
                          placeholder="e.g. 23kg checked, 7kg cabin"
                          value={
                            editedTrip.flights?.outbound?.baggageAllowance ?? ""
                          }
                          onChange={e =>
                            setEditedTrip(prev => ({
                              ...prev,
                              flights: {
                                ...prev.flights,
                                outbound: {
                                  ...prev.flights?.outbound,
                                  baggageAllowance: e.target.value
                                }
                              } as Flights
                            }))
                          }
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>Layovers</Label>
                        <Input
                          placeholder="e.g. AMS 2h layover"
                          value={
                            editedTrip.flights?.outbound?.layovers?.join(
                              ", "
                            ) ?? ""
                          }
                          onChange={e =>
                            setEditedTrip(prev => ({
                              ...prev,
                              flights: {
                                ...prev.flights,
                                outbound: {
                                  ...prev.flights?.outbound,
                                  layovers: e.target.value
                                    .split(",")
                                    .map(s => s.trim())
                                    .filter(Boolean)
                                }
                              } as Flights
                            }))
                          }
                        />
                        <p className="text-muted-foreground text-xs">
                          Separate multiple layovers with commas
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Return Flight */}
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 font-medium">
                      <span className="bg-primary size-2 rounded-full" />
                      Return Flight
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Departure</Label>
                        <Input
                          placeholder="e.g. CDG 2:00 PM"
                          value={editedTrip.flights?.return?.departure ?? ""}
                          onChange={e =>
                            setEditedTrip(prev => ({
                              ...prev,
                              flights: {
                                ...prev.flights,
                                return: {
                                  ...prev.flights?.return,
                                  departure: e.target.value
                                }
                              } as Flights
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Arrival</Label>
                        <Input
                          placeholder="e.g. LHR 3:00 PM"
                          value={editedTrip.flights?.return?.arrival ?? ""}
                          onChange={e =>
                            setEditedTrip(prev => ({
                              ...prev,
                              flights: {
                                ...prev.flights,
                                return: {
                                  ...prev.flights?.return,
                                  arrival: e.target.value
                                }
                              } as Flights
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Booking Reference</Label>
                        <Input
                          placeholder="e.g. XYZ789"
                          value={
                            editedTrip.flights?.return?.bookingReference ?? ""
                          }
                          onChange={e =>
                            setEditedTrip(prev => ({
                              ...prev,
                              flights: {
                                ...prev.flights,
                                return: {
                                  ...prev.flights?.return,
                                  bookingReference: e.target.value
                                }
                              } as Flights
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Baggage Allowance</Label>
                        <Input
                          placeholder="e.g. 23kg checked, 7kg cabin"
                          value={
                            editedTrip.flights?.return?.baggageAllowance ?? ""
                          }
                          onChange={e =>
                            setEditedTrip(prev => ({
                              ...prev,
                              flights: {
                                ...prev.flights,
                                return: {
                                  ...prev.flights?.return,
                                  baggageAllowance: e.target.value
                                }
                              } as Flights
                            }))
                          }
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>Layovers</Label>
                        <Input
                          placeholder="e.g. FRA 1h layover"
                          value={
                            editedTrip.flights?.return?.layovers?.join(", ") ??
                            ""
                          }
                          onChange={e =>
                            setEditedTrip(prev => ({
                              ...prev,
                              flights: {
                                ...prev.flights,
                                return: {
                                  ...prev.flights?.return,
                                  layovers: e.target.value
                                    .split(",")
                                    .map(s => s.trim())
                                    .filter(Boolean)
                                }
                              } as Flights
                            }))
                          }
                        />
                        <p className="text-muted-foreground text-xs">
                          Separate multiple layovers with commas
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {trip.flights?.outbound && (
                    <div className="space-y-4">
                      <h3 className="flex items-center gap-2 font-medium">
                        <span className="bg-primary size-2 rounded-full" />
                        Outbound Flight
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Departure</div>
                          <div className="text-muted-foreground">
                            {trip.flights.outbound.departure}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Arrival</div>
                          <div className="text-muted-foreground">
                            {trip.flights.outbound.arrival}
                          </div>
                        </div>
                        {trip.flights.outbound.layovers.length > 0 && (
                          <div className="col-span-2 space-y-1">
                            <div className="text-sm font-medium">Layovers</div>
                            <div className="text-muted-foreground">
                              {trip.flights.outbound.layovers.join(", ")}
                            </div>
                          </div>
                        )}
                        {trip.flights.outbound.bookingReference && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              Booking Reference
                            </div>
                            <div className="text-muted-foreground">
                              {trip.flights.outbound.bookingReference}
                            </div>
                          </div>
                        )}
                        {trip.flights.outbound.baggageAllowance && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              Baggage Allowance
                            </div>
                            <div className="text-muted-foreground">
                              {trip.flights.outbound.baggageAllowance}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {trip.flights?.return && (
                    <div className="space-y-4">
                      <h3 className="flex items-center gap-2 font-medium">
                        <span className="bg-primary size-2 rounded-full" />
                        Return Flight
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Departure</div>
                          <div className="text-muted-foreground">
                            {trip.flights.return.departure}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Arrival</div>
                          <div className="text-muted-foreground">
                            {trip.flights.return.arrival}
                          </div>
                        </div>
                        {trip.flights.return.layovers.length > 0 && (
                          <div className="col-span-2 space-y-1">
                            <div className="text-sm font-medium">Layovers</div>
                            <div className="text-muted-foreground">
                              {trip.flights.return.layovers.join(", ")}
                            </div>
                          </div>
                        )}
                        {trip.flights.return.bookingReference && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              Booking Reference
                            </div>
                            <div className="text-muted-foreground">
                              {trip.flights.return.bookingReference}
                            </div>
                          </div>
                        )}
                        {trip.flights.return.baggageAllowance && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              Baggage Allowance
                            </div>
                            <div className="text-muted-foreground">
                              {trip.flights.return.baggageAllowance}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!trip.flights?.outbound && !trip.flights?.return && (
                    <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
                      <Plane className="mb-4 size-12 opacity-50" />
                      <p>No flight details added yet.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accommodation" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Accommodation Details</CardTitle>
              {trip.userId === userId && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() =>
                    setEditingSection(
                      editingSection === "accommodation"
                        ? null
                        : "accommodation"
                    )
                  }
                >
                  {editingSection === "accommodation" ? (
                    <>
                      <X className="size-4" />
                      Cancel Edit
                    </>
                  ) : (
                    <>
                      <Edit className="size-4" />
                      Edit Accommodation
                    </>
                  )}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editingSection === "accommodation" ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Hotel Name</Label>
                      <Input
                        placeholder="e.g. Hilton Garden Inn"
                        value={editedTrip.accommodation?.name ?? ""}
                        onChange={e =>
                          setEditedTrip(prev => ({
                            ...prev,
                            accommodation: {
                              ...prev.accommodation,
                              name: e.target.value
                            } as Accommodation
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        placeholder="e.g. 123 Main Street"
                        value={editedTrip.accommodation?.location ?? ""}
                        onChange={e =>
                          setEditedTrip(prev => ({
                            ...prev,
                            accommodation: {
                              ...prev.accommodation,
                              location: e.target.value
                            } as Accommodation
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Room Type</Label>
                      <Input
                        placeholder="e.g. Double Room"
                        value={editedTrip.accommodation?.roomType ?? ""}
                        onChange={e =>
                          setEditedTrip(prev => ({
                            ...prev,
                            accommodation: {
                              ...prev.accommodation,
                              roomType: e.target.value
                            } as Accommodation
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Check-in</Label>
                      <Input
                        placeholder="e.g. 2024-03-15 15:00"
                        value={editedTrip.accommodation?.checkIn ?? ""}
                        onChange={e =>
                          setEditedTrip(prev => ({
                            ...prev,
                            accommodation: {
                              ...prev.accommodation,
                              checkIn: e.target.value
                            } as Accommodation
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Check-out</Label>
                      <Input
                        placeholder="e.g. 2024-03-18 11:00"
                        value={editedTrip.accommodation?.checkOut ?? ""}
                        onChange={e =>
                          setEditedTrip(prev => ({
                            ...prev,
                            accommodation: {
                              ...prev.accommodation,
                              checkOut: e.target.value
                            } as Accommodation
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Booking Reference</Label>
                      <Input
                        placeholder="e.g. HGI123456"
                        value={editedTrip.accommodation?.bookingReference ?? ""}
                        onChange={e =>
                          setEditedTrip(prev => ({
                            ...prev,
                            accommodation: {
                              ...prev.accommodation,
                              bookingReference: e.target.value
                            } as Accommodation
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmation Code</Label>
                      <Input
                        placeholder="e.g. CONF123"
                        value={editedTrip.accommodation?.confirmationCode ?? ""}
                        onChange={e =>
                          setEditedTrip(prev => ({
                            ...prev,
                            accommodation: {
                              ...prev.accommodation,
                              confirmationCode: e.target.value
                            } as Accommodation
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {trip.accommodation &&
                  Object.values(trip.accommodation).some(
                    value => value !== null
                  ) ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {trip.accommodation.name && (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Name</div>
                          <div className="text-muted-foreground">
                            {trip.accommodation.name}
                          </div>
                        </div>
                      )}
                      {trip.accommodation.location && (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Location</div>
                          <div className="text-muted-foreground">
                            {trip.accommodation.location}
                          </div>
                        </div>
                      )}
                      {trip.accommodation.roomType && (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Room Type</div>
                          <div className="text-muted-foreground">
                            {trip.accommodation.roomType}
                          </div>
                        </div>
                      )}
                      {trip.accommodation.checkIn && (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Check-in</div>
                          <div className="text-muted-foreground">
                            {trip.accommodation.checkIn}
                          </div>
                        </div>
                      )}
                      {trip.accommodation.checkOut && (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Check-out</div>
                          <div className="text-muted-foreground">
                            {trip.accommodation.checkOut}
                          </div>
                        </div>
                      )}
                      {trip.accommodation.bookingReference && (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            Booking Reference
                          </div>
                          <div className="text-muted-foreground">
                            {trip.accommodation.bookingReference}
                          </div>
                        </div>
                      )}
                      {trip.accommodation.confirmationCode && (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            Confirmation Code
                          </div>
                          <div className="text-muted-foreground">
                            {trip.accommodation.confirmationCode}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
                      <Hotel className="mb-4 size-12 opacity-50" />
                      <p>No accommodation details added yet.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transport" className="space-y-6">
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
                    <Label>Transportation Notes</Label>
                    <Textarea
                      placeholder="Enter details about local transportation, rental cars, or other transport arrangements..."
                      value={editedTrip.transportationNotes || ""}
                      onChange={e =>
                        setEditedTrip(prev => ({
                          ...prev,
                          transportationNotes: e.target.value
                        }))
                      }
                      className="min-h-[200px]"
                    />
                    <p className="text-muted-foreground text-xs">
                      Include information about getting to and from the circuit,
                      local transport options, parking details, etc.
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
        </TabsContent>

        <TabsContent value="packing" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Packing List</CardTitle>
              {trip.userId === userId && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() =>
                    setEditingSection(
                      editingSection === "packing" ? null : "packing"
                    )
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
                        onClick={() => {
                          if (!editedTrip.packingList.includes(item)) {
                            handlePackingListUpdate([
                              ...editedTrip.packingList,
                              item
                            ])
                          }
                        }}
                      >
                        <Plus className="mr-2 size-4" />
                        {item}
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {editedTrip.packingList.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span>{item}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newList = [...editedTrip.packingList]
                            newList.splice(index, 1)
                            handlePackingListUpdate(newList)
                          }}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom item"
                      onKeyPress={e => {
                        if (e.key === "Enter") {
                          const input = e.target as HTMLInputElement
                          if (input.value.trim()) {
                            handlePackingListUpdate([
                              ...editedTrip.packingList,
                              input.value.trim()
                            ])
                            input.value = ""
                          }
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const input = document.querySelector(
                          'input[placeholder="Add custom item"]'
                        ) as HTMLInputElement
                        if (input.value.trim()) {
                          handlePackingListUpdate([
                            ...editedTrip.packingList,
                            input.value.trim()
                          ])
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
                  <List className="mb-4 size-12 opacity-50" />
                  <p>No packing list items added yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
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
                    <Label>AI Assistant</Label>
                    <Textarea
                      placeholder="Enter AI assistant notes"
                      value={editedTrip.customNotes?.aiAssistant || ""}
                      onChange={e =>
                        setEditedTrip(prev => ({
                          ...prev,
                          customNotes: {
                            ...prev.customNotes,
                            aiAssistant: e.target.value
                          }
                        }))
                      }
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
                  onAddActivity={handleAddActivity}
                />
              )}
            </CardContent>
          </Card>
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
