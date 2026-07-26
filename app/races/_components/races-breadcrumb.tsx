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

      // UUIDs are primary keys; anything else is a slug (series- and season-agnostic).
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          raceIdentifier
        )
      const [primary, fallback] = isUuid
        ? [getRaceByIdAction, getRaceBySlugAction]
        : [getRaceBySlugAction, getRaceByIdAction]

      const first = await primary(raceIdentifier)
      if (first.isSuccess) {
        setRaceName(first.data.name)
        return
      }
      const second = await fallback(raceIdentifier)
      if (second.isSuccess) {
        setRaceName(second.data.name)
      }
    }

    if (raceIdentifier) {
      fetchRaceName()
    }
  }, [raceIdentifier])

  const formatRaceName = (name: string) => {
    // For mobile view: compact common event nouns across series
    if (window.innerWidth < 640) {
      name = name.replace(/Grand Prix( \d{4})?/, "GP")
      name = name.replace(/E-Prix( \d{4})?/, "E-Prix")
      name = name.replace("Emilia Romagna", "Imola")
    }
    return name
  }

  return (
    <div className="flex size-full items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/races">Race Calendar</BreadcrumbLink>
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
