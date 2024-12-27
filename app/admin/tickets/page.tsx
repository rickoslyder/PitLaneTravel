"use server"

import { Suspense } from "react"
import { TicketsTable } from "./_components/tickets-table"
import { TicketsTableSkeleton } from "./_components/tickets-table-skeleton"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateTicketDialog } from "./_components/create-ticket-dialog"

export default async function TicketsPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Tickets Management"
          description="Manage race tickets, pricing, and packages"
        />
        <CreateTicketDialog>
          <Button>
            <Plus className="mr-2 size-4" />
            Add Ticket
          </Button>
        </CreateTicketDialog>
      </div>

      <div className="space-y-4">
        <Suspense fallback={<TicketsTableSkeleton />}>
          <TicketsTable />
        </Suspense>
      </div>
    </div>
  )
}
