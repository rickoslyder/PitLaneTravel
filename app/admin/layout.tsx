"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getProfileAction } from "@/actions/db/profiles-actions"

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkAdmin() {
      if (!isLoaded || !user) {
        setIsChecking(false)
        return
      }

      try {
        const result = await getProfileAction(user.id)
        if (!result.isSuccess || !result.data.isAdmin) {
          setError("You do not have permission to access this area")
          router.push("/")
        }
      } catch (err) {
        setError("Error checking permissions")
        console.error("Error checking admin status:", err)
      } finally {
        setIsChecking(false)
      }
    }

    checkAdmin()
  }, [isLoaded, user, router])

  if (!isLoaded || isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="size-8 animate-spin rounded-full border-y-2 border-gray-900"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push("/")
    return null
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
