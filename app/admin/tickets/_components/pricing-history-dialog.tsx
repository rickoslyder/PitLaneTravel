"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
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
import {
  getTicketPricingHistoryAction,
  createTicketPricingAction
} from "@/actions/db/tickets-actions"
import { SelectTicket, SelectTicketPricing } from "@/db/schema"
import { format } from "date-fns"

const formSchema = z.object({
  price: z.coerce.number().min(0, "Price must be positive"),
  currency: z.string().min(1, "Currency is required"),
  validFrom: z.coerce.date()
})

type FormValues = z.infer<typeof formSchema>

interface PricingHistoryDialogProps {
  children: React.ReactNode
  ticket: SelectTicket
}

export function PricingHistoryDialog({
  children,
  ticket
}: PricingHistoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [pricingHistory, setPricingHistory] = useState<SelectTicketPricing[]>(
    []
  )
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: 0,
      currency: "USD",
      validFrom: new Date()
    }
  })

  useEffect(() => {
    if (open) {
      getTicketPricingHistoryAction(ticket.id).then(result => {
        if (result.isSuccess) {
          setPricingHistory(result.data)
        }
      })
    }
  }, [open, ticket.id])

  async function onSubmit(values: FormValues) {
    try {
      const result = await createTicketPricingAction({
        ticketId: ticket.id,
        price: values.price.toString(),
        currency: values.currency,
        validFrom: values.validFrom
      })

      if (result.isSuccess) {
        toast.success("Pricing added successfully")
        // Refresh pricing history
        const historyResult = await getTicketPricingHistoryAction(ticket.id)
        if (historyResult.isSuccess) {
          setPricingHistory(historyResult.data)
        }
        form.reset()
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Pricing History</DialogTitle>
          <DialogDescription>
            View and manage pricing history for {ticket.title}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-md border">
            <div className="p-4">
              <h3 className="font-medium">Add New Price</h3>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-4 space-y-4"
                >
                  <div className="grid grid-cols-3 gap-4">
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
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="validFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valid From</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              value={
                                field.value instanceof Date
                                  ? field.value.toISOString().slice(0, 16)
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit">Add Price</Button>
                </form>
              </Form>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="p-4">
              <h3 className="mb-4 font-medium">Price History</h3>
              <div className="space-y-4">
                {pricingHistory.map((pricing, index) => (
                  <div
                    key={pricing.id}
                    className="bg-muted flex items-center justify-between rounded-lg p-3"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {pricing.currency}{" "}
                        {Number(pricing.price).toLocaleString()}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Valid from:{" "}
                        {format(new Date(pricing.validFrom), "PPP p")}
                        {pricing.validTo && (
                          <>
                            {" "}
                            until {format(new Date(pricing.validTo), "PPP p")}
                          </>
                        )}
                      </p>
                    </div>
                    {index === 0 && (
                      <Badge variant="secondary">Current Price</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
