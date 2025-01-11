import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db/db"
import { racesTable } from "@/db/schema"
import { eq, or } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id

    // If identifier ends in 2025, try slug first
    const where = id.endsWith("2025")
      ? or(eq(racesTable.slug, id), eq(racesTable.id, id))
      : or(eq(racesTable.id, id), eq(racesTable.slug, id))

    const [race] = await db.select().from(racesTable).where(where)

    if (!race) {
      return NextResponse.json({ error: "Race not found" }, { status: 404 })
    }

    return NextResponse.json(race)
  } catch (error) {
    console.error("Error fetching race:", error)
    return NextResponse.json({ error: "Failed to fetch race" }, { status: 500 })
  }
}
