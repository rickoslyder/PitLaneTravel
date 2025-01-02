"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getProfileAction } from "@/actions/db/profiles-actions"
import { AdminSidebar } from "./_components/admin-sidebar"
import PitLaneTravelLogo from "@/logos/PitLaneTravelLogo"

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/")
  }

  const result = await getProfileAction(userId)
  if (!result.isSuccess || !result.data.isAdmin) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  )
}
