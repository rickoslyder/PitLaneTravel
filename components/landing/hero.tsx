/*
<ai_context>
Client overlay for the landing hero: headline, countdown slot, and CTAs.
The LCP photograph is the server component in hero-photo.tsx, not this file.
</ai_context>
*/

"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  MapPin,
  Star,
  FlagIcon,
  StarIcon,
  ChevronDownIcon,
  TimerIcon
} from "lucide-react"
import Link from "next/link"
import { captureAnalyticsEvent } from "@/lib/analytics/capture"
import type { ReactNode } from "react"
import { useNextRace, type HeroCountdownSeed } from "@/hooks/useNextRace"
import { siteCopy } from "@/config/site-copy"

function CountdownDigit({ value }: { value: number | undefined }) {
  const label = value === undefined ? "00" : value.toString().padStart(2, "0")
  return (
    <div
      className="text-2xl font-bold tabular-nums text-white sm:text-3xl md:text-4xl"
      suppressHydrationWarning
    >
      {label}
    </div>
  )
}

export function HeroCountdown({ countdown }: { countdown: HeroCountdownSeed }) {
  const { days, hours, minutes, seconds, raceName, isLoading, nextRace } =
    useNextRace({ seed: countdown })

  if (isLoading || !nextRace) return null

  return (
    <div className="mb-1 w-full px-4 sm:mb-12 sm:px-0">
      <div className="flex flex-col items-center space-y-1 sm:space-y-4">
        <div className="group flex w-full flex-col items-center space-y-1 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:shadow-lg sm:w-auto sm:space-y-4 sm:px-8 sm:py-6">
          <div className="flex items-center space-x-2 text-white/90">
            <TimerIcon className="size-4 sm:size-5" />
            <span className="text-base sm:text-lg">
              Next Race: <span className="font-bold">{raceName}</span>
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex min-w-[2.75rem] flex-col items-center sm:min-w-[3.5rem]">
              <CountdownDigit value={days} />
              <div className="text-xs text-white/70 sm:text-sm">DAYS</div>
            </div>
            <div
              className="text-xl font-bold text-white/50 motion-safe:animate-pulse sm:text-2xl"
              aria-hidden="true"
            >
              :
            </div>
            <div className="flex min-w-[2.75rem] flex-col items-center sm:min-w-[3.5rem]">
              <CountdownDigit value={hours} />
              <div className="text-xs text-white/70 sm:text-sm">HOURS</div>
            </div>
            <div
              className="text-xl font-bold text-white/50 motion-safe:animate-pulse sm:text-2xl"
              aria-hidden="true"
            >
              :
            </div>
            <div className="flex min-w-[2.75rem] flex-col items-center sm:min-w-[3.5rem]">
              <CountdownDigit value={minutes} />
              <div className="text-xs text-white/70 sm:text-sm">MINS</div>
            </div>
            <div
              className="text-xl font-bold text-white/50 motion-safe:animate-pulse sm:text-2xl"
              aria-hidden="true"
            >
              :
            </div>
            <div className="flex min-w-[2.75rem] flex-col items-center sm:min-w-[3.5rem]">
              <CountdownDigit value={seconds} />
              <div className="text-xs text-white/70 sm:text-sm">SECS</div>
            </div>
          </div>
          {nextRace.circuit && (
            <div className="flex items-center space-x-2 text-white/90">
              <MapPin className="size-3 sm:size-4" />
              <span className="text-sm font-medium sm:text-lg">
                {nextRace.circuit.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Same box height as the countdown so the hero CTAs do not shift when it streams in. */
export function HeroCountdownFallback() {
  return (
    <div className="mb-1 w-full px-4 sm:mb-12 sm:px-0" aria-hidden="true">
      <div className="invisible flex w-full flex-col items-center space-y-1 p-2 sm:w-auto sm:space-y-4 sm:px-8 sm:py-6">
        <div className="text-base sm:text-lg">&nbsp;</div>
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold sm:text-3xl md:text-4xl">
            &nbsp;
          </div>
          <div className="text-xs sm:text-sm">&nbsp;</div>
        </div>
        <div className="text-sm sm:text-lg">&nbsp;</div>
      </div>
    </div>
  )
}

export const HeroSection = ({
  packagesLive = false,
  children
}: {
  packagesLive?: boolean
  /** Countdown slot. Streamed separately so the LCP image is not behind race data. */
  children?: ReactNode
}) => {
  const copy = siteCopy(packagesLive)

  return (
    <div className="flex flex-col items-center text-center">
      <div>
        <Badge
          variant="outline"
          className="mb-1 border-white/20 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur-sm sm:mb-8 sm:px-4 sm:py-2 sm:text-sm"
        >
          <FlagIcon className="mr-2 size-3 sm:size-4" />
          F1 · MotoGP · Formula E · IndyCar · WEC
        </Badge>
      </div>

      <div className="mb-1 sm:mb-6">
        <h1 className="text-3xl font-bold tracking-tighter text-white drop-shadow-2xl [text-shadow:_0_4px_24px_rgba(0,0,0,0.3)] sm:text-5xl md:text-6xl lg:text-7xl">
          Monaco. Le Mans. The Indy 500.
          <br />
          <span className="text-white drop-shadow-lg [text-shadow:_0_2px_10px_rgba(0,0,0,0.5)]">
            Go like you&apos;ve been before.
          </span>
        </h1>
      </div>

      <div className="mb-1 max-w-2xl px-4 sm:mb-8 sm:px-0">
        <p className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm leading-snug text-white/90 shadow-xl backdrop-blur-md sm:px-6 sm:py-4 sm:text-lg sm:leading-relaxed md:text-xl">
          {copy.heroSubline}
        </p>
      </div>

      {children}

      <div className="flex w-full flex-col items-center px-4 sm:px-0">
        <div
          data-hero-cta-cluster=""
          className="flex w-full flex-col justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Button
            asChild
            size="lg"
            className="bg-brand text-brand-foreground hover:bg-brand-hover px-6 py-3 text-base shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-8 sm:py-6 sm:text-lg"
          >
            <Link
              href="/races"
              onClick={() =>
                captureAnalyticsEvent({
                  event: "hero calendar CTA clicked"
                })
              }
            >
              <FlagIcon className="mr-2 size-4 sm:size-5" />
              Find your race
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/20 bg-white/10 px-6 py-3 text-base text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-xl sm:px-8 sm:py-6 sm:text-lg"
          >
            <Link
              href={packagesLive ? "/packages" : "/races/compare"}
              onClick={() =>
                captureAnalyticsEvent({
                  event: "hero compare CTA clicked"
                })
              }
            >
              <StarIcon className="mr-2 size-4 sm:size-5" />
              {copy.heroSecondaryCta.label}
            </Link>
          </Button>
        </div>

        <div className="mt-2 sm:mt-8">
          <ChevronDownIcon className="size-6 text-white/70 motion-safe:animate-bounce sm:size-8" />
        </div>
      </div>
    </div>
  )
}

export function HeroStats() {
  return (
    <section className="bg-background relative px-4 py-16">
      <div className="container mx-auto grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="flex flex-col items-center gap-2">
          <Calendar className="text-foreground size-8" />
          <h2 className="text-lg font-semibold">Every race, one calendar</h2>
          <p className="text-muted-foreground text-center">
            Five series, this season and next.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <MapPin className="text-foreground size-8" />
          <h2 className="text-lg font-semibold">Know your seat</h2>
          <p className="text-muted-foreground text-center">
            What each grandstand looks onto, before you buy.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Star className="text-foreground size-8" />
          <h2 className="text-lg font-semibold">Get out on time</h2>
          <p className="text-muted-foreground text-center">
            The quickest way back after the flag, from fans who queued for it.
          </p>
        </div>
      </div>
    </section>
  )
}
