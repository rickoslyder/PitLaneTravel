/*
<ai_context>
Contains server actions related to profiles in the DB.
</ai_context>
*/

"use server"

import { db } from "@/db/db"
import {
  InsertProfile,
  profilesTable,
  SelectProfile
} from "@/db/schema/profiles-schema"
import { ActionState } from "@/types"
import { eq } from "drizzle-orm"
import { clerkClient } from "@clerk/nextjs/server"

export async function createProfileAction(
  profile: InsertProfile
): Promise<ActionState<SelectProfile>> {
  try {
    console.log("[Profiles] Creating profile for user:", profile.userId)
    console.log("[Profiles] Profile data:", profile)

    // First check if profile already exists
    const existingProfile = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, profile.userId))
      .limit(1)

    if (existingProfile.length > 0) {
      console.log("[Profiles] Profile already exists for user:", profile.userId)
      return {
        isSuccess: false,
        message: "Profile already exists"
      }
    }

    console.log("[Profiles] No existing profile found, proceeding with creation")

    const query = db.insert(profilesTable).values(profile).returning()
    console.log("[Profiles] Insert query:", query.toSQL())

    const [newProfile] = await query

    console.log("[Profiles] Profile created successfully:", newProfile)
    return {
      isSuccess: true,
      message: "Profile created successfully",
      data: newProfile
    }
  } catch (error) {
    console.error("[Profiles] Error creating profile:", error)
    console.error("[Profiles] Error name:", error instanceof Error ? error.name : "Unknown")
    console.error("[Profiles] Error message:", error instanceof Error ? error.message : "Unknown")
    console.error("[Profiles] Error stack:", error instanceof Error ? error.stack : "Unknown")

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes("duplicate key")) {
        return { isSuccess: false, message: "Profile already exists" }
      }
      if (error.message.includes("relation") || error.message.includes("column")) {
        console.error("[Profiles] Database schema error detected")
        return { 
          isSuccess: false, 
          message: "Database schema error. Please ensure the database is properly initialized." 
        }
      }
    }

    return { isSuccess: false, message: "Failed to create profile" }
  }
}

export async function getProfileByUserIdAction(
  userId: string
): Promise<ActionState<SelectProfile>> {
  try {
    console.log("[Profiles] Getting profile for user:", userId)

    const query = db.select().from(profilesTable).where(eq(profilesTable.userId, userId))
    console.log("[Profiles] Select query:", query.toSQL())

    const [profile] = await query

    if (!profile) {
      console.log("[Profiles] No profile found for user:", userId)
      return { isSuccess: false, message: "Profile not found" }
    }

    console.log("[Profiles] Profile found successfully:", profile)
    return {
      isSuccess: true,
      message: "Profile retrieved successfully",
      data: profile
    }
  } catch (error) {
    console.error("[Profiles] Error getting profile by user id:", error)
    console.error("[Profiles] Error name:", error instanceof Error ? error.name : "Unknown")
    console.error("[Profiles] Error message:", error instanceof Error ? error.message : "Unknown")
    console.error("[Profiles] Error stack:", error instanceof Error ? error.stack : "Unknown")

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes("relation") || error.message.includes("column")) {
        console.error("[Profiles] Database schema error detected")
        return { 
          isSuccess: false, 
          message: "Database schema error. Please ensure the database is properly initialized." 
        }
      }
    }

    return { isSuccess: false, message: "Failed to get profile" }
  }
}

export async function updateProfileAction(
  userId: string,
  data: Partial<InsertProfile>
): Promise<ActionState<SelectProfile>> {
  try {
    console.log("[Profiles] Updating profile for user:", userId)
    console.log("[Profiles] Update data:", data)

    const query = db
      .update(profilesTable)
      .set(data)
      .where(eq(profilesTable.userId, userId))
      .returning()
    console.log("[Profiles] Update query:", query.toSQL())

    const [updatedProfile] = await query

    if (!updatedProfile) {
      console.log("[Profiles] No profile found to update for user:", userId)
      return { isSuccess: false, message: "Profile not found" }
    }

    console.log("[Profiles] Profile updated successfully:", updatedProfile)
    return {
      isSuccess: true,
      message: "Profile updated successfully",
      data: updatedProfile
    }
  } catch (error) {
    console.error("[Profiles] Error updating profile:", error)
    console.error("[Profiles] Error name:", error instanceof Error ? error.name : "Unknown")
    console.error("[Profiles] Error message:", error instanceof Error ? error.message : "Unknown")
    console.error("[Profiles] Error stack:", error instanceof Error ? error.stack : "Unknown")
    return { isSuccess: false, message: "Failed to update profile" }
  }
}

