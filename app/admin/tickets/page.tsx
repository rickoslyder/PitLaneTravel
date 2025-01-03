"use server"

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Plus, DollarSign, Edit } from "lucide-react"
import { CreateTicketDialog } from "./_components/create-ticket-dialog"
import { TicketsTable } from "./_components/tickets-table"
import { TicketsTableSkeleton } from "./_components/tickets-table-skeleton"
import { getRacesAction } from "@/actions/db/races-actions"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
// import { DataTableRowActions, DropdownMenuItem } from "@/components/ui/data-table"
import { PricingHistoryDialog } from "./_components/pricing-history-dialog"

export default async function TicketsPage() {
  const { data: races } = await getRacesAction()

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tickets</h2>
          <p className="text-muted-foreground">
            Manage ticket categories for races
          </p>
        </div>
        {races && races.length > 0 && (
          <CreateTicketDialog races={races}>
            <Button>
              <Plus className="mr-2 size-4" />
              Add Ticket
            </Button>
          </CreateTicketDialog>
        )}
      </div>

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList>
          <TabsTrigger value="tickets" asChild>
            <Link href="/admin/tickets">Tickets</Link>
          </TabsTrigger>
          <TabsTrigger value="packages" asChild>
            <Link href="/admin/tickets/packages">Packages</Link>
          </TabsTrigger>
          <TabsTrigger value="features" asChild>
            <Link href="/admin/tickets/features">Features</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Suspense fallback={<TicketsTableSkeleton />}>
        <TicketsTable />
      </Suspense>
    </div>
  )
}
