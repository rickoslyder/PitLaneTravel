"use client"

import { useEffect, useState } from "react"
import { getAllTipsAction } from "@/actions/db/community-actions"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./tips-columns"
import { SelectTip } from "@/db/schema"

export function TipsTable() {
  const [tips, setTips] = useState<SelectTip[]>([])

  useEffect(() => {
    async function loadTips() {
      const result = await getAllTipsAction()
      if (result.isSuccess) {
        setTips(result.data)
      }
    }
    loadTips()
  }, [])

  return (
    <div className="rounded-md border">
      <DataTable
        columns={columns}
        data={tips}
        searchKey="content"
        searchPlaceholder="Search tips..."
      />
    </div>
  )
}
