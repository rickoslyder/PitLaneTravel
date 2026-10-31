"use client"

import { useState } from "react"
import Image from "next/image"
import { Flag } from "lucide-react"
import { cn } from "@/lib/utils"

interface RaceCircuitImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  /** Use next/image fill. Otherwise a plain img that fills its parent. */
  fill?: boolean
  sizes?: string
  priority?: boolean
}

function Fallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-muted flex size-full items-center justify-center",
        className
      )}
      data-race-image-fallback=""
    >
      <Flag className="text-muted-foreground size-8" aria-hidden />
    </div>
  )
}

/**
 * Race and circuit photos. A missing or broken URL (null image_url, 404, or
 * a storage error) shows the flag placeholder instead of a failed image.
 */
export function RaceCircuitImage({
  src,
  alt,
  className,
  fill = false,
  sizes,
  priority = false
}: RaceCircuitImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <Fallback className={fill ? undefined : className} />
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
