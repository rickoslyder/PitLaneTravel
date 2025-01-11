"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserFlightBookingsAction } from "@/actions/db/flight-bookings-actions"
import { BookingsList } from "./_components/bookings-list"

export default async function BookingsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/login")
  }

  const bookingsResult = await getUserFlightBookingsAction(userId)
  if (!bookingsResult.isSuccess) {
    throw new Error("Failed to fetch bookings")
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-4xl font-bold">My Bookings</h1>
      <BookingsList bookings={bookingsResult.data} userId={userId} />
    </div>
  )
}
