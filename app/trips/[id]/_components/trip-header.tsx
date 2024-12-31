"use client"

import { useState } from "react"
import { Trip, TripStatus, TripVisibility } from "@/types/trip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  ChevronRight,
  Edit,
  Globe,
  Lock,
  Save,
  Share2,
  Users,
  X
} from "lucide-react"
import { toast } from "sonner"
import { shareTripAction } from "@/actions/db/trips-actions"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface TripHeaderProps {
  trip: Trip
  userId: string
  isEditing: boolean
  setIsEditing: (value: boolean) => void
  editedTrip: Trip
  setEditedTrip: React.Dispatch<React.SetStateAction<Trip>>
  onSave: () => Promise<void>
  isLoading: boolean
}

export function TripHeader({
  trip,
  userId,
  isEditing,
  setIsEditing,
  editedTrip,
  setEditedTrip,
  onSave,
  isLoading
}: TripHeaderProps) {
  const [shareEmail, setShareEmail] = useState("")
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const result = await shareTripAction(trip.id, userId, shareEmail)
      if (result.isSuccess) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to share trip")
    } finally {
      setIsSharing(false)
    }
  }

  const handleVisibilityChange = (newVisibility: TripVisibility) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        visibility: newVisibility
      })
    )
  }

  const handleStatusChange = (newStatus: TripStatus) => {
    setEditedTrip(
      (prev: Trip): Trip => ({
        ...prev,
        status: newStatus
      })
    )
  }

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
    <>
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
              onClick={onSave}
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
    </>
  )
}
