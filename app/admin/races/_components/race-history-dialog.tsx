"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
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
import { SelectRace } from "@/db/schema"
import { SelectRaceHistory } from "@/db/schema/race-history-schema"
import {
  createRaceHistoryAction,
  updateRaceHistoryAction
} from "@/actions/db/race-history-actions"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import dynamic from "next/dynamic"
import { useRaceHistory } from "@/lib/hooks/use-race-history"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
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

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then(mod => mod.default),
  { ssr: false }
)

const timelineEventSchema = z.object({
  year: z.string().min(1, "Year is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional()
})

const recordBreakerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required")
})

const memorableMomentSchema = z.object({
  year: z.coerce.number().min(1900, "Year must be 1900 or later"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required")
})

const formSchema = z.object({
  timeline: z.array(timelineEventSchema),
  recordBreakers: z.array(recordBreakerSchema),
  memorableMoments: z.array(memorableMomentSchema),
  fullHistory: z.string().min(1, "Full history is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional()
})

interface RaceHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  race: SelectRace
  onSuccess?: () => void
}

const defaultFormValues = {
  timeline: [],
  recordBreakers: [],
  memorableMoments: [],
  fullHistory: "",
  metaTitle: "",
  metaDescription: ""
}

const formatJson = (obj: any) => JSON.stringify(obj, null, 2)

export function RaceHistoryDialog({
  open,
  onOpenChange,
  race,
  onSuccess
}: RaceHistoryDialogProps) {
  const [loading, setLoading] = useState(false)
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)
  const {
    loading: loadingHistory,
    error,
    history,
    refresh
  } = useRaceHistory(race.id)
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] =
    useState(false)
  const [isClosePending, setIsClosePending] = useState(false)

  const [timelineText, setTimelineText] = useState("")
  const [recordBreakersText, setRecordBreakersText] = useState("")
  const [memorableMomentsText, setMemorableMomentsText] = useState("")

  const [timelineError, setTimelineError] = useState<string>("")
  const [recordBreakersError, setRecordBreakersError] = useState<string>("")
  const [memorableMomentsError, setMemorableMomentsError] = useState<string>("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues
  })

  const {
    fields: timelineFields,
    append: appendTimeline,
    remove: removeTimeline
  } = useFieldArray({ control: form.control, name: "timeline" })

  const {
    fields: recordFields,
    append: appendRecord,
    remove: removeRecord
  } = useFieldArray({ control: form.control, name: "recordBreakers" })

  const {
    fields: momentFields,
    append: appendMoment,
    remove: removeMoment
  } = useFieldArray({ control: form.control, name: "memorableMoments" })

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      form.reset(defaultFormValues)
      setTimelineText("")
      setRecordBreakersText("")
      setMemorableMomentsText("")
      setTimelineError("")
      setRecordBreakersError("")
      setMemorableMomentsError("")
      setIsAdvancedMode(false)
    }
  }, [open, form])

  // Fetch history when dialog opens for a race
  useEffect(() => {
    if (!open) return

    const controller = new AbortController()
    refresh()

    return () => {
      controller.abort()
    }
  }, [open, race.id])

  // Initialize form when history changes
  useEffect(() => {
    if (!history) return

    const formData = {
      timeline: history.timeline,
      recordBreakers: history.recordBreakers,
      memorableMoments: history.memorableMoments,
      fullHistory: history.fullHistory,
      metaTitle: history.metaTitle || "",
      metaDescription: history.metaDescription || ""
    }

    form.reset(formData)
    setTimelineText(formatJson(history.timeline))
    setRecordBreakersText(formatJson(history.recordBreakers))
    setMemorableMomentsText(formatJson(history.memorableMoments))
  }, [history, form])

  // Handle mode switching
  const handleModeChange = (newMode: boolean) => {
    if (newMode) {
      // Switching to Advanced Mode
      const formValues = form.getValues()
      setTimelineText(formatJson(formValues.timeline))
      setRecordBreakersText(formatJson(formValues.recordBreakers))
      setMemorableMomentsText(formatJson(formValues.memorableMoments))
      setIsAdvancedMode(true)
    } else {
      // Switching to Normal Mode
      try {
        const timelineParsed = JSON.parse(timelineText)
        const recordsParsed = JSON.parse(recordBreakersText)
        const momentsParsed = JSON.parse(memorableMomentsText)

        // Update form values
        form.setValue("timeline", timelineParsed, { shouldDirty: true })
        form.setValue("recordBreakers", recordsParsed, { shouldDirty: true })
        form.setValue("memorableMoments", momentsParsed, { shouldDirty: true })

        setIsAdvancedMode(false)
      } catch (e) {
        console.error("Failed to parse JSON when switching modes:", e)
        toast.error(
          "Invalid JSON in one or more fields. Please fix before switching modes."
        )
      }
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)

    try {
      let dataToSubmit = { ...values }

      // If in advanced mode, use the JSON text values
      if (isAdvancedMode) {
        try {
          dataToSubmit = {
            ...values,
            timeline: JSON.parse(timelineText),
            recordBreakers: JSON.parse(recordBreakersText),
            memorableMoments: JSON.parse(memorableMomentsText)
          }
        } catch (e) {
          console.error("Failed to parse JSON:", e)
          toast.error("Invalid JSON in one or more fields")
          setLoading(false)
          return
        }
      }

      console.log("Submitting data:", {
        raceId: race.id,
        isUpdate: !!history,
        data: dataToSubmit
      })

      const result = history
        ? await updateRaceHistoryAction(race.id, dataToSubmit)
        : await createRaceHistoryAction({ ...dataToSubmit, raceId: race.id })

      console.log("Action result:", result)

      if (result.isSuccess) {
        await refresh()
        toast.success(
          history
            ? "History updated successfully"
            : "History created successfully"
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        console.error("Action failed:", result.message)
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Failed to save history:", error)
      toast.error("Failed to save history")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    const formValues = form.getValues()
    const hasUnsavedChanges =
      form.formState.isDirty ||
      (isAdvancedMode &&
        (timelineText !== formatJson(history?.timeline || []) ||
          recordBreakersText !== formatJson(history?.recordBreakers || []) ||
          memorableMomentsText !== formatJson(history?.memorableMoments || [])))

    if (hasUnsavedChanges) {
      setShowUnsavedChangesDialog(true)
      setIsClosePending(true)
    } else {
      onOpenChange(false)
    }
  }

  const handleConfirmClose = () => {
    setShowUnsavedChangesDialog(false)
    setIsClosePending(false)
    onOpenChange(false)
  }

  const handleCancelClose = () => {
    setShowUnsavedChangesDialog(false)
    setIsClosePending(false)
  }

  return (
    <>
      <Dialog open={open && !isClosePending} onOpenChange={handleClose}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 pb-4 backdrop-blur">
            <DialogTitle>{history ? "Edit" : "Add"} Race History</DialogTitle>
            <div className="flex items-center space-x-2">
              <Switch
                checked={isAdvancedMode}
                onCheckedChange={handleModeChange}
              />
              <span className="text-sm">Advanced Mode</span>
            </div>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {isAdvancedMode ? (
                <>
                  <div className="space-y-4">
                    <h3 className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-14 z-10 py-2 text-lg font-medium backdrop-blur">
                      Timeline (JSON)
                    </h3>
                    <Textarea
                      placeholder="Enter timeline JSON"
                      className={cn(
                        "font-mono",
                        timelineError && "border-red-500"
                      )}
                      value={timelineText}
                      onChange={e => {
                        setTimelineText(e.target.value)
                        try {
                          const parsed = JSON.parse(e.target.value)
                          form.setValue("timeline", parsed, {
                            shouldDirty: true
                          })
                          setTimelineError("")
                        } catch (e) {
                          setTimelineError("Invalid JSON format")
                        }
                      }}
                      rows={10}
                    />
                    {timelineError && (
                      <p className="text-sm text-red-500">{timelineError}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-14 z-10 py-2 text-lg font-medium backdrop-blur">
                      Record Breakers (JSON)
                    </h3>
                    <Textarea
                      placeholder="Enter record breakers JSON"
                      className={cn(
                        "font-mono",
                        recordBreakersError && "border-red-500"
                      )}
                      value={recordBreakersText}
                      onChange={e => {
                        setRecordBreakersText(e.target.value)
                        try {
                          const parsed = JSON.parse(e.target.value)
                          form.setValue("recordBreakers", parsed, {
                            shouldDirty: true
                          })
                          setRecordBreakersError("")
                        } catch (e) {
                          setRecordBreakersError("Invalid JSON format")
                        }
                      }}
                      rows={10}
                    />
                    {recordBreakersError && (
                      <p className="text-sm text-red-500">
                        {recordBreakersError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-14 z-10 py-2 text-lg font-medium backdrop-blur">
                      Memorable Moments (JSON)
                    </h3>
                    <Textarea
                      placeholder="Enter memorable moments JSON"
                      className={cn(
                        "font-mono",
                        memorableMomentsError && "border-red-500"
                      )}
                      value={memorableMomentsText}
                      onChange={e => {
                        setMemorableMomentsText(e.target.value)
                        try {
                          const parsed = JSON.parse(e.target.value)
                          form.setValue("memorableMoments", parsed, {
                            shouldDirty: true
                          })
                          setMemorableMomentsError("")
                        } catch (e) {
                          setMemorableMomentsError("Invalid JSON format")
                        }
                      }}
                      rows={10}
                    />
                    {memorableMomentsError && (
                      <p className="text-sm text-red-500">
                        {memorableMomentsError}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <h3 className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-14 z-10 py-2 text-lg font-medium backdrop-blur">
                      Timeline
                    </h3>
                    {timelineFields.map(
                      (field: Record<string, any>, index: number) => (
                        <div key={field.id} className="flex gap-4">
                          <FormField
                            control={form.control}
                            name={`timeline.${index}.year`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input placeholder="Year" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`timeline.${index}.title`}
                            render={({ field }) => (
                              <FormItem className="flex-[2]">
                                <FormControl>
                                  <Input placeholder="Title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`timeline.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="flex-[3]">
                                <FormControl>
                                  <Input
                                    placeholder="Description (optional)"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTimeline(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      )
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        appendTimeline({ year: "", title: "", description: "" })
                      }
                    >
                      Add Timeline Event
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-14 z-10 py-2 text-lg font-medium backdrop-blur">
                      Record Breakers
                    </h3>
                    {recordFields.map(
                      (field: Record<string, any>, index: number) => (
                        <div key={field.id} className="flex gap-4">
                          <FormField
                            control={form.control}
                            name={`recordBreakers.${index}.title`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input placeholder="Title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`recordBreakers.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="flex-[2]">
                                <FormControl>
                                  <Input placeholder="Description" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRecord(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      )
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        appendRecord({ title: "", description: "" })
                      }
                    >
                      Add Record
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-14 z-10 py-2 text-lg font-medium backdrop-blur">
                      Memorable Moments
                    </h3>
                    {momentFields.map(
                      (field: Record<string, any>, index: number) => (
                        <div key={field.id} className="flex gap-4">
                          <FormField
                            control={form.control}
                            name={`memorableMoments.${index}.year`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Year"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`memorableMoments.${index}.title`}
                            render={({ field }) => (
                              <FormItem className="flex-[2]">
                                <FormControl>
                                  <Input placeholder="Title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`memorableMoments.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="flex-[3]">
                                <FormControl>
                                  <Input placeholder="Description" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMoment(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      )
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        appendMoment({
                          year: new Date().getFullYear(),
                          title: "",
                          description: ""
                        })
                      }
                    >
                      Add Moment
                    </Button>
                  </div>
                </>
              )}

              <div className="space-y-4">
                <h3 className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-14 z-10 py-2 text-lg font-medium backdrop-blur">
                  Full History
                </h3>
                <FormField
                  control={form.control}
                  name="fullHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div data-color-mode="dark">
                          <MDEditor
                            value={field.value}
                            onChange={value => field.onChange(value || "")}
                            preview="edit"
                            height={400}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-14 z-10 py-2 text-lg font-medium backdrop-blur">
                  SEO
                </h3>
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input placeholder="SEO title (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="SEO description (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-10 pt-4 backdrop-blur">
                <Button type="submit" disabled={loading}>
                  {history ? "Update" : "Create"} History
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showUnsavedChangesDialog}
        onOpenChange={setShowUnsavedChangesDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close? Your
              changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
