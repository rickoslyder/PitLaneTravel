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
  FormMessage
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
import { useAuth } from "@clerk/nextjs"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  description: z.string().min(1, "Description is required").nullable(),
  circuit_id: z.string().uuid("Invalid circuit ID"),
  options: z.array(z.string()).nullable().default(null)
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userId } = useAuth()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      description: null,
      circuit_id: circuitId,
      options: null
    }
  })

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
      const result = await createTransportInfoAction({
        name: values.name,
        type: values.type,
        description: values.description || null,
        circuitId: values.circuit_id,
        options: values.options
      })
      if (result.isSuccess) {
        // Log the admin activity
        await createAdminActivityAction({
          type: "transport",
          description: `Created new transport info: ${values.name}`,
          userId
        })

        toast.success("Transport info created successfully")
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
    <Dialog open={open} onOpenChange={setOpen}>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
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
                      <SelectItem value="public">Public Transport</SelectItem>
                      <SelectItem value="shuttle">Shuttle Service</SelectItem>
                      <SelectItem value="taxi">Taxi</SelectItem>
                      <SelectItem value="parking">Parking</SelectItem>
                    </SelectContent>
                  </Select>
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
                      placeholder="Enter description"
                      className="resize-none"
                      {...field}
                      value={field.value === null ? "" : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
