"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createTransportInfoAction } from "@/actions/db/transport-info-actions"
import { createAdminActivityAction } from "@/actions/db/admin-activity-actions"
import { getCircuitAction } from "@/actions/db/circuits-actions"
import { SelectCircuit } from "@/db/schema"
import { useAuth } from "@clerk/nextjs"

const transportTypes = ["bus", "train", "taxi", "walk", "other"] as const
type TransportType = (typeof transportTypes)[number]

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  type: z.enum(transportTypes, {
    required_error: "Type is required"
  }),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters")
    .nullable(),
  circuit_id: z.string().uuid("Invalid circuit ID"),
  options: z
    .array(
      z
        .string()
        .min(1, "Option cannot be empty")
        .max(100, "Option must be less than 100 characters")
    )
    .min(1, "At least one option is required")
})

type FormValues = z.infer<typeof formSchema>

interface CreateTransportDialogProps {
  children: React.ReactNode
  circuitId: string
}

export function CreateTransportDialog({
  children,
  circuitId
}: CreateTransportDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userId } = useAuth()
  const [selectedCircuit, setSelectedCircuit] = useState<SelectCircuit | null>(
    null
  )

  useEffect(() => {
    async function fetchCircuit() {
      const result = await getCircuitAction(circuitId)
      if (result.isSuccess && result.data) {
        setSelectedCircuit(result.data)
      }
    }
    fetchCircuit()
  }, [circuitId])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "bus",
      description: null,
      circuit_id: circuitId,
      options: []
    }
  })

  const isDirty = form.formState.isDirty

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [isDirty])

  function onOpenChange(open: boolean) {
    if (!open && isDirty) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to close?"
        )
      ) {
        setOpen(false)
        form.reset()
      }
    } else {
      setOpen(open)
    }
  }

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setOpen(true)
      // Remove the action param from URL without triggering a reload
      const url = new URL(window.location.href)
      url.searchParams.delete("action")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams])

  async function onSubmit(values: FormValues) {
    if (!userId) {
      toast.error("You must be logged in to create transport info")
      return
    }

    try {
      setIsSubmitting(true)
      const result = await createTransportInfoAction({
        name: values.name,
        type: values.type,
        description: values.description || null,
        circuitId: values.circuit_id,
        options: values.options
      })
      if (result.isSuccess) {
        await createAdminActivityAction({
          type: "transport",
          description: `Created new transport info: ${values.name}`,
          userId
        })

        toast.success("Transport info created successfully")
        setOpen(false)
        form.reset()
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transport Information</DialogTitle>
          <DialogDescription>
            Add new transport information for a circuit. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="circuit_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Circuit</FormLabel>
                  <FormControl>
                    <Input
                      value={selectedCircuit?.name || "Loading..."}
                      disabled
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    This transport information will be associated with{" "}
                    {selectedCircuit?.name}
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Airport Express Bus" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear, descriptive name for this transport option
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
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
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="train">Train</SelectItem>
                      <SelectItem value="taxi">Taxi</SelectItem>
                      <SelectItem value="walk">Walk</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The type of transport this represents
                  </FormDescription>
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
                      placeholder="Describe the transport option, including any important details..."
                      className="resize-none"
                      {...field}
                      value={field.value === null ? "" : field.value}
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed information about this transport option. Include
                    schedules, routes, or other relevant details.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="options"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Options</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {field.value.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={option}
                            onChange={e => {
                              const newOptions = [...field.value]
                              newOptions[index] = e.target.value
                              field.onChange(newOptions)
                            }}
                            placeholder={`e.g., "Every 30 minutes" or "€20 one-way"`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newOptions = field.value.filter(
                                (_, i) => i !== index
                              )
                              field.onChange(newOptions)
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => field.onChange([...field.value, ""])}
                      >
                        Add Option
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Add specific options like schedules, prices, or routes. Each
                    option should be a distinct choice.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
