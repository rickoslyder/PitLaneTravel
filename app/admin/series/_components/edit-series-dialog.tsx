"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
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
import { RaceSelect } from "@/components/utilities/race-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { updateSupportingSeriesAction } from "@/actions/db/supporting-series-actions"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

const formSchema = z.object({
  series: z.string().min(1, "Series name is required"),
  round: z.coerce.number().min(1, "Round must be at least 1"),
  raceId: z.string().min(1, "Race is required"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.enum(["scheduled", "live", "completed", "delayed", "cancelled"])
})

type FormValues = z.infer<typeof formSchema>

interface EditSeriesDialogProps {
  series: {
    id: string
    raceId: string
    series: string
    round: number
    startTime: Date | null
    endTime: Date | null
    status: "scheduled" | "live" | "completed" | "delayed" | "cancelled" | null
    openf1SessionKey: number | null
    createdAt: Date
    updatedAt: Date
    raceName: string
  }
}

export function EditSeriesDialog({ series }: EditSeriesDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      series: series.series,
      round: series.round,
      raceId: series.raceId,
      startTime: series.startTime
        ? new Date(series.startTime).toISOString().slice(0, 16)
        : "",
      endTime: series.endTime
        ? new Date(series.endTime).toISOString().slice(0, 16)
        : "",
      status: series.status || "scheduled"
    }
  })

  async function onSubmit(values: FormValues) {
    try {
      const result = await updateSupportingSeriesAction(series.id, {
        ...values,
        startTime: values.startTime ? new Date(values.startTime) : null,
        endTime: values.endTime ? new Date(values.endTime) : null
      })

      if (result.isSuccess) {
        toast.success(result.message)
        setOpen(false)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to update supporting series")
    }
  }

  return (
    <>
      <DropdownMenuItem onSelect={() => setOpen(true)}>Edit</DropdownMenuItem>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Supporting Series</DialogTitle>
            <DialogDescription>
              Edit the details of the supporting series.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="series"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Series Name</FormLabel>
                    <FormControl>
                      <Input placeholder="F2" {...field} />
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
                      <Input type="number" min={1} placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="raceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Race</FormLabel>
                    <FormControl>
                      <RaceSelect
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
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="delayed">Delayed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
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
    </>
  )
}
