"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { toast } from "sonner"
import { SelectTicketFeature } from "@/db/schema"
import { deleteTicketFeatureAction } from "@/actions/db/ticket-features-actions"

interface DeleteFeatureDialogProps {
  children: React.ReactNode
  feature: SelectTicketFeature
}

export function DeleteFeatureDialog({
  children,
  feature
}: DeleteFeatureDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  async function onDelete() {
    try {
      setIsDeleting(true)
      const result = await deleteTicketFeatureAction(feature.id)
      if (result.isSuccess) {
        toast.success("Feature deleted successfully")
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Feature</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this feature? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
