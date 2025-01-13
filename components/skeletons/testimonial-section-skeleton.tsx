"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function TestimonialSectionSkeleton() {
  return (
    <section className="bg-secondary px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <Skeleton className="mx-auto mb-12 h-12 w-72" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-full">
              <CardHeader className="flex flex-col items-center">
                <Skeleton className="mb-4 size-20 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
