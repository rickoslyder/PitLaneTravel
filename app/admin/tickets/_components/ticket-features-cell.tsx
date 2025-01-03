"use client"

import { useEffect, useState } from "react"
import { SelectTicketFeature } from "@/db/schema"
import { getTicketFeaturesAction } from "@/actions/db/ticket-features-actions"
import { Badge } from "@/components/ui/badge"
import * as Icons from "lucide-react"
import { cn } from "@/lib/utils"

interface TicketFeaturesCellProps {
  ticketId: number
  className?: string
}

export function TicketFeaturesCell({
  ticketId,
  className
}: TicketFeaturesCellProps) {
  const [features, setFeatures] = useState<SelectTicketFeature[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFeatures()
  }, [ticketId])

  const loadFeatures = async () => {
    try {
      const result = await getTicketFeaturesAction(ticketId)
      if (result.isSuccess) {
        setFeatures(result.data)
      }
    } catch (error) {
      console.error("Error loading features:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderFeatureIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as any
    return IconComponent ? <IconComponent className="size-4" /> : null
  }

  if (isLoading) {
    return (
      <div className={cn("bg-muted h-6 animate-pulse rounded", className)} />
    )
  }

  if (features.length === 0) {
    return (
      <div className={cn("text-muted-foreground text-sm", className)}>
        No features
      </div>
    )
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {features.map(feature => (
        <Badge
          key={feature.id}
          variant="outline"
          className="flex items-center gap-1"
        >
          {feature.icon && renderFeatureIcon(feature.icon)}
          {feature.name}
        </Badge>
      ))}
    </div>
  )
}
