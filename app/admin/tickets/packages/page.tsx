"use server"

import { Suspense } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreatePackageDialog } from "./_components/create-package-dialog"
import { PackagesTable } from "./_components/packages-table"
import { PackagesTableSkeleton } from "./_components/packages-table-skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface TicketPackagesPageProps {
  searchParams: Promise<{ race_id?: string }>
}

export default async function TicketPackagesPage({
  searchParams
}: TicketPackagesPageProps) {
  const resolvedSearchParams = await searchParams
  const raceId = resolvedSearchParams.race_id

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Ticket Packages"
          description="Manage ticket packages and bundle deals"
        />
        <CreatePackageDialog raceId={raceId}>
          <Button>
            <Plus className="mr-2 size-4" />
            Add Package
          </Button>
        </CreatePackageDialog>
      </div>

      <Tabs defaultValue="packages" className="w-full">
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
        <Suspense fallback={<PackagesTableSkeleton />}>
          <PackagesTable />
        </Suspense>
      </div>
    </div>
  )
}
