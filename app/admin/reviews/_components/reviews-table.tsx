"use client"

import { useEffect, useState } from "react"
import { getAllReviewsAction } from "@/actions/db/community-actions"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./reviews-columns"
import { SelectReview } from "@/db/schema"

export function ReviewsTable() {
  const [reviews, setReviews] = useState<SelectReview[]>([])

  useEffect(() => {
    async function loadReviews() {
      const result = await getAllReviewsAction()
      if (result.isSuccess) {
        setReviews(result.data)
      }
    }
    loadReviews()
  }, [])

  return (
    <div className="rounded-md border">
      <DataTable
        columns={columns}
        data={reviews}
        searchKey="content"
        searchPlaceholder="Search reviews..."
      />
    </div>
  )
}
