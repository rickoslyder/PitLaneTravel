"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getProfileAction } from "@/actions/db/profiles-actions"
import SidebarLink from "@/app/admin/_components/sidebar-link"

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
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            <SidebarLink href="/admin" iconName="home">
              Dashboard
            </SidebarLink>
            <SidebarLink href="/admin/circuits" iconName="circle">
              Circuits
            </SidebarLink>
            <SidebarLink href="/admin/airports" iconName="plane">
              Airports
            </SidebarLink>
          </nav>
        </div>
      </aside>
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  )
}
