"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CircuitExplorerSkeleton() {
  return (
    <section className="px-4 py-20" aria-labelledby="circuit-explorer-title">
      <div className="mx-auto max-w-6xl">
        <Skeleton className="mx-auto mb-12 h-12 w-72" />
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="relative h-64 w-full">
              <Skeleton className="size-full" />
            </div>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-4 h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
          <div>
            <Skeleton className="mb-4 h-8 w-48" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
