import { Flag } from "lucide-react"
import { brand } from "@/config/brand"
import { cn } from "@/lib/utils"

interface BrandMarkProps {
  className?: string
}

/**
 * Flag icon plus the existing brand name. No tagline is rendered here.
 */
export function BrandMark({ className }: BrandMarkProps) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2", className)}>
      <Flag aria-hidden="true" className="text-foreground size-7 shrink-0" />
      <span className="truncate text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
        {brand.name}
      </span>
    </span>
  )
}
