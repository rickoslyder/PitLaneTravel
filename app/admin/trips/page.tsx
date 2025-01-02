"use server"

import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { db } from "@/db/db"
import { tripsTable } from "@/db/schema"
import { desc } from "drizzle-orm"
import { AdminTripsList } from "./_components/admin-trips-list"

export default async function AdminTripsPage() {
  // Fetch all trips
  const trips = await db
    .select()
    .from(tripsTable)
    .orderBy(desc(tripsTable.createdAt))

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader
        title="Trips"
        description="Manage user trips and their associated bookings"
      />
      <Card>
        <AdminTripsList trips={trips} />
      </Card>
    </div>
  )
}
