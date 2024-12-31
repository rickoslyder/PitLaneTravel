import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { updateAllCircuitTimezonesAction } from "@/actions/db/circuits-actions"

export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const result = await updateAllCircuitTimezonesAction()

    if (!result.isSuccess) {
      return new NextResponse(result.message, { status: 500 })
    }

    return NextResponse.json({
      message: "Successfully updated all circuit timezones"
    })
  } catch (error) {
    console.error("Error updating circuit timezones:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
