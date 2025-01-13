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
import { updateLocalAttractionAction } from "@/actions/db/local-attractions-actions"
import { CircuitSelect } from "@/components/circuit-select"
import { Edit } from "lucide-react"
import { SelectCircuit, SelectLocalAttraction } from "@/db/schema"
import { getCircuitsAction } from "@/actions/db/circuits-actions"

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

interface EditAttractionDialogProps {
  attraction: SelectLocalAttraction & { circuitName: string }
}

export function EditAttractionDialog({
  attraction
}: EditAttractionDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [circuits, setCircuits] = useState<SelectCircuit[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: attraction.name,
      description: attraction.description,
      circuitId: attraction.circuitId,
      distance_from_circuit: attraction.distance_from_circuit
        ? parseFloat(attraction.distance_from_circuit.toString())
        : undefined,
      booking_required: attraction.booking_required ?? false,
      price_range: attraction.price_range || "",
      f1_relevance: attraction.f1_relevance || ""
    }
  })

  async function onSubmit(data: FormValues) {
    const result = await updateLocalAttractionAction(attraction.id, {
      ...data,
      distance_from_circuit: data.distance_from_circuit?.toString()
    })
    if (result.isSuccess) {
      toast.success(result.message)
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  async function loadCircuits() {
    const result = await getCircuitsAction()
    if (result.isSuccess) {
      setCircuits(result.data)
    } else {
      toast.error("Failed to load circuits")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={newOpen => {
        setOpen(newOpen)
        if (newOpen) {
          loadCircuits()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Local Attraction</DialogTitle>
          <DialogDescription>
            Edit details for {attraction.name}.
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
                      circuits={circuits}
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
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
