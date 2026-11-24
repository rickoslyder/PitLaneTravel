"use client"

import { useState } from "react"
import Image from "next/image"
import { isMissingRaceImage } from "@/lib/race-image"
import type { RaceImageCredit } from "@/lib/race-series-image"
import { RacePhotoCredit } from "@/components/races/race-photo-credit"
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
  /** Shown with a hosted photograph. Omitted for venue photos without a credit. */
  credit?: RaceImageCredit | null
  /**
   * A real URL failed to load. The parent replaces this image, so the light
   * card is not painted underneath other type.
   */
  onLoadError?: () => void
}

/**
 * Race and circuit photos. A missing, generic, or broken URL shows the
 * designed card unless `onLoadError` takes over a failed load.
 * Real photos still go through next/image.
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
  fallback,
  credit,
  onLoadError
}: RaceCircuitImageProps) {
  const [failed, setFailed] = useState(false)
  const title = fallback?.title?.trim() || alt

  const reportFailure = () => {
    setFailed(true)
    onLoadError?.()
  }

  if (isMissingRaceImage(src) || failed) {
    if (failed && onLoadError) return null
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

  const creditNode = credit ? (
    <div
      className={compact ? undefined : "absolute inset-x-0 bottom-0 z-10"}
      onClick={event => event.stopPropagation()}
    >
      <RacePhotoCredit credit={credit} visuallyHidden={compact} />
    </div>
  ) : null

  if (fill) {
    return (
      <>
        <Image
          src={src as string}
          alt={alt}
          fill
          sizes={sizes ?? "100vw"}
          quality={quality}
          className={className}
          onError={reportFailure}
          {...(priority
            ? { priority: true, fetchPriority: "high" as const }
            : {})}
        />
        {creditNode}
      </>
    )
  }

  return (
    <>
      <img
        src={src as string}
        alt={alt}
        className={className}
        decoding="async"
        {...(priority
          ? { fetchPriority: "high" as const }
          : { loading: "lazy" as const })}
        onError={reportFailure}
      />
      {creditNode}
    </>
  )
}
