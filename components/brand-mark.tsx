import { Flag } from "lucide-react"
import { brand } from "@/config/brand"
import { cn } from "@/lib/utils"

interface BrandMarkProps {
  showTagline?: boolean
  className?: string
}

/**
 * Single logo mark: the flag icon, the temporary name, and brand.tagline.
 * The black-square lockup and the baked sidebar wordmark are not used.
 */
export function BrandMark({ showTagline = false, className }: BrandMarkProps) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2", className)}>
      <Flag aria-hidden="true" className="text-foreground size-7 shrink-0" />
      <span className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
        <span className="truncate text-base font-semibold tracking-tight">
          {brand.name}
        </span>
        {showTagline ? (
          <span className="text-muted-foreground max-w-[16rem] text-xs font-normal leading-snug">
            {brand.tagline}
          </span>
        ) : null}
      </span>
    </span>
  )
}
