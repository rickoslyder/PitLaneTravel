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
import { updateRaceAction } from "@/actions/db/races-actions"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { SelectCircuit, SelectRace } from "@/db/schema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date: z.string().min(1, "Date is required"),
  season: z.coerce.number().min(2024, "Season must be 2024 or later"),
  round: z.coerce.number().min(1, "Round must be at least 1"),
  country: z.string().min(1, "Country is required"),
  description: z.string().optional(),
  weekendStart: z.string().optional(),
  weekendEnd: z.string().optional(),
  status: z.enum(["in_progress", "upcoming", "completed", "cancelled"]),
  isSprintWeekend: z.boolean(),
  circuitId: z.string().min(1, "Circuit is required")
})

interface EditRaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  race: SelectRace
}

export function EditRaceDialog({
  open,
  onOpenChange,
  race
}: EditRaceDialogProps) {
  const [loading, setLoading] = useState(false)
  const [circuits, setCircuits] = useState<SelectCircuit[]>([])

  useEffect(() => {
    fetch("/api/circuits")
      .then(res => res.json())
      .then(data => setCircuits(data.data))
      .catch(error => console.error("Error loading circuits:", error))
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: race.name,
      date: new Date(race.date).toISOString().split("T")[0],
      season: race.season,
      round: race.round,
      country: race.country,
      description: race.description || "",
      weekendStart: race.weekendStart
        ? new Date(race.weekendStart).toISOString().split("T")[0]
        : "",
      weekendEnd: race.weekendEnd
        ? new Date(race.weekendEnd).toISOString().split("T")[0]
        : "",
      status: race.status,
      isSprintWeekend: race.isSprintWeekend,
      circuitId: race.circuitId
    }
  })

  // Reset form when race changes
  useEffect(() => {
    form.reset({
      name: race.name,
      date: new Date(race.date).toISOString().split("T")[0],
      season: race.season,
      round: race.round,
      country: race.country,
      description: race.description || "",
      weekendStart: race.weekendStart
        ? new Date(race.weekendStart).toISOString().split("T")[0]
        : "",
      weekendEnd: race.weekendEnd
        ? new Date(race.weekendEnd).toISOString().split("T")[0]
        : "",
      status: race.status,
      isSprintWeekend: race.isSprintWeekend,
      circuitId: race.circuitId
    })
  }, [race, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)

    try {
      const result = await updateRaceAction(race.id, {
        ...values,
        date: new Date(values.date),
        weekendStart: values.weekendStart
          ? new Date(values.weekendStart)
          : null,
        weekendEnd: values.weekendEnd ? new Date(values.weekendEnd) : null,
        openf1MeetingKey: race.openf1MeetingKey,
        openf1SessionKey: race.openf1SessionKey
      })

      if (result.isSuccess) {
        toast.success("Race updated successfully")
        onOpenChange(false)
        window.location.reload()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to update race")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Race</DialogTitle>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <Input placeholder="Add a description..." {...field} />
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                Update Race
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}