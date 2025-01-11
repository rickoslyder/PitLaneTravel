"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createRaceAction } from "@/actions/db/races-actions"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { SelectCircuit } from "@/db/schema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import dynamic from "next/dynamic"

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then(mod => mod.default),
  { ssr: false }
)

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date: z.string().min(1, "Date is required"),
  season: z.coerce.number().min(2024, "Season must be 2024 or later"),
  round: z.coerce.number().min(1, "Round must be at least 1"),
  country: z.string().min(1, "Country is required"),
  description: z.string().optional(),
  weekendStart: z.string().optional(),
  weekendEnd: z.string().optional(),
  status: z
    .enum(["in_progress", "upcoming", "completed", "cancelled"])
    .default("upcoming"),
  isSprintWeekend: z.boolean().default(false),
  circuitId: z.string().min(1, "Circuit is required")
})

interface CreateRaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateRaceDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateRaceDialogProps) {
  const [loading, setLoading] = useState(false)
  const [circuits, setCircuits] = useState<SelectCircuit[]>([])

  useEffect(() => {
    const fetchCircuits = async () => {
      try {
        const response = await fetch("/api/circuits")
        const data = await response.json()
        setCircuits(data.data || [])
      } catch (error) {
        console.error("Error fetching circuits:", error)
        toast.error("Failed to load circuits")
      }
    }

    fetchCircuits()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      date: "",
      season: new Date().getFullYear(),
      round: 1,
      country: "",
      description: "",
      weekendStart: "",
      weekendEnd: "",
      status: "upcoming",
      isSprintWeekend: false,
      circuitId: ""
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)

    try {
      const result = await createRaceAction({
        ...values,
        date: new Date(values.date),
        weekendStart: values.weekendStart
          ? new Date(values.weekendStart)
          : null,
        weekendEnd: values.weekendEnd ? new Date(values.weekendEnd) : null
      })

      if (result.isSuccess) {
        toast.success("Race created successfully")
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to create race")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Race</DialogTitle>
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
                    <Input placeholder="Monaco Grand Prix" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Race Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a circuit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {circuits.map(circuit => (
                          <SelectItem key={circuit.id} value={circuit.id}>
                            {circuit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="season"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Season</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="round"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Round</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Monaco" {...field} />
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
                    <div data-color-mode="dark">
                      <MDEditor
                        value={field.value || ""}
                        onChange={value => field.onChange(value || "")}
                        preview="edit"
                        height={200}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="weekendStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekend Start</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weekendEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekend End</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isSprintWeekend"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Sprint Weekend</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                Create Race
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
