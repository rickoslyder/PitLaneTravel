"use client"

import { useEffect, useState } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { getIsAdmin } from "./admin-check-server"

export default function AdminCheckWrapper() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const showAdmin =
    !searchParams.get("noadmin") && pathname.startsWith("/trips")
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (showAdmin) {
      getIsAdmin().then(result => setIsAdmin(result))
    }
  }, [showAdmin])

  if (!showAdmin || !isAdmin) return null

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.open("/admin/trips", "_blank")}
    >
      <Settings className="mr-2 size-4" />
      Trips Admin
    </Button>
  )
}
