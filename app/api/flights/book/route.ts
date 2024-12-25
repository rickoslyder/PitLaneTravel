import { NextResponse } from "next/server"
import { Duffel } from "@duffel/api"
import { CreateOrder } from "@duffel/api/types"

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN || ""
})

export async function POST(request: Request) {
  try {
    const { offerId, passengers } = await request.json()

    if (!offerId || !passengers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create order with Duffel
    const orderData: CreateOrder = {
      type: "instant",
      selected_offers: [offerId],
      passengers: passengers.map((passenger: any) => ({
        type: "adult", // You might want to add support for different passenger types
        title: passenger.title,
        gender: passenger.gender,
        given_name: passenger.firstName,
        family_name: passenger.lastName,
        email: passenger.email,
        phone_number: passenger.phone,
        born_on: new Date(passenger.dateOfBirth).toISOString().split("T")[0]
      })),
      payments: [
        {
          type: "balance",
          amount: "100", // You'll need to get the actual amount from the offer
          currency: "USD" // You'll need to get the actual currency from the offer
        }
      ]
    }

    const order = await duffel.orders.create(orderData)
    const orderResponse = order.data

    return NextResponse.json({
      success: true,
      booking: {
        id: orderResponse.id,
        passengers: orderResponse.passengers,
        slices: orderResponse.slices,
        total_amount: orderResponse.total_amount,
        total_currency: orderResponse.total_currency
      }
    })
  } catch (error) {
    console.error("Error booking flight:", error)
    return NextResponse.json(
      { error: "Failed to book flight" },
      { status: 500 }
    )
  }
}
