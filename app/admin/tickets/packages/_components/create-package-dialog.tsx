"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { toast } from "sonner"
import { createTicketPackageAction } from "@/actions/db/ticket-packages-actions"
import { getRaceTicketsAction } from "@/actions/db/tickets-actions"
import { useAuth } from "@clerk/nextjs"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Plus, X, HelpCircle, AlertCircle } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { formatPrice } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { packageTypeEnum } from "@/db/schema/ticket-packages-schema"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  raceId: z.string().uuid("Invalid race ID"),
  packageType: z.enum(packageTypeEnum.enumValues),
  basePrice: z.coerce.number().min(0, "Base price must be positive"),
  currency: z.string().min(1, "Currency is required"),
  maxQuantity: z.coerce.number().min(1, "Maximum quantity must be at least 1"),
  validFrom: z.date(),
  validTo: z.date().optional(),
  termsAndConditions: z.string().min(1, "Terms and conditions are required"),
  isFeatured: z.boolean().default(false),
  tickets: z.array(
    z.object({
      ticketId: z.coerce.number().min(1, "Ticket is required"),
      quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
      discountPercentage: z.coerce.number().min(0).max(100).optional()
    })
  )
})

type FormValues = z.infer<typeof formSchema>

interface CreatePackageDialogProps {
  children: React.ReactNode
  raceId?: string
}

const PACKAGE_TYPE_DESCRIPTIONS = {
  weekend: "Access to all weekend events and activities",
  vip: "Premium experience with exclusive access and amenities",
  hospitality: "Luxury accommodations and premium services",
  custom: "Customized package with selected features"
}

const CURRENCY_OPTIONS = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "GBP", label: "British Pound", symbol: "£" },
  { value: "AUD", label: "Australian Dollar", symbol: "A$" },
  { value: "CAD", label: "Canadian Dollar", symbol: "C$" },
  { value: "JPY", label: "Japanese Yen", symbol: "¥" },
  { value: "CHF", label: "Swiss Franc", symbol: "CHF" },
  { value: "CNY", label: "Chinese Yuan", symbol: "¥" }
]

export function CreatePackageDialog({
  children,
  raceId
}: CreatePackageDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableTickets, setAvailableTickets] = useState<any[]>([])
  const router = useRouter()
  const { userId } = useAuth()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      raceId: raceId || "",
      packageType: "weekend",
      basePrice: 0,
      currency: "USD",
      maxQuantity: 100,
      validFrom: new Date(),
      termsAndConditions: "",
      isFeatured: false,
      tickets: []
    }
  })

  useEffect(() => {
    if (raceId) {
      form.setValue("raceId", raceId)
      loadTickets()
    }
  }, [form, raceId])

  const loadTickets = async () => {
    if (!raceId) return
    const result = await getRaceTicketsAction(raceId)
    if (result.isSuccess) {
      setAvailableTickets(result.data)
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true)
      const { isSuccess, message } = await createTicketPackageAction(
        {
          name: values.name,
          description: values.description,
          raceId: raceId!,
          packageType: values.packageType,
          basePrice: values.basePrice.toString(),
          currency: values.currency,
          maxQuantity: values.maxQuantity.toString(),
          validFrom: values.validFrom,
          validTo: values.validTo,
          termsAndConditions: values.termsAndConditions,
          isFeatured: values.isFeatured,
          updatedBy: userId
        },
        values.tickets.map(t => ({
          ticketId: t.ticketId,
          quantity: t.quantity,
          discountPercentage: t.discountPercentage?.toString()
        }))
      )

      if (isSuccess) {
        toast.success(message)
        router.refresh()
        setOpen(false)
      }
    } catch (error) {
      console.error("Error creating package:", error)
      toast.error("Failed to create package")
    } finally {
      setIsSubmitting(false)
    }
  }

  function calculateTotalPrice(
    basePrice: number,
    tickets: {
      ticketId: number
      quantity: number
      discountPercentage?: number
    }[]
  ) {
    let total = basePrice

    for (const ticket of tickets) {
      const ticketPrice =
        availableTickets.find(t => t.id === ticket.ticketId)?.currentPrice
          ?.price || 0
      const discountMultiplier = ticket.discountPercentage
        ? (100 - ticket.discountPercentage) / 100
        : 1
      total += ticketPrice * ticket.quantity * discountMultiplier
    }

    return total
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Package</DialogTitle>
          <DialogDescription>
            Create a new ticket package for this race
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter package name" {...field} />
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
                      placeholder="Enter package description"
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
                name="packageType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weekend">Weekend Package</SelectItem>
                        <SelectItem value="vip">VIP Experience</SelectItem>
                        <SelectItem value="hospitality">
                          Hospitality Package
                        </SelectItem>
                        <SelectItem value="custom">Custom Package</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Maximum number of packages available
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Additional cost on top of ticket prices
                    </FormDescription>
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
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Included Tickets</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (availableTickets.length > 0) {
                      form.setValue("tickets", [
                        ...form.getValues("tickets"),
                        {
                          ticketId: availableTickets[0].id,
                          quantity: 1,
                          discountPercentage: 0
                        }
                      ])
                    }
                  }}
                >
                  <Plus className="mr-2 size-4" />
                  Add Ticket
                </Button>
              </div>

              <div className="space-y-4">
                {form.watch("tickets").map((_, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-end gap-4">
                      <FormField
                        control={form.control}
                        name={`tickets.${index}.ticketId`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Ticket</FormLabel>
                            <Select
                              onValueChange={value =>
                                field.onChange(Number(value))
                              }
                              value={String(field.value)}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a ticket" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableTickets.map(ticket => (
                                  <SelectItem
                                    key={ticket.id}
                                    value={String(ticket.id)}
                                  >
                                    <div className="flex items-center justify-between gap-4">
                                      <span>{ticket.title}</span>
                                      {ticket.currentPrice && (
                                        <Badge variant="secondary">
                                          {ticket.currentPrice.currency}{" "}
                                          {formatPrice(
                                            ticket.currentPrice.price
                                          )}
                                        </Badge>
                                      )}
                                    </div>
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
                        name={`tickets.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`tickets.${index}.discountPercentage`}
                        render={({ field }) => (
                          <FormItem className="w-32">
                            <FormLabel>Discount %</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const tickets = form.getValues("tickets")
                          tickets.splice(index, 1)
                          form.setValue("tickets", tickets)
                        }}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">
                    {form.watch("name") || "Package name"}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {form.watch("description") || "Package description"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Package Type:</span>
                    <Badge variant="outline">{form.watch("packageType")}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Base Price:</span>
                    <span>
                      {form.watch("currency")}{" "}
                      {formatPrice(form.watch("basePrice") || 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Ticket Total:</span>
                    <span>
                      {form.watch("currency")}{" "}
                      {formatPrice(
                        calculateTotalPrice(0, form.watch("tickets"))
                      )}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between font-medium">
                    <span>Total Price:</span>
                    <span>
                      {form.watch("currency")}{" "}
                      {formatPrice(
                        calculateTotalPrice(
                          form.watch("basePrice") || 0,
                          form.watch("tickets")
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <FormField
              control={form.control}
              name="termsAndConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms and Conditions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter package terms and conditions"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured Package</FormLabel>
                    <FormDescription>
                      This package will be highlighted on the race page
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Package"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
