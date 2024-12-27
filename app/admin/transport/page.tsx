"use server"

import { Suspense } from "react"
import { TransportTable } from "./_components/transport-table"
import { TransportTableSkeleton } from "./_components/transport-table-skeleton"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateTransportDialog } from "./_components/create-transport-dialog"

interface TransportPageProps {
  params: Promise<{
    circuitId: string
  }>
}

export default async function TransportPage({ params }: TransportPageProps) {
  const resolvedParams = await params
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Transport Information"
          description="Manage circuit transport options and information"
        />
        <CreateTransportDialog circuitId={resolvedParams.circuitId}>
          <Button>
            <Plus className="mr-2 size-4" />
            Add Transport Info
          </Button>
        </CreateTransportDialog>
      </div>

      <div className="space-y-4">
        <Suspense fallback={<TransportTableSkeleton />}>
          <TransportTable />
        </Suspense>
      </div>
    </div>
  )
}
