"use client"

import { useState } from "react"
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
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { SelectTicketPackage } from "@/db/schema"
import {
  getTicketPackageAction,
  updatePackageTicketsAction
} from "@/actions/db/ticket-packages-actions"
import { getRaceTicketsAction } from "@/actions/db/tickets-actions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

const ticketFormSchema = z.object({
  ticketId: z.coerce.number().min(1, "Ticket is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  discountPercentage: z.coerce
    .number()
    .min(0, "Discount must be at least 0")
    .max(100, "Discount cannot exceed 100")
    .optional()
})

const formSchema = z.object({
  tickets: z.array(ticketFormSchema).min(1, "At least one ticket is required")
})

type FormValues = z.infer<typeof formSchema>

interface ManagePackageTicketsDialogProps {
  children: React.ReactNode
  package_: SelectTicketPackage & { race: { name: string } }
}

export function ManagePackageTicketsDialog({
  children,
  package_
}: ManagePackageTicketsDialogProps) {
  const [open, setOpen] = useState(false)
  const [availableTickets, setAvailableTickets] = useState<any[]>([])
  const [currentTickets, setCurrentTickets] = useState<any[]>([])
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tickets: []
    }
  })

  const loadData = async () => {
    const ticketsResult = await getRaceTicketsAction(package_.raceId)
    if (ticketsResult.isSuccess) {
      setAvailableTickets(ticketsResult.data)
    }

    const currentTicketsResult = await getTicketPackageAction(package_.id)
    if (currentTicketsResult.isSuccess) {
      const tickets = currentTicketsResult.data.tickets || []
      setCurrentTickets(tickets)
      form.reset({
        tickets: tickets.map(t => ({
          ticketId: t.id,
          quantity: t.quantity,
          discountPercentage: t.discountPercentage
            ? parseFloat(t.discountPercentage)
            : undefined
        }))
      })
    }
  }

  const onOpenChange = (open: boolean) => {
    setOpen(open)
    if (open) {
      loadData()
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      const result = await updatePackageTicketsAction(
        package_.id,
        values.tickets.map(t => ({
          ticketId: t.ticketId,
          quantity: Number(t.quantity),
          discountPercentage: t.discountPercentage
            ? String(t.discountPercentage)
            : undefined
        }))
      )
      if (result.isSuccess) {
        toast.success("Package tickets updated successfully")
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Package Tickets</DialogTitle>
          <DialogDescription>
            Add or remove tickets from this package.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {form.watch("tickets").map((_, index) => (
              <div key={index} className="flex items-end gap-4">
                <FormField
                  control={form.control}
                  name={`tickets.${index}.ticketId`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Ticket</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={String(field.value)}
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
                              {ticket.title}
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
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Quantity"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`tickets.${index}.discountPercentage`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount %</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="Optional"
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
                  className="mb-2"
                  onClick={() => {
                    const tickets = form.getValues("tickets")
                    tickets.splice(index, 1)
                    form.setValue("tickets", tickets)
                  }}
                >
                  ×
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (availableTickets.length > 0) {
                  form.setValue("tickets", [
                    ...form.getValues("tickets"),
                    {
                      ticketId: availableTickets[0].id,
                      quantity: 1,
                      discountPercentage: undefined
                    }
                  ])
                } else {
                  toast.error("No tickets available for this race")
                }
              }}
            >
              Add Ticket
            </Button>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
