"use client"

import { useState, useEffect } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { SelectTicket, SelectTicketFeature } from "@/db/schema"
import {
  getAllTicketFeaturesAction,
  getTicketFeaturesAction,
  addFeatureToTicketAction,
  removeFeatureFromTicketAction
} from "@/actions/db/ticket-features-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import * as Icons from "lucide-react"

interface ManageTicketFeaturesDialogProps {
  children: React.ReactNode
  ticket: SelectTicket
}

export function ManageTicketFeaturesDialog({
  children,
  ticket
}: ManageTicketFeaturesDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [allFeatures, setAllFeatures] = useState<SelectTicketFeature[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<
    SelectTicketFeature[]
  >([])
  const router = useRouter()

  useEffect(() => {
    if (open) {
      loadFeatures()
    }
  }, [open])

  const loadFeatures = async () => {
    try {
      const [allResult, selectedResult] = await Promise.all([
        getAllTicketFeaturesAction(),
        getTicketFeaturesAction(Number(ticket.id))
      ])

      if (allResult.isSuccess && selectedResult.isSuccess) {
        setAllFeatures(allResult.data)
        setSelectedFeatures(selectedResult.data)
      } else {
        toast.error("Failed to load features")
      }
    } catch (error) {
      console.error("Error loading features:", error)
      toast.error("Failed to load features")
    }
  }

  const toggleFeature = async (feature: SelectTicketFeature) => {
    setIsLoading(true)
    try {
      const isSelected = selectedFeatures.some(f => f.id === feature.id)
      const result = isSelected
        ? await removeFeatureFromTicketAction(
            Number(ticket.id),
            Number(feature.id)
          )
        : await addFeatureToTicketAction(Number(ticket.id), Number(feature.id))

      if (result.isSuccess) {
        setSelectedFeatures(prev =>
          isSelected
            ? prev.filter(f => f.id !== feature.id)
            : [...prev, feature]
        )
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to update feature")
    } finally {
      setIsLoading(false)
    }
  }

  const renderFeatureIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as any
    return IconComponent ? <IconComponent className="size-4" /> : null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Features</DialogTitle>
          <DialogDescription>
            Select the features available with this ticket.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {allFeatures.map(feature => {
              const isSelected = selectedFeatures.some(f => f.id === feature.id)
              return (
                <div
                  key={feature.id}
                  className="flex items-center space-x-4 rounded-lg border p-4"
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleFeature(feature)}
                    disabled={isLoading}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {feature.icon && renderFeatureIcon(feature.icon)}
                      <span className="font-medium">{feature.name}</span>
                    </div>
                    {feature.description && (
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{feature.category}</Badge>
                    <Badge variant="outline">{feature.featureType}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
