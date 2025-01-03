"use client"

import { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Bell } from "lucide-react"
import { createWaitlistEntryAction } from "@/actions/db/waitlist-actions"
import { useAuth } from "@clerk/nextjs"

interface WaitlistFormProps {
  /** The race ID */
  raceId: string
  /** The ticket category ID */
  ticketCategoryId: string
  /** The ticket category name */
  ticketCategoryName: string
  /** Whether the button should be disabled */
  disabled?: boolean
}

export function WaitlistForm({
  raceId,
  ticketCategoryId,
  ticketCategoryName,
  disabled
}: WaitlistFormProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [notificationChannel, setNotificationChannel] = useState("email")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { userId } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to join the waitlist",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createWaitlistEntryAction({
        userId,
        raceId,
        ticketCategoryId,
        email,
        phone: notificationChannel !== "email" ? phone : null,
        notificationChannel,
        status: "pending"
      })

      if (result.isSuccess) {
        toast({
          title: "Added to waitlist",
          description: `We'll notify you when ${ticketCategoryName} tickets become available.`
        })
        setOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled} className="w-full">
          <Bell className="mr-2 size-4" />
          Join Waitlist
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Waitlist</DialogTitle>
          <DialogDescription>
            Get notified when {ticketCategoryName} tickets become available.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notification-type">Notification Channel</Label>
            <Select
              value={notificationChannel}
              onValueChange={setNotificationChannel}
            >
              <SelectTrigger id="notification-type">
                <SelectValue placeholder="Select notification channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email Only</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="both">Email & SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {notificationChannel !== "email" && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Joining..." : "Join Waitlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
