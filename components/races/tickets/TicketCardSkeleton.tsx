"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TicketCardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <Skeleton className="h-6 w-[100px]" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-8 w-[150px]" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-[100px]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export function PackageCardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-[100px]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}
