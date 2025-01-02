"use server"

import { db } from "@/db/db"
import { flightBookingsTable, tripsTable, bookingStatusEnum } from "@/db/schema"
import { InsertFlightBooking, SelectFlightBooking } from "@/db/schema"
import { ActionState } from "@/types"
import { eq, and, lt, gte, desc } from "drizzle-orm"
import { SQL } from "drizzle-orm"

// Shared types and utilities
interface FlightDetails {
  outbound: {
    departure: string
    arrival: string
    layovers: string[]
    bookingReference: string | null
    baggageAllowance: string | null
  } | null
  return: {
    departure: string
    arrival: string
    layovers: string[]
    bookingReference: string | null
    baggageAllowance: string | null
  } | null
}

// Helper function to format location with code
function formatLocation(city: string | null | undefined, code: string | null | undefined): string {
  if (!code) return "Unknown"
  return city ? `${city} (${code})` : code
}

// Helper function to extract city and code from location object
function extractLocationDetails(location: any): { city: string | null; code: string | null } {
  if (!location) return { city: null, code: null }
  
  let city = null
  let code = null

  if (typeof location === "string") {
    return { city: location, code: location }
  }

  // Try to get city name
  if (location.city?.name) {
    city = location.city.name
  } else if (location.city_name) {
    city = location.city_name
  } else if (location.name) {
    city = location.name
  }

  // Try to get airport code
  code = location.iata_code || null

  return { city, code }
}

// Helper function to transform flight data
function transformFlightData(booking: SelectFlightBooking): FlightDetails {
  const offerData = booking.offerData as any
  const slices = offerData?.slices || []

  // Create flight details object
  const flightDetails: FlightDetails = {
    outbound: null,
    return: null
  }

  // Handle outbound flight
  if (booking.departureCity || booking.departureIata) {
    flightDetails.outbound = {
      departure: `${formatLocation(booking.departureCity, booking.departureIata)} ${new Date(booking.departureTime).toLocaleTimeString()}`,
      arrival: `${formatLocation(booking.arrivalCity, booking.arrivalIata)} ${new Date(booking.arrivalTime).toLocaleTimeString()}`,
      layovers: [],
      bookingReference: booking.bookingReference || null,
      baggageAllowance: null
    }
  } else if (slices[0]) {
    const { city: depCity, code: depCode } = extractLocationDetails(slices[0].departure)
    const { city: arrCity, code: arrCode } = extractLocationDetails(slices[0].arrival)

    flightDetails.outbound = {
      departure: `${formatLocation(depCity, depCode)} ${new Date(slices[0].departure.datetime).toLocaleTimeString()}`,
      arrival: `${formatLocation(arrCity, arrCode)} ${new Date(slices[0].arrival.datetime).toLocaleTimeString()}`,
      layovers: slices[0].segments.length > 1 ? slices[0].segments.slice(0, -1).map((segment: any) => {
        const { city, code } = extractLocationDetails(segment.arrival)
        return formatLocation(city, code)
      }) : [],
      bookingReference: booking.bookingReference || null,
      baggageAllowance: null
    }
  }

  // Handle return flight
  if (slices[1]) {
    const segment = slices[1].segments[0]
    if (segment) {
      const { city: depCity, code: depCode } = extractLocationDetails(segment.origin)
      const { city: arrCity, code: arrCode } = extractLocationDetails(segment.destination)
      const destinationTime = segment.arriving_at || slices[1].arrival?.datetime

      flightDetails.return = {
        departure: `${formatLocation(depCity, depCode)} ${new Date(segment.departing_at || slices[1].departure?.datetime).toLocaleTimeString()}`,
        arrival: `${formatLocation(arrCity, arrCode)} ${new Date(destinationTime).toLocaleTimeString()}`,
        layovers: slices[1].segments.length > 1 ? slices[1].segments.slice(0, -1).map((seg: any) => {
          const { city, code } = extractLocationDetails(seg.destination)
          return formatLocation(city, code)
        }) : [],
        bookingReference: booking.bookingReference || null,
        baggageAllowance: null
      }
    }
  }

  return flightDetails
}

// Create a new flight booking
export async function createFlightBookingAction(
  booking: InsertFlightBooking
): Promise<ActionState<SelectFlightBooking>> {
  try {
    // Validate required fields
    if (!booking.userId || !booking.raceId || !booking.offerId) {
      throw new Error("Missing required fields")
    }

    const [newBooking] = await db
      .insert(flightBookingsTable)
      .values(booking)
      .returning()

    return {
      isSuccess: true,
      message: "Flight booking created successfully",
      data: newBooking
    }
  } catch (error) {
    console.error("Error creating flight booking:", error)
    return { isSuccess: false, message: "Failed to create flight booking" }
  }
}

