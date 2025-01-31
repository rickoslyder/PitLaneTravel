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
import posthog from "posthog-js"
import AnimatedGradientText from "../magicui/animated-gradient-text"
import HeroVideoDialog from "../magicui/hero-video-dialog"
import supabaseLoader from "@/supabase-image-loader"
import Image from "next/image"
import { useScroll, useTransform } from "framer-motion"
import { useNextRace } from "@/hooks/useNextRace"

const HeroImage = ({
  height,
  width
}: {
  height?: number | null
  width?: number | null
}) => {
  return (
    <Image
      alt="Hero Image"
      src={supabaseLoader({
        src: "assets/homepage/hero.jpeg",
        height: height ? height : 1080,
        width: width ? width : 1920,
        quality: 100
      })}
      priority={true}
      className="absolute size-full object-cover"
      sizes="100vw"
      fill
    />
  )
}

export const HeroSection = () => {
  const handleGetStartedClick = () => {
    posthog.capture("clicked_get_started")
  }

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
                2025 F1 Season Now Available
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
                Experience F1
                <br />
                <span className="text-red-500 drop-shadow-lg [text-shadow:_0_2px_10px_rgba(0,0,0,0.5)]">
                  Like Never Before
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
                Turn race weekend planning into pure excitement: insider
                knowledge, smart logistics, and local secrets for an
                unforgettable F1 experience.
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
                  <Link href="/races">
                    <FlagIcon className="mr-2 size-4 sm:size-5" />
                    View 2025 Races
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/10 px-6 py-5 text-base text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-xl sm:px-8 sm:py-6 sm:text-lg"
                >
                  <Link href="/packages">
                    <StarIcon className="mr-2 size-4 sm:size-5" />
                    Browse Packages
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
            <h3 className="text-lg font-semibold">24 Race Weekends</h3>
            <p className="text-muted-foreground text-center">
              Experience the thrill of F1 at iconic circuits worldwide
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <MapPin className="size-8 text-[#E10600]" />
            <h3 className="text-lg font-semibold">Global Destinations</h3>
            <p className="text-muted-foreground text-center">
              From Monaco to Melbourne, we've got you covered
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Star className="size-8 text-[#E10600]" />
            <h3 className="text-lg font-semibold">VIP Experiences</h3>
            <p className="text-muted-foreground text-center">
              Access exclusive paddock club and team garage tours
            </p>
          </div>
        </motion.div>
      </section>
    </>
  )
}
