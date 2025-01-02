"use server"

import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { duffel } from "@/lib/duffel"
import { createFlightBookingAction } from "@/actions/db/flight-bookings-actions"
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { offerId, passengers, raceId } = body

    // Validate request body
    if (!offerId || !passengers || !Array.isArray(passengers) || !raceId) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    // Validate passengers
    const errors: string[] = []
    for (const passenger of passengers) {
      if (!passenger.title) errors.push("Title is required")
      if (!passenger.given_name) errors.push("First name is required")
      if (!passenger.family_name) errors.push("Last name is required")
      if (!passenger.email) errors.push("Email is required")
      if (!passenger.phone_number) {
        errors.push("Phone number is required")
      } else {
        try {
          // Validate phone number format
          if (!isValidPhoneNumber(passenger.phone_number)) {
            errors.push(
              "Invalid phone number format. Please include country code (e.g., +44)"
            )
          }
        } catch (error) {
          errors.push(
            "Invalid phone number format. Please include country code (e.g., +44)"
          )
        }
      }
      if (!passenger.born_on) errors.push("Date of birth is required")
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Missing or invalid fields", errors },
        { status: 400 }
      )
    }

    // Get the latest offer data
    const { data: offer } = await duffel.offers.get(offerId)

    // Create the order with formatted phone numbers
    const { data: order } = await duffel.orders.create({
      type: "instant",
      selected_offers: [offerId],
      passengers: passengers.map(({ isPhoneValid, ...passenger }) => ({
        ...passenger,
        phone_number: passenger.phone_number
      })),
      payments: [
        {
          type: "balance",
          amount: offer.total_amount,
          currency: offer.total_currency
        }
      ]
    })

    // Ensure IATA codes are available
    const departureIata = offer.slices[0].segments[0].origin.iata_code
    const arrivalIata = offer.slices[0].segments[0].destination.iata_code

    if (!departureIata || !arrivalIata) {
      throw new Error("Missing required IATA codes")
    }

    // Store the booking in the database
    const result = await createFlightBookingAction({
      userId,
      raceId,
      offerId,
      orderId: order.id,
      bookingReference: order.booking_reference,
      status: "confirmed",
      offerData: offer,
      passengerData: passengers.map(
        ({ isPhoneValid, ...passenger }) => passenger
      ),
      departureIata,
      arrivalIata,
      departureCity: offer.slices[0].segments[0].origin.city_name || null,
      arrivalCity: offer.slices[0].segments[0].destination.city_name || null,
      departureTime: new Date(offer.slices[0].segments[0].departing_at),
      arrivalTime: new Date(offer.slices[0].segments[0].arriving_at),
      totalAmount: offer.total_amount,
      totalCurrency: offer.total_currency,
      expiresAt: new Date(offer.expires_at),
      completedAt: new Date()
    })

    if (!result.isSuccess || !result.data) {
      throw new Error("Failed to create booking record")
    }

    return NextResponse.json({
      success: true,
      message: "Flight booked successfully",
      data: {
        bookingId: result.data.id,
        bookingReference: order.booking_reference
      }
    })
  } catch (error: any) {
    console.error("Error booking flight:", error)

    // Handle Duffel API errors
    if (error.errors && Array.isArray(error.errors)) {
      return NextResponse.json(
        {
          error: "Failed to book flight",
          details: error.errors
            .map((e: any) => e.message || e.title)
            .join(", "),
          errors: error.errors
        },
        { status: 400 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: "Failed to book flight",
        details: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

function formatPhoneNumber(phoneNumber: string): string {
  try {
    // Parse and format the phone number to E.164 format
    const parsedNumber = parsePhoneNumber(phoneNumber)
    if (!parsedNumber) {
      throw new Error("Invalid phone number")
    }
    return parsedNumber.format("E.164") // Returns format like +14155552671
  } catch (error) {
    console.error("Error formatting phone number:", error)
    // If parsing fails, return the original number (it will be caught by validation)
    return phoneNumber
  }
}
