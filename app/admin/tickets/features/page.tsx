"use server"

import { Suspense } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateFeatureDialog } from "./_components/create-feature-dialog"
import { FeaturesTable } from "./_components/features-table"
import { FeaturesTableSkeleton } from "./_components/features-table-skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default async function TicketFeaturesPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Ticket Features"
          description="Manage reusable features that can be added to tickets"
        />
        <CreateFeatureDialog>
          <Button>
            <Plus className="mr-2 size-4" />
            Add Feature
          </Button>
        </CreateFeatureDialog>
      </div>

      <Tabs defaultValue="features" className="w-full">
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

      <div className="space-y-4">
        <Suspense fallback={<FeaturesTableSkeleton />}>
          <FeaturesTable />
        </Suspense>
      </div>
    </div>
  )
}
