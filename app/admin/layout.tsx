"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getProfileAction } from "@/actions/db/profiles-actions"

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
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-4xl font-bold">Admin Panel</h1>
      <nav className="mb-8">
        <ul className="flex space-x-4">
          <li>
            <a href="/admin/circuits" className="text-blue-500 hover:underline">
              Circuits
            </a>
          </li>
          <li>
            <a href="/admin/airports" className="text-blue-500 hover:underline">
              Airports
            </a>
          </li>
        </ul>
      </nav>
      {children}
    </div>
  )
}
