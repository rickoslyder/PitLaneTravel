"use client"

import { getProfileAction } from "@/actions/db/profiles-actions"
import { AdminButton } from "@/components/admin/admin-buttons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@clerk/nextjs"
import { Settings } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

/** Admin shortcuts that used to sit in the race toolbar. Hidden for everyone else. */
export function RacesAdminLinks() {
  const searchParams = useSearchParams()
  const { userId } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const showAdmin = !searchParams.has("noadmin")

  useEffect(() => {
    let cancelled = false
    async function checkAdmin() {
      if (!userId) return
      const result = await getProfileAction(userId)
      if (!cancelled && result.isSuccess) {
        setIsAdmin(result.data.isAdmin)
      }
    }
    checkAdmin()
    return () => {
      cancelled = true
    }
  }, [userId])

  if (!isAdmin || !showAdmin) return null

  return (
    <>
      <div className="hidden gap-2 sm:flex">
        <AdminButton type="races" />
        <AdminButton type="circuits" />
      </div>
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 size-4" />
              Admin
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => window.open("/admin/races", "_blank")}
            >
              Open Races admin panel
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open("/admin/circuits", "_blank")}
            >
              Open Circuits admin panel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
