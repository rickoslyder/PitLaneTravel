"use server"

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Plus, DollarSign, Edit, Wand2 } from "lucide-react"
import { CreateTicketDialog } from "./_components/create-ticket-dialog"
import { TicketsTable } from "./_components/tickets-table"
import { TicketsTableSkeleton } from "./_components/tickets-table-skeleton"
import { getRacesAction } from "@/actions/db/races-actions"
import { getTicketsAction } from "@/actions/db/tickets-actions"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { GenerateDescriptionsDialog } from "./_components/generate-descriptions-dialog"

export default async function TicketsPage() {
  const { data: races } = await getRacesAction()
  const { data: tickets } = await getTicketsAction()

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tickets</h2>
          <p className="text-muted-foreground">
            Manage ticket categories for races
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tickets && (
            <GenerateDescriptionsDialog tickets={tickets}>
              <Button variant="outline">
                <Wand2 className="mr-2 size-4" />
                Generate P1 Descriptions
              </Button>
            </GenerateDescriptionsDialog>
          )}
          {races && races.length > 0 && (
            <CreateTicketDialog races={races}>
              <Button>
                <Plus className="mr-2 size-4" />
                Add Ticket
              </Button>
            </CreateTicketDialog>
          )}
        </div>
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
