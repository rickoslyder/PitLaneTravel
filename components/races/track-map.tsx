"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Map } from "lucide-react"

interface TrackMapProps {
  trackMapUrl?: string | null
  name: string
}

export function TrackMap({ trackMapUrl, name }: TrackMapProps) {
  if (!trackMapUrl) {
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
          <Image
            src={trackMapUrl}
            alt={`${name} track map`}
            fill
            sizes="(max-width: 768px) 100vw, 48rem"
            className="object-contain"
          />
        </div>
      </CardContent>
    </Card>
  )
}
