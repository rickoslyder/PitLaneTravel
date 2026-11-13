"use client"

import { useState } from "react"
import Image from "next/image"
import { isMissingRaceImage } from "@/lib/race-image"
import { RaceImageFallback } from "@/components/races/race-image-fallback"

interface RaceCircuitImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  /** Use next/image fill. Otherwise a plain img that fills its parent. */
  fill?: boolean
  sizes?: string
  priority?: boolean
  /** Square list thumbnail. Grid and home cards use the panel fallback. */
  compact?: boolean
  label?: {
    title?: string | null
    series?: string | null
    country?: string | null
  }
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
  compact = false,
  label
}: RaceCircuitImageProps) {
  const [failed, setFailed] = useState(false)
  const title = label?.title?.trim() || alt

  if (isMissingRaceImage(src) || failed) {
    return (
      <RaceImageFallback
        title={title}
        series={label?.series}
        country={label?.country}
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
        sizes={sizes}
        priority={priority}
        className={className}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <img
      src={src as string}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}

export function raceCardImageLabel(race: {
  name: string
  country?: string | null
  series?: { short_name?: string | null } | null
  circuit?: { name?: string | null; country?: string | null } | null
}) {
  return {
    title: race.circuit?.name || race.name,
    series: race.series?.short_name,
    country: race.country || race.circuit?.country
  }
}
