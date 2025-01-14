"use server"

import { auth } from "@clerk/nextjs/server"
import { getProfileAction } from "@/actions/db/profiles-actions"

export async function getIsAdmin() {
  const { userId } = await auth()
  let isAdmin = false

  if (userId) {
    const result = await getProfileAction(userId)
    if (result.isSuccess) {
      isAdmin = result.data.isAdmin
    }
  }

  return isAdmin
}
