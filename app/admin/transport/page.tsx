"use server"

import { Suspense } from "react"
import { TransportTable } from "./_components/transport-table"
import { TransportTableSkeleton } from "./_components/transport-table-skeleton"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateTransportDialog } from "./_components/create-transport-dialog"
import { CircuitSelectWrapper } from "./_components/circuit-select-wrapper"
import { getCircuitsAction } from "@/actions/db/circuits-actions"
import { getTransportInfoByCircuitAction } from "@/actions/db/transport-info-actions"

interface TransportPageProps {
  searchParams: Promise<{
    circuitId?: string
  }>
}

async function TransportTableWrapper({ circuitId }: { circuitId: string }) {
  const { data: transportInfo, isSuccess } =
    await getTransportInfoByCircuitAction(circuitId)

  if (!isSuccess) {
    return (
      <div className="text-muted-foreground rounded-md border p-4 text-center">
        Failed to load transport information. Please try again.
      </div>
    )
  }

  return <TransportTable transportInfo={transportInfo} />
}

export default async function TransportPage({
  searchParams
}: TransportPageProps) {
  const { circuitId } = await searchParams
  const { data: circuits } = await getCircuitsAction()

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Transport Information"
          description="Manage circuit transport options and information"
        />
        {circuitId && (
          <CreateTransportDialog circuitId={circuitId}>
            <Button>
              <Plus className="mr-2 size-4" />
              Add Transport Info
            </Button>
          </CreateTransportDialog>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-[300px]">
            <CircuitSelectWrapper
              circuits={circuits || []}
              value={circuitId}
              placeholder="Select a circuit to manage transport"
            />
          </div>
        </div>

        {!circuitId ? (
          <div className="text-muted-foreground rounded-md border p-4 text-center">
            Please select a circuit to manage transport information.
          </div>
        ) : (
          <Suspense fallback={<TransportTableSkeleton />}>
            <TransportTableWrapper circuitId={circuitId} />
          </Suspense>
        )}
      </div>
    </div>
  )
}