// Get a flight booking by ID
export async function getFlightBookingByIdAction(
  id: string
): Promise<ActionState<SelectFlightBooking | undefined>> {
  try {
    const [booking] = await db
      .select()
      .from(flightBookingsTable)
      .where(eq(flightBookingsTable.id, id))
      .limit(1)

    return {
      isSuccess: true,
      message: "Flight booking retrieved successfully",
      data: booking
    }
  } catch (error) {
    console.error("Error getting flight booking:", error)
    return { isSuccess: false, message: "Failed to get flight booking" }
  }
}

// Get all flight bookings for a user
export async function getUserFlightBookingsAction(
  userId: string
): Promise<ActionState<SelectFlightBooking[]>> {
  try {
    const bookings = await db
      .select()
      .from(flightBookingsTable)
      .where(eq(flightBookingsTable.userId, userId))
      .orderBy(desc(flightBookingsTable.createdAt))

    return {
      isSuccess: true,
      message: "Flight bookings retrieved successfully",
      data: bookings
    }
  } catch (error) {
    console.error("Error getting user flight bookings:", error)
    return { isSuccess: false, message: "Failed to get user flight bookings" }
  }
}

// Get all flight bookings for a race
export async function getRaceFlightBookingsAction(
  raceId: string
): Promise<ActionState<SelectFlightBooking[]>> {
  try {
    const bookings = await db
      .select()
      .from(flightBookingsTable)
      .where(eq(flightBookingsTable.raceId, raceId))
      .orderBy(desc(flightBookingsTable.createdAt))

    return {
      isSuccess: true,
      message: "Race flight bookings retrieved successfully",
      data: bookings
    }
  } catch (error) {
    console.error("Error getting race flight bookings:", error)
    return { isSuccess: false, message: "Failed to get race flight bookings" }
  }
}

// Get pending flight bookings for a user that haven't expired
export async function getPendingFlightBookingsAction(
  userId: string
): Promise<ActionState<SelectFlightBooking[]>> {
  try {
    const now = new Date()
    const bookings = await db
      .select()
      .from(flightBookingsTable)
      .where(
        and(
          eq(flightBookingsTable.userId, userId),
          eq(flightBookingsTable.status, "pending"),
          gte(flightBookingsTable.expiresAt, now)
        )
      )
      .orderBy(desc(flightBookingsTable.createdAt))

    return {
      isSuccess: true,
      message: "Pending flight bookings retrieved successfully",
      data: bookings
    }
  } catch (error) {
    console.error("Error getting pending flight bookings:", error)
    return { isSuccess: false, message: "Failed to get pending flight bookings" }
  }
}

