"use server"

import { auth } from "@clerk/nextjs/server"
import { getProfileAction } from "@/actions/db/profiles-actions"
import { AdminButton } from "@/components/admin/admin-buttons"

export async function AdminCheck() {
  const { userId } = await auth()
  let isAdmin = false

  if (userId) {
    const result = await getProfileAction(userId)
    if (result.isSuccess) {
      isAdmin = result.data.isAdmin
    }
  }

  if (!isAdmin) return null

  return <AdminButton type="trips" />
}
