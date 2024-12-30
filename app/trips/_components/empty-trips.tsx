"use client"

import { EmptyPlaceholder } from "@/components/ui/empty-placeholder"

interface EmptyTripsProps {
  error?: string
}

export function EmptyTrips({ error }: EmptyTripsProps) {
  if (error) {
    return (
      <EmptyPlaceholder>
        <EmptyPlaceholder.Icon name="warning" />
        <EmptyPlaceholder.Title>Error Loading Trips</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>{error}</EmptyPlaceholder.Description>
      </EmptyPlaceholder>
    )
  }

  return (
    <EmptyPlaceholder>
      <EmptyPlaceholder.Icon name="calendar" />
      <EmptyPlaceholder.Title>No Trips Yet</EmptyPlaceholder.Title>
      <EmptyPlaceholder.Description>
        Start planning your F1 adventure by browsing races and creating a trip
        plan.
      </EmptyPlaceholder.Description>
      <EmptyPlaceholder.Button href="/races">
        Browse Races
      </EmptyPlaceholder.Button>
    </EmptyPlaceholder>
  )
}
