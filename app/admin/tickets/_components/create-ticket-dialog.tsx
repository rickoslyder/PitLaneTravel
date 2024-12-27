"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { toast } from "sonner"
import { createTicketAction } from "@/actions/db/tickets-actions"
import { createAdminActivityAction } from "@/actions/db/admin-activity-actions"
import { useAuth } from "@clerk/nextjs"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  ticket_type: z.string().min(1, "Type is required"),
  availability: z.string().min(1, "Availability is required"),
  race_id: z.string().uuid("Invalid race ID"),
  reseller_url: z.string().url("Must be a valid URL"),
  days_included: z.array(z.string()).min(1, "Must include at least one day"),
  is_child_ticket: z.boolean().default(false),
  price: z.coerce.number().min(0, "Price must be positive"),
  currency: z.string().min(1, "Currency is required")
})

type FormValues = z.infer<typeof formSchema>

interface CreateTicketDialogProps {
  children: React.ReactNode
}

export function CreateTicketDialog({ children }: CreateTicketDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userId } = useAuth()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      ticket_type: "",
      availability: "available",
      reseller_url: "",
      days_included: [],
      is_child_ticket: false
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

  async function onSubmit(values: FormValues) {
    if (!userId) {
      toast.error("You must be logged in to create a ticket")
      return
    }

    try {
      const {
        price,
        currency,
        race_id,
        ticket_type,
        reseller_url,
        days_included,
        is_child_ticket,
        ...rest
      } = values

      const result = await createTicketAction(
        {
          ...rest,
          raceId: race_id,
          ticketType: ticket_type,
          resellerUrl: reseller_url,
          daysIncluded: days_included,
          isChildTicket: is_child_ticket
        },
        {
          price: String(price),
          currency,
          validFrom: new Date()
        }
      )
      if (result.isSuccess) {
        // Log the admin activity
        await createAdminActivityAction({
          type: "ticket",
          description: `Created new ticket package: ${values.title}`,
          userId
        })

        toast.success("Ticket created successfully")
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
          <DialogDescription>
            Add a new ticket for a race. Click save when you're done.
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
                    <Input placeholder="Enter ticket title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ticket_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ticket type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="grandstand">Grandstand</SelectItem>
                      <SelectItem value="general">General Admission</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Create Ticket</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
