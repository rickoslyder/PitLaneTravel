"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function TicketsTableSkeleton() {
  return (
    <div className="rounded-md border">
      <div className="border-b p-4">
        <Skeleton className="h-8 w-[250px]" />
      </div>
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-[100px]" />
            <Skeleton className="h-12 w-[100px]" />
            <Skeleton className="h-12 w-[70px]" />
          </div>
        ))}
      </div>
    </div>
  )
}
