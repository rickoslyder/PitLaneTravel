"use client"

import { useState } from "react"
import Image from "next/image"
import { isMissingRaceImage } from "@/lib/race-image"
import {
  RaceImageFallback,
  type RaceImageFallbackProps
} from "@/components/races/race-image-fallback"

interface RaceCircuitImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  /** Use next/image fill. Otherwise a plain img that fills its parent. */
  fill?: boolean
  sizes?: string
  priority?: boolean
  quality?: number
  /** Square list thumbnail. Grid and home cards use the panel fallback. */
  compact?: boolean
  /**
   * Designed card shown when `src` is missing. `src` must already be the
   * series-resolved photo from `raceCardImage`.
   */
  fallback?: RaceImageFallbackProps
}

/**
 * Race and circuit photos. A missing, generic, or broken URL shows the
 * designed monochrome card. Real photos still go through next/image.
 */
export function RaceCircuitImage({
  src,
  alt,
  className,
  fill = false,
  sizes,
  priority = false,
  quality = 65,
  compact = false,
  fallback
}: RaceCircuitImageProps) {
  const [failed, setFailed] = useState(false)
  const title = fallback?.title?.trim() || alt

  if (isMissingRaceImage(src) || failed) {
    return (
      <RaceImageFallback
        title={title}
        circuitName={fallback?.circuitName}
        series={fallback?.series}
        accentColor={fallback?.accentColor}
        country={fallback?.country}
        dateLabel={fallback?.dateLabel}
        alt={fallback?.alt || alt}
        compact={compact}
      />
    )
  }

  if (fill) {
    return (
      <Image
        src={src as string}
        alt={alt}
        fill
        sizes={sizes ?? "100vw"}
        quality={quality}
        className={className}
        onError={() => setFailed(true)}
        {...(priority
          ? { priority: true, fetchPriority: "high" as const }
          : {})}
      />
    )
  }

  return (
    <img
      src={src as string}
      alt={alt}
      className={className}
      decoding="async"
      {...(priority
        ? { fetchPriority: "high" as const }
        : { loading: "lazy" as const })}
      onError={() => setFailed(true)}
    />
  )
}
