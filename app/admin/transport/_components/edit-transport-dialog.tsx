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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { updateTransportInfoAction } from "@/actions/db/transport-info-actions"
import { createAdminActivityAction } from "@/actions/db/admin-activity-actions"
import { SelectTransportInfo } from "@/db/schema"
import { useAuth } from "@clerk/nextjs"
import { Badge } from "@/components/ui/badge"
import { Loader2, RotateCcw } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"

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

interface EditTransportDialogProps {
  children: React.ReactNode
  transport: SelectTransportInfo
}

export function EditTransportDialog({
  children,
  transport
}: EditTransportDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const router = useRouter()
  const { userId } = useAuth()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: transport.name,
      type: transport.type as TransportType,
      description: transport.description,
      options: transport.options ?? []
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
      setShowUnsavedDialog(true)
    } else {
      setOpen(open)
    }
  }

  function handleClose() {
    setOpen(false)
    setShowUnsavedDialog(false)
    form.reset()
  }

  function handleReset() {
    form.reset({
      name: transport.name,
      type: transport.type as TransportType,
      description: transport.description,
      options: transport.options ?? []
    })
  }

  async function onSubmit(values: FormValues) {
    if (!userId) {
      toast.error("You must be logged in to update transport info")
      return
    }

    try {
      setIsSubmitting(true)
      const result = await updateTransportInfoAction(transport.id, values)
      if (result.isSuccess) {
        await createAdminActivityAction({
          type: "transport",
          description: `Updated transport info: ${values.name}`,
          userId
        })

        toast.success("Transport info updated successfully")
        setOpen(false)
        form.reset(values)
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

  const lastUpdated = new Date(transport.updatedAt).toLocaleString()

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Transport Information</DialogTitle>
            <DialogDescription>
              Make changes to the transport information. Click save when you're
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <div>Last updated: {lastUpdated}</div>
            {isDirty && (
              <Badge
                variant="outline"
                className="border-yellow-600 text-yellow-600"
              >
                Unsaved changes
              </Badge>
            )}
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Airport Express Bus"
                        {...field}
                      />
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
                        value={field.value || ""}
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
                      Add specific options like schedules, prices, or routes.
                      Each option should be a distinct choice.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <div className="flex flex-1 items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={!isDirty || isSubmitting}
                  >
                    <RotateCcw className="mr-2 size-4" />
                    Reset
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !isDirty}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close? Your
              changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleClose}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
