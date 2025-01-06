"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Map } from "lucide-react"

interface TrackMapProps {
  trackMapUrl?: string | null
  name: string
}

export function TrackMap({ trackMapUrl, name }: TrackMapProps) {
  console.log("TrackMap props:", { trackMapUrl, name })

  if (!trackMapUrl) {
    console.log("TrackMap: No URL provided, returning null")
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Map className="text-primary size-5" />
          <CardTitle>{name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
          <img
            src={trackMapUrl}
            alt={`${name} track map`}
            className="size-full object-contain"
          />
        </div>
      </CardContent>
    </Card>
  )
}
