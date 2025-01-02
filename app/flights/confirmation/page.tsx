"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getFlightBookingByIdAction } from "@/actions/db/flight-bookings-actions"
import { BookingConfirmationPage } from "@/components/races/travel/BookingConfirmationPage"

interface FlightConfirmationPageProps {
  searchParams: Promise<{
    bookingId?: string
  }>
}

export default async function FlightConfirmationPage({
  searchParams
}: FlightConfirmationPageProps) {
  const resolvedSearchParams = await searchParams
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  if (!resolvedSearchParams.bookingId) {
    redirect("/flights")
  }

  const result = await getFlightBookingByIdAction(
    resolvedSearchParams.bookingId
  )

  if (!result.isSuccess || !result.data) {
    redirect("/flights")
  }

  return (
    <div className="container py-8">
      <BookingConfirmationPage booking={result.data} />
    </div>
  )
}
