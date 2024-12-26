"use server"

import { WebhookEvent, clerkClient } from "@clerk/nextjs/server"
import { db } from "@/db/db"
import { profilesTable } from "@/db/schema"
import { eq } from "drizzle-orm"
import { Webhook } from "svix"

// You can find this in your Clerk Dashboard -> Webhooks -> choose your webhook -> Signing Secret
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET as string
if (!WEBHOOK_SECRET) {
  throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable")
}

async function validateRequest(request: Request) {
  const svix_id = request.headers.get("svix-id") ?? ""
  const svix_timestamp = request.headers.get("svix-timestamp") ?? ""
  const svix_signature = request.headers.get("svix-signature") ?? ""

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400
    })
  }

  // Get the body
  const payload = await request.json()
  const body = JSON.stringify(payload)

  try {
    // Create a new Svix instance with your secret
    const wh = new Webhook(WEBHOOK_SECRET)
    const evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature
    }) as WebhookEvent
    return evt
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error occured", {
      status: 400
    })
  }
}

export async function POST(request: Request) {
  const evt = await validateRequest(request)
  if (evt instanceof Response) return evt

  const eventType = evt.type

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id: userId } = evt.data

    try {
      // Get profile from database
      const [profile] = await db
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.userId, userId))

      if (!profile) {
        // Create a new profile if it doesn't exist
        await db.insert(profilesTable).values({
          userId,
          isAdmin: false // Default to non-admin
        })

        // Ensure Clerk metadata matches
        const clerk = await clerkClient()
        await clerk.users.updateUser(userId, {
          publicMetadata: {
            isAdmin: false
          }
        })
      } else {
        // Update Clerk metadata to match database
        const clerk = await clerkClient()
        await clerk.users.updateUser(userId, {
          publicMetadata: {
            isAdmin: profile.isAdmin
          }
        })
      }
    } catch (error) {
      console.error("Error handling user webhook:", error)
      return new Response("Error processing webhook", { status: 500 })
    }
  }

  return new Response("", { status: 201 })
}
