"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { usePathname, useSearchParams } from "next/navigation"
import { AdminButton } from "@/components/admin/admin-buttons"
import { getProfileAction } from "@/actions/db/profiles-actions"
import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import {
  getRaceByIdAction,
  getRaceBySlugAction
} from "@/actions/db/races-actions"

export function RacesBreadcrumb() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isMapView = pathname.endsWith("/map")
  const isRacesPath = pathname.startsWith("/races")
  const [isAdmin, setIsAdmin] = useState(false)
  const [raceName, setRaceName] = useState<string>()
  const { userId } = useAuth()
  const showAdmin = !searchParams.has("noadmin")

  // Extract race ID or slug from pathname
  const match = pathname.match(/\/races\/([^\/]+)/)
  const raceIdentifier = match ? match[1] : null

  useEffect(() => {
    async function checkAdmin() {
      if (userId) {
        const result = await getProfileAction(userId)
        if (result.isSuccess) {
          setIsAdmin(result.data.isAdmin)
        }
      }
    }
    checkAdmin()
  }, [userId])

  useEffect(() => {
    async function fetchRaceName() {
      if (!raceIdentifier) return

      // If identifier ends in 2025, try slug first
      if (raceIdentifier.endsWith("2025")) {
        // Try by slug first
        const raceBySlug = await getRaceBySlugAction(raceIdentifier)
        if (raceBySlug.isSuccess) {
          setRaceName(raceBySlug.data.name)
          return
        }

        // Fallback to ID if slug fails
        const raceById = await getRaceByIdAction(raceIdentifier)
        if (raceById.isSuccess) {
          setRaceName(raceById.data.name)
        }
      } else {
        // For other cases, try ID first
        const raceById = await getRaceByIdAction(raceIdentifier)
        if (raceById.isSuccess) {
          setRaceName(raceById.data.name)
          return
        }

        // Fallback to slug if ID fails
        const raceBySlug = await getRaceBySlugAction(raceIdentifier)
        if (raceBySlug.isSuccess) {
          setRaceName(raceBySlug.data.name)
        }
      }
    }

    if (raceIdentifier) {
      fetchRaceName()
    }
  }, [raceIdentifier])

  const formatRaceName = (name: string) => {
    // For mobile view
    if (window.innerWidth < 640) {
      // Replace "Grand Prix 2025" with "GP"
      name = name.replace(/Grand Prix \d{4}/, "GP")
      // Replace "Emilia Romagna" with "Imola"
      name = name.replace("Emilia Romagna", "Imola")
    }
    return name
  }

  return (
    <div className="flex size-full items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/races">F1 Calendar</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/races">Races</BreadcrumbLink>
          </BreadcrumbItem>
          {raceName && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{formatRaceName(raceName)}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
          {isMapView && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Map View</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {isAdmin && isRacesPath && showAdmin && (
        <>
          {/* Desktop buttons */}
          <div className="hidden gap-2 sm:flex">
            <AdminButton type="races" />
            <AdminButton type="circuits" />
          </div>

          {/* Mobile dropdown */}
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
      )}
    </div>
  )
}
