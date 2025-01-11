"use client"

import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

interface AdminButtonsProps {
  type: "races" | "trips" | "circuits"
  className?: string
}

export function AdminButton({ type, className }: AdminButtonsProps) {
  const getHref = () => {
    switch (type) {
      case "races":
        return "/admin/races"
      case "trips":
        return "/admin/trips"
      case "circuits":
        return "/admin/circuits"
      default:
        return "/admin"
    }
  }

  const getLabel = () => {
    switch (type) {
      case "races":
        return "Races Admin"
      case "trips":
        return "Trips Admin"
      case "circuits":
        return "Circuits Admin"
      default:
        return "Admin"
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={() => window.open(getHref(), "_blank")}
    >
      <Settings className="mr-2 size-4" />
      {getLabel()}
    </Button>
  )
}
