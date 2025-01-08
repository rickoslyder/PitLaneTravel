"use server"

import { nanoid } from "nanoid"
import { db } from "@/db/db"
import { ticketRedirectsTable } from "@/db/schema"
import { eq } from "drizzle-orm"
import { ActionState } from "@/types"
import { headers } from "next/headers"

export async function generateMaskedUrlAction(
  ticketId: number,
  destinationUrl: string
): Promise<ActionState<string>> {
  try {
    const headersList = await headers()
    const host = headersList.get("host") || ""
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https"
    const baseUrl = `${protocol}://${host}`

    // Check if we already have a redirect for this ticket
    const [existingRedirect] = await db
      .select()
      .from(ticketRedirectsTable)
      .where(eq(ticketRedirectsTable.ticketId, ticketId))
      .limit(1)

    if (existingRedirect) {
      // Update destination URL if it changed
      if (existingRedirect.destinationUrl !== destinationUrl) {
        await db
          .update(ticketRedirectsTable)
          .set({ destinationUrl })
          .where(eq(ticketRedirectsTable.id, existingRedirect.id))
      }
      return {
        isSuccess: true,
        message: "Retrieved existing masked URL",
        data: `${baseUrl}/redirect/${existingRedirect.slug}`
      }
    }

    // Generate a new redirect
    const slug = nanoid(10) // 10 character random ID
    await db.insert(ticketRedirectsTable).values({
      ticketId,
      slug,
      destinationUrl
    })

    return {
      isSuccess: true,
      message: "Generated new masked URL",
      data: `${baseUrl}/redirect/${slug}`
    }
  } catch (error) {
    console.error("Error generating masked URL:", error)
    return {
      isSuccess: false,
      message: "Failed to generate masked URL"
    }
  }
} 