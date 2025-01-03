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
  FormMessage,
  FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
import { RaceWithCircuitAndSeries } from "@/types/race"
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from "@/config/currencies"
import { Loader2 } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { formatCurrency } from "@/config/currencies"

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
  races: RaceWithCircuitAndSeries[]
}

export function CreateTicketDialog({
  children,
  races
}: CreateTicketDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [formData, setFormData] = useState<FormValues | null>(null)
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
      race_id: "",
      reseller_url: "",
      days_included: ["thursday", "friday", "saturday", "sunday"],
      is_child_ticket: false,
      price: 0,
      currency: DEFAULT_CURRENCY.code
    }
  })

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setOpen(true)
      // Check for duplicate data
      const duplicateData = searchParams.get("duplicate")
      if (duplicateData) {
        try {
          const data = JSON.parse(duplicateData) as Partial<FormValues>
          Object.keys(data).forEach(key => {
            const value = data[key as keyof FormValues]
            if (value !== undefined) {
              form.setValue(key as keyof FormValues, value as any)
            }
          })
          toast.info("Ticket data pre-filled from duplicate")
        } catch (error) {
          console.error("Error parsing duplicate data:", error)
          toast.error("Failed to load duplicate ticket data")
        }
      }
      // Remove the params from URL without triggering a reload
      const url = new URL(window.location.href)
      url.searchParams.delete("action")
      url.searchParams.delete("duplicate")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams, form])

  async function onSubmit(values: FormValues) {
    if (!userId) {
      toast.error("Authentication Error", {
        description: "You must be logged in to create a ticket"
      })
      return
    }

    if (!values.race_id) {
      toast.error("Validation Error", {
        description: "Please select a race for this ticket"
      })
      return
    }

    // Store form data and show confirmation dialog
    setFormData(values)
    setShowConfirm(true)
  }

  async function handleConfirm() {
    if (!formData) return

    setIsSubmitting(true)
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
      } = formData

      // Validate days included
      if (days_included.length === 0) {
        toast.error("Validation Error", {
          description: "Please select at least one day for this ticket"
        })
        return
      }

      const result = await createTicketAction(
        {
          ...rest,
          raceId: race_id,
          ticketType: ticket_type,
          resellerUrl: reseller_url,
          daysIncluded: days_included.reduce(
            (acc, day) => ({ ...acc, [day]: true }),
            { thursday: false, friday: false, saturday: false, sunday: false }
          ),
          isChildTicket: is_child_ticket
        },
        {
          price: String(price),
          currency,
          validFrom: new Date()
        }
      )
      if (result.isSuccess) {
        try {
          // Log the admin activity
          if (userId) {
            await createAdminActivityAction({
              type: "ticket",
              description: `Created new ticket: ${formData.title}`,
              userId
            })
          }
        } catch (error) {
          console.error("Failed to log admin activity:", error)
          // Don't show this error to the user as the ticket was still created successfully
        }

        toast.success("Ticket created successfully", {
          description: `Created ${formData.title} for ${formatCurrency(formData.price, formData.currency)}`
        })
        setOpen(false)
        setShowConfirm(false)
        router.refresh()
      } else {
        const errorMessage = result.message || "An unexpected error occurred"
        toast.error("Failed to create ticket", {
          description: errorMessage.includes("duplicate key")
            ? "A ticket with this title already exists"
            : errorMessage
        })
      }
    } catch (error) {
      console.error("Error creating ticket:", error)
      let errorMessage = "An unexpected error occurred"

      if (error instanceof Error) {
        if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection"
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timed out. Please try again"
        } else {
          errorMessage = error.message
        }
      }

      toast.error("Failed to create ticket", {
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
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
                name="race_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Race</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a race" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {races.map(race => (
                          <SelectItem key={race.id} value={race.id}>
                            {race.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter ticket description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="general">
                            General Admission
                          </SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="limited">Limited</SelectItem>
                          <SelectItem value="sold_out">Sold Out</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reseller_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reseller URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/ticket"
                        type="url"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The URL where customers can purchase this ticket
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || DEFAULT_CURRENCY.code}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SUPPORTED_CURRENCIES.map(currency => (
                            <SelectItem
                              key={currency.code}
                              value={currency.code}
                            >
                              {currency.name} ({currency.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="days_included"
                render={() => (
                  <FormItem>
                    <FormLabel>Days Included</FormLabel>
                    <div className="flex gap-4">
                      {["thursday", "friday", "saturday", "sunday"].map(day => (
                        <FormField
                          key={day}
                          control={form.control}
                          name="days_included"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={day}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day)}
                                    onCheckedChange={checked => {
                                      return checked
                                        ? field.onChange([...field.value, day])
                                        : field.onChange(
                                            field.value?.filter(
                                              value => value !== day
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal capitalize">
                                  {day}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_child_ticket"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Child Ticket</FormLabel>
                      <FormDescription>
                        Is this ticket for children?
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="hover:bg-primary/90 relative min-w-[120px] transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Ticket</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Create Ticket"
        description={
          formData
            ? `Are you sure you want to create a ${formData.title} ticket for ${formatCurrency(formData.price, formData.currency)}?`
            : "Are you sure you want to create this ticket?"
        }
        onConfirm={handleConfirm}
        isLoading={isSubmitting}
        confirmText="Create Ticket"
      />
    </>
  )
}
