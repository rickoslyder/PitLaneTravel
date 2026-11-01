/*
<ai_context>
This client component provides the hero section for the landing page.
</ai_context>
*/

"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  Calendar,
  Flag,
  MapPin,
  Star,
  FlagIcon,
  StarIcon,
  ChevronDownIcon,
  TimerIcon
} from "lucide-react"
import Link from "next/link"
import { captureAnalyticsEvent } from "@/lib/analytics/capture"
import AnimatedGradientText from "../magicui/animated-gradient-text"
import HeroVideoDialog from "../magicui/hero-video-dialog"
import Image from "next/image"
import { useState } from "react"
import { useScroll, useTransform } from "framer-motion"
import { useNextRace } from "@/hooks/useNextRace"
import { siteCopy } from "@/config/site-copy"

const HOME_HERO_SRC = "/images/home-hero.jpg"
const HOME_HERO_ALT =
  "Spectators in red shirts cheering from a grandstand as an open-wheel race car runs down the front straight under a bright sky"

/**
 * Supabase image transformations are not enabled on this project, so the
 * storage render URL returns 403 and next/image reports a 502. The public
 * object is an 8.5MB 5824×3264 JPEG. This is that photo resized to 2400px.
 * The painted scene underneath shows if the file fails to load.
 */
function HeroImage() {
  const [failed, setFailed] = useState(false)

  return (
    <>
      <div
        className="absolute inset-0 overflow-hidden bg-[#16324f]"
        data-hero-fallback=""
        aria-hidden="true"
      >
        <div className="absolute inset-x-0 top-0 h-[58%] bg-gradient-to-b from-[#1e4d78] via-[#7eb6dc] to-[#d5e4f0]" />
        <div className="absolute right-[16%] top-[10%] size-28 rounded-full bg-[#ffe7a3] blur-2xl" />
        <div className="absolute bottom-0 left-0 h-[70%] w-[46%] origin-bottom-left -skew-x-[8deg] bg-gradient-to-br from-[#5c1218] via-[#9b1c24] to-[#c4232c]" />
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-b from-[#3c4046] to-[#121316]" />
        <div className="absolute bottom-[22%] left-[28%] right-[6%] h-px bg-white/80" />
        <div className="absolute bottom-[24%] right-[18%] h-3 w-20 rounded-sm bg-[#e10600] shadow-[0_0_28px_rgba(225,6,0,0.85)]" />
      </div>
      {!failed && (
        <Image
          alt={HOME_HERO_ALT}
          src={HOME_HERO_SRC}
          priority={true}
          className="absolute size-full object-cover"
          sizes="100vw"
          fill
          onError={() => setFailed(true)}
        />
      )}
    </>
  )
}

export const HeroSection = ({
  packagesLive = false
}: {
  packagesLive?: boolean
}) => {
  const copy = siteCopy(packagesLive)
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 0.95])

  const { days, hours, minutes, seconds, raceName, isLoading, nextRace } =
    useNextRace()

  // Format time units to always show two digits
  const formatTimeUnit = (unit: number | undefined) => {
    if (unit === undefined) return "00"
    return unit.toString().padStart(2, "0")
  }

  // Pulsing animation for the separators
  const separatorVariants = {
    animate: {
      opacity: [1, 0.3, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }

  return (
    <>
      <section className="relative flex min-h-[95vh] items-center justify-center overflow-hidden">
        {/* Background image with parallax effect */}
        <motion.div style={{ scale }} className="absolute inset-0">
          <HeroImage />
          {/* Multiple gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
        </motion.div>

        {/* Content */}
        <motion.div
          style={{ opacity }}
          className="container relative z-10 mx-auto px-4"
        >
          <div className="flex flex-col items-center text-center">
            {/* Season badge */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Badge
                variant="outline"
                className="mb-6 border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur-sm sm:mb-8 sm:px-4 sm:py-2 sm:text-sm"
              >
                <FlagIcon className="mr-2 size-3 sm:size-4" />
                F1 · MotoGP · Formula E · IndyCar · WEC
              </Badge>
            </motion.div>

            {/* Main heading with text shadow for depth */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-4 sm:mb-6"
            >
              <h1 className="text-4xl font-bold tracking-tighter text-white drop-shadow-2xl [text-shadow:_0_4px_24px_rgba(0,0,0,0.3)] sm:text-5xl md:text-6xl lg:text-7xl">
                Monaco. Le Mans. The Indy 500.
                <br />
                <span className="text-red-500 drop-shadow-lg [text-shadow:_0_2px_10px_rgba(0,0,0,0.5)]">
                  Go like you&apos;ve been before.
                </span>
              </h1>
            </motion.div>

            {/* Description with glass effect */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-6 max-w-2xl px-4 sm:mb-8 sm:px-0"
            >
              <p className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-base leading-relaxed text-white/90 shadow-xl backdrop-blur-md sm:px-6 sm:py-4 sm:text-lg md:text-xl">
                {copy.heroSubline}
              </p>
            </motion.div>

            {/* Next Race Countdown */}
            {!isLoading && nextRace && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mb-8 w-full px-4 sm:mb-12 sm:px-0"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="group flex w-full flex-col items-center space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:shadow-lg sm:w-auto sm:px-8 sm:py-6">
                    <div className="flex items-center space-x-2 text-white/90">
                      <TimerIcon className="size-4 sm:size-5" />
                      <span className="text-base sm:text-lg">
                        Next Race: <span className="font-bold">{raceName}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      <div className="flex flex-col items-center">
                        <motion.div
                          key={days}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          className="text-2xl font-bold text-white sm:text-3xl md:text-4xl"
                        >
                          {formatTimeUnit(days)}
                        </motion.div>
                        <div className="text-xs text-white/70 sm:text-sm">
                          DAYS
                        </div>
                      </div>
                      <motion.div
                        variants={separatorVariants}
                        animate="animate"
                        className="text-xl font-bold text-white/50 sm:text-2xl"
                      >
                        :
                      </motion.div>
                      <div className="flex flex-col items-center">
                        <motion.div
                          key={hours}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          className="text-2xl font-bold text-white sm:text-3xl md:text-4xl"
                        >
                          {formatTimeUnit(hours)}
                        </motion.div>
                        <div className="text-xs text-white/70 sm:text-sm">
                          HOURS
                        </div>
                      </div>
                      <motion.div
                        variants={separatorVariants}
                        animate="animate"
                        className="text-xl font-bold text-white/50 sm:text-2xl"
                      >
                        :
                      </motion.div>
                      <div className="flex flex-col items-center">
                        <motion.div
                          key={minutes}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          className="text-2xl font-bold text-white sm:text-3xl md:text-4xl"
                        >
                          {formatTimeUnit(minutes)}
                        </motion.div>
                        <div className="text-xs text-white/70 sm:text-sm">
                          MINS
                        </div>
                      </div>
                      <motion.div
                        variants={separatorVariants}
                        animate="animate"
                        className="text-xl font-bold text-white/50 sm:text-2xl"
                      >
                        :
                      </motion.div>
                      <div className="flex flex-col items-center">
                        <motion.div
                          key={seconds}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          className="text-2xl font-bold text-white sm:text-3xl md:text-4xl"
                        >
                          {formatTimeUnit(seconds)}
                        </motion.div>
                        <div className="text-xs text-white/70 sm:text-sm">
                          SECS
                        </div>
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
              </motion.div>
            )}

            {/* Group the buttons and scroll indicator together */}
            <div className="flex w-full flex-col items-center px-4 sm:px-0">
              {/* Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex w-full flex-col justify-center gap-3 sm:flex-row sm:gap-4"
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-red-600 px-6 py-5 text-base text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-red-700 hover:shadow-xl sm:px-8 sm:py-6 sm:text-lg"
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
                  className="border-white/20 bg-white/10 px-6 py-5 text-base text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-xl sm:px-8 sm:py-6 sm:text-lg"
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
              </motion.div>

              {/* Scroll indicator below buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-6 sm:mt-8"
              >
                <ChevronDownIcon className="size-6 animate-bounce text-white/70 sm:size-8" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="bg-background relative px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="container mx-auto grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          <div className="flex flex-col items-center gap-2">
            <Calendar className="size-8 text-[#E10600]" />
            <h3 className="text-lg font-semibold">Every race, one calendar</h3>
            <p className="text-muted-foreground text-center">
              Five series, this season and next.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <MapPin className="size-8 text-[#E10600]" />
            <h3 className="text-lg font-semibold">Know your seat</h3>
            <p className="text-muted-foreground text-center">
              What each grandstand looks onto, before you buy.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Star className="size-8 text-[#E10600]" />
            <h3 className="text-lg font-semibold">Get out on time</h3>
            <p className="text-muted-foreground text-center">
              The quickest way back after the flag, from fans who queued for
              it.
            </p>
          </div>
        </motion.div>
      </section>
    </>
  )
}
