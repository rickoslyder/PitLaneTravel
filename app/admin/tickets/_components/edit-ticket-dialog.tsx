"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import {
  updateTicketAction,
  getTicketPricingHistoryAction,
  updateTicketPricingAction
} from "@/actions/db/tickets-actions"
import { SelectTicket, SelectTicketPricing } from "@/db/schema"
import { useAuth } from "@clerk/nextjs"
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from "@/config/currencies"
import { Loader2, Check, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { generateTicketDescriptionAction } from "@/actions/db/ai-actions"

const formSchema = z.object({
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

interface EditTicketDialogProps {
  children: React.ReactNode
  ticket: SelectTicket & {
    pricing?: SelectTicketPricing
    race: {
      id: string
      name: string
      season: number
    }
  }
}

export function EditTicketDialog({ children, ticket }: EditTicketDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [pricingHistory, setPricingHistory] = useState<SelectTicketPricing[]>(
    []
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateResult, setGenerateResult] = useState<
    "success" | "error" | null
  >(null)
  const { userId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!open) {
      setGenerateResult(null)
    }
  }, [open])

  useEffect(() => {
    if (generateResult) {
      const timeout = setTimeout(() => {
        setGenerateResult(null)
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [generateResult])

  useEffect(() => {
    async function fetchPricingHistory() {
      if (!open) return
      const result = await getTicketPricingHistoryAction(ticket.id)
      if (result.isSuccess) {
        setPricingHistory(result.data)
      }
    }
    fetchPricingHistory()
  }, [open, ticket.id])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: ticket.title,
      description: ticket.description,
      ticketType: ticket.ticketType,
      seatingDetails: ticket.seatingDetails || "",
      availability: ticket.availability,
      daysIncluded: ticket.daysIncluded as Record<string, boolean>,
      isChildTicket: ticket.isChildTicket,
      resellerUrl: ticket.resellerUrl,
      price: ticket.pricing ? Number(ticket.pricing.price) : 0,
      currency: ticket.pricing?.currency || DEFAULT_CURRENCY.code
    }
  })

  async function onSubmit(values: FormData) {
    if (!userId) {
      toast.error("Authentication Error", {
        description: "You must be logged in to edit tickets"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { price, currency, ...ticketData } = values
      const result = await updateTicketAction(ticket.id, {
        ...ticketData,
        updatedBy: userId
      })

      if (result.isSuccess) {
        // Update pricing if changed
        const currentPrice = ticket.pricing
          ? parseFloat(ticket.pricing.price)
          : 0
        const currentCurrency =
          ticket.pricing?.currency || DEFAULT_CURRENCY.code

        if (price !== currentPrice || currency !== currentCurrency) {
          const pricingResult = await updateTicketPricingAction(ticket.id, {
            price: Number(price.toFixed(2)),
            currency,
            validFrom: new Date()
          })

          if (!pricingResult.isSuccess) {
            toast.error("Error", {
              description: "Failed to update ticket pricing"
            })
            return
          }
        }

        toast.success("Success", {
          description: "Ticket updated successfully"
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
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Ticket</DialogTitle>
          <DialogDescription>
            Make changes to the ticket. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                  <div className="flex items-center justify-between">
                    <FormLabel>Description</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="relative h-7 min-w-24"
                      disabled={isGenerating}
                      onClick={async () => {
                        try {
                          setIsGenerating(true)
                          setGenerateResult(null)
                          const result = await generateTicketDescriptionAction(
                            ticket.title,
                            ticket.race.name,
                            field.value
                          )
                          if (result.isSuccess) {
                            field.onChange(result.data)
                            setGenerateResult("success")
                            toast.success("Description generated successfully")
                          } else {
                            setGenerateResult("error")
                            toast.error("Failed to generate description")
                          }
                        } catch (error) {
                          setGenerateResult("error")
                          toast.error("Error generating description")
                        } finally {
                          setIsGenerating(false)
                        }
                      }}
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="size-3 animate-spin" />
                          <span>Generating...</span>
                        </div>
                      ) : generateResult === "success" ? (
                        <div className="flex items-center gap-2">
                          <Check className="size-3 text-green-500" />
                          <span>Generated</span>
                        </div>
                      ) : generateResult === "error" ? (
                        <div className="flex items-center gap-2">
                          <X className="size-3 text-red-500" />
                          <span>Failed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>Generate New</span>
                        </div>
                      )}
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea {...field} />
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
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUPPORTED_CURRENCIES.map(currency => (
                          <SelectItem key={currency.code} value={currency.code}>
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

            <DialogFooter>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="hover:bg-primary/90 relative min-w-[120px] transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
