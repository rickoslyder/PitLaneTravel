/*
<ai_context>
Server-side authentication and authorization helpers.

These derive the caller's identity from Clerk `auth()` on the server, so that server
actions and route handlers never trust a client-supplied `userId`. Use these instead of
accepting `userId` as an argument for the *authenticated* user.
</ai_context>
*/

import "server-only"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db/db"
import { profilesTable } from "@/db/schema/profiles-schema"
import { eq } from "drizzle-orm"
import { ActionState } from "@/types"

/** Raised by the `require*` helpers when access is denied. */
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403 = 401
  ) {
    super(message)
    this.name = "AuthError"
  }
}

/** The Clerk user id of the caller, or null when signed out. Never throws. */
export async function getAuthedUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId ?? null
}

/** The caller's user id. Throws {@link AuthError} (401) when signed out. */
export async function requireAuth(): Promise<string> {
  const userId = await getAuthedUserId()
  if (!userId) {
    throw new AuthError("Authentication required", 401)
  }
  return userId
}

/**
 * The caller's user id plus admin flag, requiring admin. Throws {@link AuthError}
 * (401 when signed out, 403 when not an admin).
 */
export async function requireAdmin(): Promise<{
  userId: string
  isAdmin: true
}> {
  const userId = await requireAuth()
  const [profile] = await db
    .select({ isAdmin: profilesTable.isAdmin })
    .from(profilesTable)
    .where(eq(profilesTable.userId, userId))
    .limit(1)

  if (!profile?.isAdmin) {
    throw new AuthError("Administrator access required", 403)
  }
  return { userId, isAdmin: true }
}

/** True when the caller is an admin. Never throws. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    await requireAdmin()
    return true
  } catch {
    return false
  }
}

/**
 * Ensure the authenticated caller owns a resource (or is an admin). Throws
 * {@link AuthError} (403) otherwise. Pass the resource's owner id.
 */
export async function assertOwnershipOrAdmin(
  resourceUserId: string
): Promise<string> {
  const userId = await requireAuth()
  if (userId === resourceUserId) return userId
  const [profile] = await db
    .select({ isAdmin: profilesTable.isAdmin })
    .from(profilesTable)
    .where(eq(profilesTable.userId, userId))
    .limit(1)
  if (profile?.isAdmin) return userId
  throw new AuthError("You do not have access to this resource", 403)
}

/**
 * Wrap a server action body so that a thrown {@link AuthError} becomes a uniform
 * {@link ActionState} failure envelope instead of an unhandled exception.
 */
export async function withAuthGuard<T>(
  fn: () => Promise<ActionState<T>>
): Promise<ActionState<T>> {
  try {
    return await fn()
  } catch (error) {
    if (error instanceof AuthError) {
      return { isSuccess: false, message: error.message }
    }
    throw error
  }
}
