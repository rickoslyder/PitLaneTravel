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
import { SelectTicket } from "@/db/schema"
import { useAuth } from "@clerk/nextjs"
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from "@/config/currencies"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  ticket_type: z.string().min(1, "Type is required"),
  availability: z.string().min(1, "Availability is required"),
  reseller_url: z.string().url("Must be a valid URL"),
  days_included: z.array(z.string()).min(1, "Must include at least one day"),
  is_child_ticket: z.boolean().default(false),
  price: z.coerce.number().min(0, "Price must be positive"),
  currency: z.string().min(1, "Currency is required")
})

type FormValues = z.infer<typeof formSchema>

interface EditTicketDialogProps {
  children: React.ReactNode
  ticket: SelectTicket
}

export function EditTicketDialog({ children, ticket }: EditTicketDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { userId } = useAuth()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: ticket.title,
      description: ticket.description,
      ticket_type: ticket.ticketType,
      availability: ticket.availability,
      reseller_url: ticket.resellerUrl,
      days_included: Array.isArray(ticket.daysIncluded)
        ? ticket.daysIncluded
        : Object.entries(ticket.daysIncluded as Record<string, boolean>)
            .filter(([_, value]) => value)
            .map(([key]) => key),
      is_child_ticket: ticket.isChildTicket,
      price: 0,
      currency: "USD"
    }
  })

  useEffect(() => {
    if (open) {
      getTicketPricingHistoryAction(ticket.id).then(result => {
        if (result.isSuccess && result.data.length > 0) {
          const currentPrice = result.data[0]
          form.setValue("price", parseFloat(currentPrice.price))
          form.setValue("currency", currentPrice.currency)
        }
      })
    }
  }, [open, ticket.id, form])

  async function onSubmit(values: FormValues) {
    if (!userId) {
      toast.error("You must be logged in to update a ticket")
      return
    }

    try {
      const {
        price,
        currency,
        ticket_type,
        reseller_url,
        days_included,
        is_child_ticket,
        ...rest
      } = values

      // Update ticket details
      const result = await updateTicketAction(ticket.id, {
        ...rest,
        ticketType: ticket_type,
        resellerUrl: reseller_url,
        daysIncluded: days_included.reduce(
          (acc, day) => ({ ...acc, [day]: true }),
          { friday: false, saturday: false, sunday: false }
        ),
        isChildTicket: is_child_ticket,
        updatedBy: userId
      })

      // Update ticket pricing if price or currency changed
      const pricingResult = await updateTicketPricingAction(ticket.id, {
        price,
        currency,
        validFrom: new Date()
      })

      if (result.isSuccess && pricingResult.isSuccess) {
        toast.success("Ticket updated successfully")
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.message || pricingResult.message)
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
          <DialogTitle>Edit Ticket</DialogTitle>
          <DialogDescription>
            Make changes to the ticket. Click save when you're done.
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
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
