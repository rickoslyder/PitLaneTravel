"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { RaceWithCircuitAndSeries } from "@/types/database"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

interface CircuitCardProps {
  race: RaceWithCircuitAndSeries
}

export function CircuitCard({ race }: CircuitCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={race.circuit?.image_url || ""}
          alt={`${race.circuit?.name} circuit`}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={true}
        />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{race.circuit?.name}</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                View Track Map
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{race.circuit?.name} Track Map</DialogTitle>
                <DialogDescription>
                  Circuit layout and key features
                </DialogDescription>
              </DialogHeader>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={race.circuit?.track_map_url || ""}
                  alt={`${race.circuit?.name} track layout`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div
          id={`${race.id}-description`}
          className="prose prose-sm dark:prose-invert mb-4"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {race.description || `Experience the thrill of the ${race.name}.`}
          </ReactMarkdown>
        </div>
        <Button asChild className="w-full">
          <Link href={`/races/${race.slug}`}>
            Plan Your {race.circuit?.name} Trip
          </Link>
        </Button>
        <Button asChild className="mt-2 w-full" variant="outline">
          <Link href={`/races/${race.slug}/history`}>
            View Full Circuit History
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
