"use client"

import { Badge } from "@/components/ui/badge"
import { SelectTicketFeature } from "@/db/schema"

interface TicketFeaturesCellProps {
  features?: SelectTicketFeature[]
}

export function TicketFeaturesCell({ features }: TicketFeaturesCellProps) {
  if (!features?.length) {
    return <div className="text-muted-foreground text-sm">No features</div>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {features.map(feature => (
        <Badge key={feature.id} variant="secondary">
          {feature.name}
        </Badge>
      ))}
    </div>
  )
}
