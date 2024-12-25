"use client"

import { Button } from "@/components/ui/button"
import { LayoutGrid, List } from "lucide-react"

interface ViewSwitcherProps {
  /** The current view type */
  viewType: "grid" | "list"
  /** Callback when the view type changes */
  onViewChange: (view: "grid" | "list") => void
}

export function ViewSwitcher({ viewType, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={viewType === "grid" ? "default" : "ghost"}
        size="icon"
        onClick={() => onViewChange("grid")}
        aria-label="Grid view"
        aria-pressed={viewType === "grid"}
      >
        <LayoutGrid className="size-4" />
      </Button>
      <Button
        variant={viewType === "list" ? "default" : "ghost"}
        size="icon"
        onClick={() => onViewChange("list")}
        aria-label="List view"
        aria-pressed={viewType === "list"}
      >
        <List className="size-4" />
      </Button>
    </div>
  )
}