// Update flight booking status
export async function updateFlightBookingStatusAction(
  id: string,
  status: "confirmed" | "failed" | "expired" | "cancelled",
  errorMessage?: string
): Promise<ActionState<SelectFlightBooking>> {
  try {
    const [updatedBooking] = await db
      .update(flightBookingsTable)
      .set({
        status,
        lastErrorMessage: errorMessage,
        completedAt: status === "confirmed" ? new Date() : null,
        updatedAt: new Date()
      })
      .where(eq(flightBookingsTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: `Flight booking ${status} successfully`,
      data: updatedBooking
    }
  } catch (error) {
    console.error("Error updating flight booking status:", error)
    return { isSuccess: false, message: "Failed to update flight booking status" }
  }
}

// Update flight booking with order details
export async function updateFlightBookingOrderAction(
  id: string,
  orderId: string,
  bookingReference: string
): Promise<ActionState<SelectFlightBooking>> {
  try {
    const [updatedBooking] = await db
      .update(flightBookingsTable)
      .set({
        orderId,
        bookingReference,
        status: "confirmed",
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(flightBookingsTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Flight booking order updated successfully",
      data: updatedBooking
    }
  } catch (error) {
    console.error("Error updating flight booking order:", error)
    return { isSuccess: false, message: "Failed to update flight booking order" }
  }
}

// Add flight booking to trip
export async function addFlightBookingToTripAction(
  id: string,
  tripId: string
): Promise<ActionState<SelectFlightBooking>> {
  try {
    // First get the booking to access its data
    const [booking] = await db
      .select()
      .from(flightBookingsTable)
      .where(eq(flightBookingsTable.id, id))
      .limit(1)

    if (!booking) {
      throw new Error("Booking not found")
    }

    // Get the current trip data
    const [trip] = await db
      .select()
      .from(tripsTable)
      .where(eq(tripsTable.id, tripId))
      .limit(1)

    if (!trip) {
      throw new Error("Trip not found")
    }

    // Transform the flight data using shared function
    const flightDetails = transformFlightData(booking)

    // Update trip with flight details
    await db
      .update(tripsTable)
      .set({
        flights: flightDetails,
        updatedAt: new Date()
      })
      .where(eq(tripsTable.id, tripId))

    // Mark the booking as added to trip
    const [updatedBooking] = await db
      .update(flightBookingsTable)
      .set({
        tripId,
        addedToTrip: true,
        updatedAt: new Date()
      })
      .where(eq(flightBookingsTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Flight booking added to trip successfully",
      data: updatedBooking
    }
  } catch (error) {
    console.error("Error adding flight booking to trip:", error)
    return { isSuccess: false, message: "Failed to add flight booking to trip" }
  }
}

// Get all flight bookings for a trip
export async function getTripFlightBookingsAction(
  tripId: string
): Promise<ActionState<SelectFlightBooking[]>> {
  try {
    const bookings = await db
      .select()
      .from(flightBookingsTable)
      .where(eq(flightBookingsTable.tripId, tripId))
      .orderBy(desc(flightBookingsTable.createdAt))

    return {
      isSuccess: true,
      message: "Trip flight bookings retrieved successfully",
      data: bookings
    }
  } catch (error) {
    console.error("Error getting trip flight bookings:", error)
    return { isSuccess: false, message: "Failed to get trip flight bookings" }
  }
}

// Mark expired bookings
export async function markExpiredBookingsAction(): Promise<ActionState<void>> {
  try {
    const now = new Date()
    await db
      .update(flightBookingsTable)
      .set({
        status: "expired",
        updatedAt: now
      })
      .where(
        and(
          eq(flightBookingsTable.status, "pending"),
          lt(flightBookingsTable.expiresAt, now)
        )
      )

    return {
      isSuccess: true,
      message: "Expired bookings marked successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error marking expired bookings:", error)
    return { isSuccess: false, message: "Failed to mark expired bookings" }
  }
}

// Get a flight booking by reference
export async function getFlightBookingByReferenceAction(
  bookingReference: string
): Promise<ActionState<SelectFlightBooking | undefined>> {
  try {
    const [booking] = await db
      .select()
      .from(flightBookingsTable)
      .where(eq(flightBookingsTable.bookingReference, bookingReference))
      .limit(1)

    return {
      isSuccess: true,
      message: "Flight booking retrieved successfully",
      data: booking
    }
  } catch (error) {
    console.error("Error getting flight booking:", error)
    return { isSuccess: false, message: "Failed to get flight booking" }
  }
}

// Resync flight bookings with trip
export async function resyncTripFlightBookingsAction(
  tripId: string
): Promise<ActionState<{ flights: FlightDetails }>> {
  try {
    // Get all bookings for this trip
    const bookings = await db
      .select()
      .from(flightBookingsTable)
      .where(eq(flightBookingsTable.tripId, tripId))

    console.log("Found bookings:", bookings.length)

    // Get the trip
    const [trip] = await db
      .select()
      .from(tripsTable)
      .where(eq(tripsTable.id, tripId))
      .limit(1)

    if (!trip) {
      throw new Error("Trip not found")
    }

    if (bookings.length === 0) {
      throw new Error("No bookings found for trip")
    }

    // Get the first booking - it contains both legs
    const booking = bookings[0]
    console.log("Processing booking:", booking.id)

    // Transform the flight data using shared function
    const flightDetails = transformFlightData(booking)
    console.log("Flight details to update:", JSON.stringify(flightDetails, null, 2))

    // Update trip with flight details
    const [updatedTrip] = await db
      .update(tripsTable)
      .set({
        flights: flightDetails,
        updatedAt: new Date()
      })
      .where(eq(tripsTable.id, tripId))
      .returning()

    console.log("Updated trip flights:", JSON.stringify(updatedTrip.flights, null, 2))

    return {
      isSuccess: true,
      message: "Flight bookings resynced with trip successfully",
      data: { flights: updatedTrip.flights as FlightDetails }
    }
  } catch (error) {
    console.error("Error resyncing flight bookings with trip:", error)
    return { 
      isSuccess: false, 
      message: "Failed to resync flight bookings with trip"
    }
  }
} 