"use client"

import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewsTable } from "./_components/reviews-table"
import { TipsTable } from "./_components/tips-table"
import { Suspense } from "react"
import { ReviewsTableSkeleton } from "./_components/reviews-table-skeleton"
import { TipsTableSkeleton } from "./_components/tips-table-skeleton"

export default function ReviewsPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <PageHeader
        title="Content Management"
        description="Manage user reviews and travel tips"
      />

      <Tabs defaultValue="reviews" className="w-full">
        <TabsList>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="tips">Travel Tips</TabsTrigger>
        </TabsList>
        <TabsContent value="reviews" className="mt-4">
          <Suspense fallback={<ReviewsTableSkeleton />}>
            <ReviewsTable />
          </Suspense>
        </TabsContent>
        <TabsContent value="tips" className="mt-4">
          <Suspense fallback={<TipsTableSkeleton />}>
            <TipsTable />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
