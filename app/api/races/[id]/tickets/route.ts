import { NextResponse } from "next/server"
import { getRaceTicketsAction } from "@/actions/db/tickets-actions"
import { getRacePackagesAction } from "@/actions/db/ticket-packages-actions"
import { features } from "@/config/features"
import { visiblePublicTickets } from "@/lib/ticket-affiliate"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  try {
    const [ticketsResult, packagesResult] = await Promise.all([
      getRaceTicketsAction(resolvedParams.id),
      getRacePackagesAction(resolvedParams.id)
    ])

    if (!ticketsResult.isSuccess || !packagesResult.isSuccess) {
      return NextResponse.json(
        { error: "Failed to fetch tickets or packages" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      tickets: visiblePublicTickets(
        ticketsResult.data,
        features.affiliateTicketsEnabled
      ),
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
