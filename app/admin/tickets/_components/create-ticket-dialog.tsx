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
import { Label } from "@/components/ui/label"

const formSchema = z.object({
  raceId: z.string().min(1, "Race is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  ticketType: z.enum(["general_admission", "grandstand", "vip"], {
    required_error: "Ticket type is required"
  }),
  seatingDetails: z.string().optional(),
  availability: z.string().min(1, "Availability is required"),
  daysIncluded: z.record(z.boolean()),
  isChildTicket: z.boolean().default(false),
  resellerUrl: z.string().min(1, "Reseller URL is required"),
  price: z.coerce.number().min(0, "Price must be greater than 0"),
  currency: z.string().min(1, "Currency is required")
})

type FormData = z.infer<typeof formSchema>

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
  const [formData, setFormData] = useState<FormData | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userId } = useAuth()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      ticketType: "general_admission" as const,
      seatingDetails: "",
      availability: "available",
      raceId: "",
      resellerUrl: "",
      daysIncluded: { friday: false, saturday: false, sunday: false },
      isChildTicket: false,
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
          const data = JSON.parse(duplicateData) as Partial<FormData>
          Object.keys(data).forEach(key => {
            const value = data[key as keyof FormData]
            if (value !== undefined) {
              if (key === "daysIncluded") {
                // Handle days included separately since it's a record
                const daysRecord = value as Record<string, boolean>
                Object.entries(daysRecord).forEach(([day, included]) => {
                  form.setValue(`daysIncluded.${day}`, included)
                })
              } else {
                form.setValue(key as keyof FormData, value as any)
              }
            }
          })
          toast.info("Ticket data pre-filled from duplicate")
        } catch (error) {
          console.error("Failed to parse duplicate data:", error)
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

  async function onSubmit(values: FormData) {
    if (!userId) {
      toast.error("Authentication Error", {
        description: "You must be logged in to create tickets"
      })
      return
    }

    setIsSubmitting(true)
    setFormData(values)

    try {
      const { price, currency, ...ticketData } = values
      const result = await createTicketAction(
        {
          ...ticketData,
          updatedBy: userId
        },
        {
          price: price.toFixed(2),
          currency,
          validFrom: new Date()
        }
      )

      if (result.isSuccess) {
        toast.success("Success", {
          description: "Ticket created successfully"
        })
        router.refresh()
        setOpen(false)
      } else {
        toast.error("Error", {
          description: result.message
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "Something went wrong"
      })
    } finally {
      setIsSubmitting(false)
      setFormData(null)
    }
  }

  async function handleConfirm() {
    if (!formData) return

    setIsSubmitting(true)
    try {
      const {
        price,
        currency,
        raceId,
        ticketType,
        resellerUrl,
        daysIncluded,
        isChildTicket,
        ...rest
      } = formData

      // Validate days included
      if (Object.values(daysIncluded).every(Boolean)) {
        toast.error("Validation Error", {
          description: "Please select at least one day for this ticket"
        })
        return
      }

      const result = await createTicketAction(
        {
          ...rest,
          raceId,
          ticketType,
          resellerUrl,
          daysIncluded,
          isChildTicket
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="raceId"
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
                  name="ticketType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticket Type</FormLabel>
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
                          <SelectItem value="general_admission">
                            General Admission
                          </SelectItem>
                          <SelectItem value="grandstand">Grandstand</SelectItem>
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
                name="resellerUrl"
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
                name="daysIncluded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days Included</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        {["friday", "saturday", "sunday"].map(day => (
                          <div key={day} className="flex items-center gap-2">
                            <Checkbox
                              checked={field.value[day] || false}
                              onCheckedChange={checked => {
                                const newValue = { ...field.value }
                                newValue[day] = checked === true
                                field.onChange(newValue)
                              }}
                            />
                            <Label className="capitalize">{day}</Label>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isChildTicket"
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
                        Is this ticket specifically for children?
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seatingDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seating Details</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Gold 2 VIP Lounge" />
                    </FormControl>
                    <FormDescription>
                      Optional details about specific seating location
                    </FormDescription>
                    <FormMessage />
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
