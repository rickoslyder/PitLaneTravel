"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getProfileAction } from "@/actions/db/profiles-actions"
import SidebarLink from "@/app/admin/_components/sidebar-link"
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
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <PitLaneTravelLogo className="h-[4vh]" />
          </div>
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <nav className="flex-1 space-y-4 px-3 py-4">
            <div>
              <div className="mb-2 px-3 text-xs font-semibold uppercase text-gray-400">
                Overview
              </div>
              <div className="space-y-1">
                <SidebarLink href="/admin" iconName="home">
                  Dashboard
                </SidebarLink>
              </div>
            </div>

            <div>
              <div className="mb-2 px-3 text-xs font-semibold uppercase text-gray-400">
                Race Management
              </div>
              <div className="space-y-1">
                <SidebarLink href="/admin/circuits" iconName="circle">
                  Circuits
                </SidebarLink>
                <SidebarLink href="/admin/series" iconName="trophy">
                  Supporting Series
                </SidebarLink>
              </div>
            </div>

            <div>
              <div className="mb-2 px-3 text-xs font-semibold uppercase text-gray-400">
                Travel & Activities
              </div>
              <div className="space-y-1">
                <SidebarLink href="/admin/airports" iconName="plane">
                  Airports
                </SidebarLink>
                <SidebarLink href="/admin/transport" iconName="bus">
                  Transport
                </SidebarLink>
                <SidebarLink href="/admin/attractions" iconName="star">
                  Attractions
                </SidebarLink>
              </div>
            </div>

            <div>
              <div className="mb-2 px-3 text-xs font-semibold uppercase text-gray-400">
                Sales & Bookings
              </div>
              <div className="space-y-1">
                <SidebarLink href="/admin/tickets" iconName="ticket">
                  Tickets
                </SidebarLink>
              </div>
            </div>

            <div>
              <div className="mb-2 px-3 text-xs font-semibold uppercase text-gray-400">
                Community
              </div>
              <div className="space-y-1">
                <SidebarLink href="/admin/reviews" iconName="message-square">
                  Reviews & Tips
                </SidebarLink>
                <SidebarLink href="/admin/meetups" iconName="users">
                  Meetups
                </SidebarLink>
              </div>
            </div>

            <div>
              <div className="mb-2 px-3 text-xs font-semibold uppercase text-gray-400">
                System
              </div>
              <div className="space-y-1">
                <SidebarLink href="/admin/users" iconName="users">
                  Users
                </SidebarLink>
              </div>
            </div>
          </nav>
        </div>
      </aside>
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  )
}
