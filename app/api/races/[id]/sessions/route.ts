"use server"

import { NextResponse } from "next/server"
import { getSessionSchedulesAction } from "@/actions/db/session-schedules-actions"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const result = await getSessionSchedulesAction(resolvedParams.id)

    if (!result.isSuccess) {
      return NextResponse.json({ error: result.message }, { status: 404 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error fetching session schedules:", error)
    return NextResponse.json(
      { error: "Failed to fetch session schedules" },
      { status: 500 }
    )
  }
}
