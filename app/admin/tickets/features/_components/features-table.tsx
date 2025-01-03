"use client"

import { getAllTicketFeaturesAction } from "@/actions/db/ticket-features-actions"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./features-columns"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { SelectTicketFeature } from "@/db/schema"

export function FeaturesTable() {
  const [features, setFeatures] = useState<SelectTicketFeature[]>([])

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const result = await getAllTicketFeaturesAction()
        if (result.isSuccess) {
          setFeatures(result.data)
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        console.error("Error fetching features:", error)
        toast.error("Failed to fetch features")
      }
    }

    fetchFeatures()
  }, [])

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={features}
        searchKey="name"
        searchPlaceholder="Search features..."
      />
    </div>
  )
}
