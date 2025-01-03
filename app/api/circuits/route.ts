import { db } from "@/db/db"
import { circuitsTable } from "@/db/schema"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const circuits = await db.select().from(circuitsTable)
    return NextResponse.json({ data: circuits })
  } catch (error) {
    console.error("Error fetching circuits:", error)
    return NextResponse.json(
      { error: "Failed to fetch circuits" },
      { status: 500 }
    )
  }
}