export async function updateProfileByStripeCustomerIdAction(
  stripeCustomerId: string,
  data: Partial<InsertProfile>
): Promise<ActionState<SelectProfile>> {
  try {
    console.log("[Profiles] Updating profile by Stripe customer ID:", stripeCustomerId)
    console.log("[Profiles] Update data:", data)

    const query = db
      .update(profilesTable)
      .set(data)
      .where(eq(profilesTable.stripeCustomerId, stripeCustomerId))
      .returning()
    console.log("[Profiles] Update query:", query.toSQL())

    const [updatedProfile] = await query

    if (!updatedProfile) {
      console.log("[Profiles] No profile found with Stripe customer ID:", stripeCustomerId)
      return {
        isSuccess: false,
        message: "Profile not found by Stripe customer ID"
      }
    }

    console.log("[Profiles] Profile updated successfully:", updatedProfile)
    return {
      isSuccess: true,
      message: "Profile updated by Stripe customer ID successfully",
      data: updatedProfile
    }
  } catch (error) {
    console.error("[Profiles] Error updating profile by stripe customer ID:", error)
    console.error("[Profiles] Error name:", error instanceof Error ? error.name : "Unknown")
    console.error("[Profiles] Error message:", error instanceof Error ? error.message : "Unknown")
    console.error("[Profiles] Error stack:", error instanceof Error ? error.stack : "Unknown")
    return {
      isSuccess: false,
      message: "Failed to update profile by Stripe customer ID"
    }
  }
}

export async function deleteProfileAction(
  userId: string
): Promise<ActionState<void>> {
  try {
    console.log("[Profiles] Deleting profile for user:", userId)

    const query = db.delete(profilesTable).where(eq(profilesTable.userId, userId))
    console.log("[Profiles] Delete query:", query.toSQL())

    await query

    console.log("[Profiles] Profile deleted successfully")
    return {
      isSuccess: true,
      message: "Profile deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("[Profiles] Error deleting profile:", error)
    console.error("[Profiles] Error name:", error instanceof Error ? error.name : "Unknown")
    console.error("[Profiles] Error message:", error instanceof Error ? error.message : "Unknown")
    console.error("[Profiles] Error stack:", error instanceof Error ? error.stack : "Unknown")
    return { isSuccess: false, message: "Failed to delete profile" }
  }
}

export async function syncAdminStatusAction(
  userId: string
): Promise<ActionState<void>> {
  try {
    // Get profile from database
    const [profile] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, userId))

    if (!profile) {
      return {
        isSuccess: false,
        message: "Profile not found"
      }
    }

    // Update Clerk metadata to match database
    const clerk = await clerkClient()
    await clerk.users.updateUser(userId, {
      publicMetadata: {
        isAdmin: profile.isAdmin
      }
    })

    return {
      isSuccess: true,
      message: "Admin status synced successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error syncing admin status:", error)
    return {
      isSuccess: false,
      message: "Failed to sync admin status"
    }
  }
}

export async function getProfileAction(
  userId: string
): Promise<ActionState<{ isAdmin: boolean }>> {
  try {
    console.log("[ProfilesAction] Getting profile for user:", userId)

    const query = db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, userId))
    
    console.log("[ProfilesAction] Query SQL:", query.toSQL())

    const [profile] = await query
    console.log("[ProfilesAction] Query result:", profile)

    if (!profile) {
      console.log("[ProfilesAction] No profile found for user:", userId)
      return {
        isSuccess: false,
        message: "Profile not found"
      }
    }

    console.log("[ProfilesAction] Profile found with admin status:", profile.isAdmin)
    return {
      isSuccess: true,
      message: "Profile retrieved successfully",
      data: {
        isAdmin: profile.isAdmin
      }
    }
  } catch (error) {
    console.error("[ProfilesAction] Error getting profile:", error)
    console.error("[ProfilesAction] Error name:", error instanceof Error ? error.name : "Unknown")
    console.error("[ProfilesAction] Error message:", error instanceof Error ? error.message : "Unknown")
    console.error("[ProfilesAction] Error stack:", error instanceof Error ? error.stack : "Unknown")
    return {
      isSuccess: false,
      message: "Failed to get profile"
    }
  }
}
