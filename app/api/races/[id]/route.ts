import { NextResponse } from "next/server"
import { db } from "@/db/db"
import { racesTable } from "@/db/schema"
import { eq } from "drizzle-orm"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const [race] = await db
      .select()
      .from(racesTable)
      .where(eq(racesTable.id, params.id))

    if (!race) {
      return NextResponse.json({ error: "Race not found" }, { status: 404 })
    }

    return NextResponse.json(race)
  } catch (error) {
    console.error("Error fetching race:", error)
    return NextResponse.json({ error: "Failed to fetch race" }, { status: 500 })
  }
}
