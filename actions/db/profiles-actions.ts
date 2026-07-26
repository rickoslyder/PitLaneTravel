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
import { requireAdmin, AuthError } from "@/lib/auth"
import { log } from "@/lib/log"

export async function createProfileAction(
  profile: InsertProfile
): Promise<ActionState<SelectProfile>> {
  try {
    log.debug("[Profiles] Creating profile for user:", profile.userId)
    log.debug("[Profiles] Profile data:", profile)

    // First check if profile already exists
    const existingProfile = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, profile.userId))
      .limit(1)

    if (existingProfile.length > 0) {
      log.debug("[Profiles] Profile already exists for user:", profile.userId)
      return {
        isSuccess: false,
        message: "Profile already exists"
      }
    }

    log.debug("[Profiles] No existing profile found, proceeding with creation")

    const query = db.insert(profilesTable).values(profile).returning()
    log.debug("[Profiles] Insert query:", query.toSQL())

    const [newProfile] = await query

    log.debug("[Profiles] Profile created successfully:", newProfile)
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
    log.debug("[Profiles] Getting profile for user:", userId)

    const query = db.select().from(profilesTable).where(eq(profilesTable.userId, userId))
    log.debug("[Profiles] Select query:", query.toSQL())

    const [profile] = await query

    if (!profile) {
      log.debug("[Profiles] No profile found for user:", userId)
      return { isSuccess: false, message: "Profile not found" }
    }

    log.debug("[Profiles] Profile found successfully:", profile)
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
    log.debug("[Profiles] Updating profile for user:", userId)
    log.debug("[Profiles] Update data:", data)

    const query = db
      .update(profilesTable)
      .set(data)
      .where(eq(profilesTable.userId, userId))
      .returning()
    log.debug("[Profiles] Update query:", query.toSQL())

    const [updatedProfile] = await query

    if (!updatedProfile) {
      log.debug("[Profiles] No profile found to update for user:", userId)
      return { isSuccess: false, message: "Profile not found" }
    }

    log.debug("[Profiles] Profile updated successfully:", updatedProfile)
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
    log.debug("[Profiles] Updating profile by Stripe customer ID:", stripeCustomerId)
    log.debug("[Profiles] Update data:", data)

    const query = db
      .update(profilesTable)
      .set(data)
      .where(eq(profilesTable.stripeCustomerId, stripeCustomerId))
      .returning()
    log.debug("[Profiles] Update query:", query.toSQL())

    const [updatedProfile] = await query

    if (!updatedProfile) {
      log.debug("[Profiles] No profile found with Stripe customer ID:", stripeCustomerId)
      return {
        isSuccess: false,
        message: "Profile not found by Stripe customer ID"
      }
    }

    log.debug("[Profiles] Profile updated successfully:", updatedProfile)
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
    log.debug("[Profiles] Deleting profile for user:", userId)

    const query = db.delete(profilesTable).where(eq(profilesTable.userId, userId))
    log.debug("[Profiles] Delete query:", query.toSQL())

    await query

    log.debug("[Profiles] Profile deleted successfully")
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
    log.debug("[ProfilesAction] Getting profile for user:", userId)

    const query = db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, userId))
    
    log.debug("[ProfilesAction] Query SQL:", query.toSQL())

    const [profile] = await query
    log.debug("[ProfilesAction] Query result:", profile)

    if (!profile) {
      log.debug("[ProfilesAction] No profile found for user:", userId)
      return {
        isSuccess: false,
        message: "Profile not found"
      }
    }

    log.debug("[ProfilesAction] Profile found with admin status:", profile.isAdmin)
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

export async function toggleAdminAction(
  userId: string
): Promise<ActionState<SelectProfile>> {
  try {
    // Only an existing admin may change admin status (prevents privilege escalation).
    await requireAdmin()

    const [profile] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, userId))
      .limit(1)

    if (!profile) {
      return {
        isSuccess: false,
        message: "Profile not found"
      }
    }

    const [updatedProfile] = await db
      .update(profilesTable)
      .set({ isAdmin: !profile.isAdmin })
      .where(eq(profilesTable.userId, userId))
      .returning()

    return {
      isSuccess: true,
      message: `Admin status ${updatedProfile.isAdmin ? "enabled" : "disabled"}`,
      data: updatedProfile
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { isSuccess: false, message: error.message }
    }
    console.error("Error toggling admin status:", error)
    return { isSuccess: false, message: "Failed to toggle admin status" }
  }
}

export async function updateMembershipAction(
  userId: string,
  membership: "free" | "pro"
): Promise<ActionState<SelectProfile>> {
  try {
    // Admin-only: Stripe-driven membership changes go through
    // updateProfileByStripeCustomerIdAction, not this action.
    await requireAdmin()

    const [updatedProfile] = await db
      .update(profilesTable)
      .set({ membership })
      .where(eq(profilesTable.userId, userId))
      .returning()

    return {
      isSuccess: true,
      message: `Membership updated to ${membership}`,
      data: updatedProfile
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { isSuccess: false, message: error.message }
    }
    console.error("Error updating membership:", error)
    return { isSuccess: false, message: "Failed to update membership" }
  }
}
