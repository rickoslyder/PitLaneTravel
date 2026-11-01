import { db } from "@/db/db"
import { ticketRedirectsTable } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

const ROBOTS_TAG = "noindex, nofollow"

function withRobotsTag(response: NextResponse) {
  response.headers.set("X-Robots-Tag", ROBOTS_TAG)
  return response
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params
    const { slug } = resolvedParams

    // Find the redirect
    const [redirect] = await db
      .select()
      .from(ticketRedirectsTable)
      .where(eq(ticketRedirectsTable.slug, slug))
      .limit(1)

    if (!redirect) {
      return withRobotsTag(new NextResponse("Not Found", { status: 404 }))
    }

    // Update click count and last clicked timestamp
    await db
      .update(ticketRedirectsTable)
      .set({
        clicks: redirect.clicks + 1,
        lastClickedAt: new Date()
      })
      .where(eq(ticketRedirectsTable.id, redirect.id))

    // Return redirect response with proper status code and URL
    return withRobotsTag(
      NextResponse.redirect(new URL(redirect.destinationUrl), {
        status: 302
      })
    )
  } catch (error) {
    console.error("Error processing redirect:", error)
    return withRobotsTag(new NextResponse("Internal Server Error", { status: 500 }))
  }
}
