"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createMeetupAction } from "@/actions/db/meetups-actions"
import { createAdminActivityAction } from "@/actions/db/admin-activity-actions"
import { RaceSelect } from "@/components/utilities/race-select"
import { useAuth } from "@clerk/nextjs"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  date: z.string().min(1, "Date is required"),
  maxAttendees: z.coerce.number().min(1, "Max attendees must be at least 1"),
  raceId: z.string().min(1, "Race is required")
})

type FormValues = z.infer<typeof formSchema>

interface CreateMeetupDialogProps {
  children: React.ReactNode
}

export function CreateMeetupDialog({ children }: CreateMeetupDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userId } = useAuth()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      date: "",
      maxAttendees: 10,
      raceId: ""
    }
  })

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setOpen(true)
      // Remove the action param from URL without triggering a reload
      const url = new URL(window.location.href)
      url.searchParams.delete("action")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams])

  async function onSubmit(data: FormValues) {
    if (!userId) {
      toast.error("You must be logged in to create a meetup")
      return
    }

    const result = await createMeetupAction({
      ...data,
      userId,
      date: new Date(data.date),
      attendees: []
    })

    if (result.isSuccess) {
      // Log the admin activity
      await createAdminActivityAction({
        type: "meetup",
        description: `Created new meetup: ${data.title}`,
        userId
      })

      toast.success(result.message)
      setOpen(false)
      form.reset()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Meetup</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Meetup</DialogTitle>
          <DialogDescription>
            Create a new meetup for a race weekend
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxAttendees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Attendees</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="raceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Race</FormLabel>
                  <FormControl>
                    <RaceSelect
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
