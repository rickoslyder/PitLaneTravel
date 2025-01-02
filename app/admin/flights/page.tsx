"use server"

import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { db } from "@/db/db"
import { flightBookingsTable } from "@/db/schema"
import { desc } from "drizzle-orm"
import { AdminFlightsList } from "./_components/admin-flights-list"

export default async function AdminFlightsPage() {
  // Fetch all flight bookings
  const bookings = await db
    .select()
    .from(flightBookingsTable)
    .orderBy(desc(flightBookingsTable.createdAt))

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader
        title="Flight Bookings"
        description="Manage flight bookings and their associated trips"
      />
      <Card>
        <AdminFlightsList bookings={bookings} />
      </Card>
    </div>
  )
}
