import { NextResponse } from "next/server"
import { getRaceTicketsAction } from "@/actions/db/tickets-actions"
import { getRacePackagesAction } from "@/actions/db/ticket-packages-actions"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [ticketsResult, packagesResult] = await Promise.all([
      getRaceTicketsAction(params.id),
      getRacePackagesAction(params.id)
    ])

    if (!ticketsResult.isSuccess || !packagesResult.isSuccess) {
      return NextResponse.json(
        { error: "Failed to fetch tickets or packages" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      tickets: ticketsResult.data,
      packages: packagesResult.data
    })
  } catch (error) {
    console.error("Error fetching tickets and packages:", error)
    return NextResponse.json(
      { error: "Failed to fetch tickets and packages" },
      { status: 500 }
    )
  }
}
