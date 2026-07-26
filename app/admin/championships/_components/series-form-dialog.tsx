"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  createSeriesAction,
  updateSeriesAction
} from "@/actions/db/series-actions"
import type { SelectSeries } from "@/db/schema/series-schema"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shortName: z.string().min(1, "Short name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  eventNoun: z.string().min(1, "Event noun is required"),
  governingBody: z.string().optional(),
  seasonLabel: z.string().optional(),
  accentColor: z.string().optional(),
  logoUrl: z.string().optional(),
  description: z.string().optional(),
  dataProvider: z.string().min(1),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int()
})

type FormValues = z.infer<typeof formSchema>

interface SeriesFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Omit to create a new championship. */
  series?: SelectSeries
  onSuccess?: () => void
}

export function SeriesFormDialog({
  open,
  onOpenChange,
  series,
  onSuccess
}: SeriesFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const isEdit = Boolean(series)

  const emptyValues: FormValues = {
    name: "",
    shortName: "",
    slug: "",
    eventNoun: "Grand Prix",
    governingBody: "",
    seasonLabel: "",
    accentColor: "",
    logoUrl: "",
    description: "",
    dataProvider: "manual",
    isActive: true,
    sortOrder: 0
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues
  })

  useEffect(() => {
    form.reset(
      series
        ? {
            name: series.name,
            shortName: series.shortName,
            slug: series.slug,
            eventNoun: series.eventNoun,
            governingBody: series.governingBody ?? "",
            seasonLabel: series.seasonLabel ?? "",
            accentColor: series.accentColor ?? "",
            logoUrl: series.logoUrl ?? "",
            description: series.description ?? "",
            dataProvider: series.dataProvider,
            isActive: series.isActive,
            sortOrder: series.sortOrder
          }
        : emptyValues
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, open])

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      const payload = {
        ...values,
        governingBody: values.governingBody || null,
        seasonLabel: values.seasonLabel || null,
        accentColor: values.accentColor || null,
        logoUrl: values.logoUrl || null,
        description: values.description || null
      }
      const result = series
        ? await updateSeriesAction(series.id, payload)
        : await createSeriesAction(payload)

      if (result.isSuccess) {
        toast.success(isEdit ? "Championship updated" : "Championship created")
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit championship" : "New championship"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="MotoGP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shortName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short name</FormLabel>
                    <FormControl>
                      <Input placeholder="MotoGP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="motogp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eventNoun"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event noun</FormLabel>
                    <FormControl>
                      <Input placeholder="Grand Prix / E-Prix / Round" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="governingBody"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Governing body</FormLabel>
                    <FormControl>
                      <Input placeholder="FIM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seasonLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Season label</FormLabel>
                    <FormControl>
                      <Input placeholder="FIM MotoGP World Championship" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="accentColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accent colour</FormLabel>
                    <FormControl>
                      <Input placeholder="#cc0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dataProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data provider</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manual">
                          manual (admin-entered)
                        </SelectItem>
                        <SelectItem value="openf1">openf1 (F1 only)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Shown on the series landing page" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-6">
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort order</FormLabel>
                    <FormControl>
                      <Input type="number" className="w-28" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 pt-6">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Active</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving…" : isEdit ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
