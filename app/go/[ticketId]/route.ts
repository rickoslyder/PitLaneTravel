import { nanoid } from "nanoid"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/db/db"
import { ticketRedirectsTable, ticketsTable } from "@/db/schema"
import { sellerRedirectUrl } from "@/lib/ticket-go"

export const dynamic = "force-dynamic"

const ROBOTS = "noindex"

function notFound() {
  return new NextResponse("Not Found", {
    status: 404,
    headers: { "X-Robots-Tag": ROBOTS }
  })
}

/**
 * Buyer click. The race page links here directly, so the new tab opens
 * inside the click. The redirect row is written on this request, never
 * while the tickets tab is rendered.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const { ticketId: rawId } = await params
  const ticketId = Number(rawId)
  if (!Number.isInteger(ticketId) || ticketId <= 0) return notFound()

  try {
    const [ticket] = await db
      .select({ resellerUrl: ticketsTable.resellerUrl })
      .from(ticketsTable)
      .where(eq(ticketsTable.id, ticketId))
      .limit(1)

    const destination = sellerRedirectUrl(ticket?.resellerUrl)
    if (!destination) return notFound()

    const [existing] = await db
      .select()
      .from(ticketRedirectsTable)
      .where(eq(ticketRedirectsTable.ticketId, ticketId))
      .limit(1)

    const clickedAt = new Date()
    if (existing) {
      await db
        .update(ticketRedirectsTable)
        .set({
          destinationUrl: destination,
          clicks: existing.clicks + 1,
          lastClickedAt: clickedAt
        })
        .where(eq(ticketRedirectsTable.id, existing.id))
    } else {
      await db.insert(ticketRedirectsTable).values({
        ticketId,
        slug: nanoid(10),
        destinationUrl: destination,
        clicks: 1,
        lastClickedAt: clickedAt
      })
    }

    return NextResponse.redirect(destination, {
      status: 302,
      headers: { "X-Robots-Tag": ROBOTS }
    })
  } catch (error) {
    console.error("Error opening ticket seller:", error)
    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: { "X-Robots-Tag": ROBOTS }
    })
  }
}
