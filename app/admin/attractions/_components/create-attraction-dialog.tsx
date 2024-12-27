"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { createLocalAttractionAction } from "@/actions/db/local-attractions-actions"
import { CircuitSelect } from "@/components/circuit-select"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  circuitId: z.string().min(1, "Circuit is required"),
  distance_from_circuit: z.number().min(0).optional(),
  booking_required: z.boolean().default(false),
  price_range: z.string().optional(),
  f1_relevance: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

export function CreateAttractionDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      circuitId: "",
      distance_from_circuit: undefined,
      booking_required: false,
      price_range: "",
      f1_relevance: ""
    }
  })

  async function onSubmit(data: FormValues) {
    const result = await createLocalAttractionAction({
      ...data,
      distance_from_circuit: data.distance_from_circuit?.toString()
    })
    if (result.isSuccess) {
      toast.success(result.message)
      setOpen(false)
      form.reset()
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Attraction</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Local Attraction</DialogTitle>
          <DialogDescription>
            Add a new local attraction near a circuit.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter attraction name" {...field} />
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
                      placeholder="Enter attraction description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="circuitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Circuit</FormLabel>
                  <FormControl>
                    <CircuitSelect
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="distance_from_circuit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Distance from Circuit (km)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter distance"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="booking_required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Booking Required</FormLabel>
                    <FormDescription>
                      Does this attraction require booking in advance?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price_range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Range</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. $10-20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="f1_relevance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>F1 Relevance</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Historic racing venue"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Create Attraction</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
