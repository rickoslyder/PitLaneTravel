/*
<ai_context>
This client component provides the hero section for the landing page.
</ai_context>
*/

"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Calendar, Flag, MapPin, Star } from "lucide-react"
import Link from "next/link"
import posthog from "posthog-js"
import AnimatedGradientText from "../magicui/animated-gradient-text"
import HeroVideoDialog from "../magicui/hero-video-dialog"

export const HeroSection = () => {
  const handleGetStartedClick = () => {
    posthog.capture("clicked_get_started")
  }

  return (
    <div className="flex flex-col items-center justify-center px-8 pt-32 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center justify-center"
      >
        <AnimatedGradientText>
          <Flag className="inline-block size-4" />
          <hr className="mx-2 h-4 w-px shrink-0 bg-gray-300" />
          <span
            className={cn(
              `animate-gradient inline bg-gradient-to-r from-[#E10600] via-[#FF0800] to-[#E10600] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
            )}
          >
            2025 F1 Season Now Available
          </span>
        </AnimatedGradientText>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="mt-8 flex max-w-2xl flex-col items-center justify-center gap-6"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="text-balance text-6xl font-bold"
        >
          Your Ultimate F1 Travel Experience
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="max-w-xl text-balance text-xl"
        >
          Plan your perfect Formula 1 race weekend with expert travel packages,
          exclusive experiences, and seamless booking.
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          className="flex gap-4"
        >
          <Link href="/races" onClick={handleGetStartedClick}>
            <Button className="bg-[#E10600] text-lg hover:bg-[#FF0800]">
              <Flag className="mr-2 size-5" />
              View 2025 Races
            </Button>
          </Link>
          <Link href="/packages">
            <Button variant="outline" className="text-lg">
              <Star className="mr-2 size-5" />
              Browse Packages
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1, ease: "easeOut" }}
        className="mx-auto mt-20 flex w-full max-w-screen-lg items-center justify-center rounded-lg border shadow-lg"
      >
        <HeroVideoDialog
          animationStyle="top-in-bottom-out"
          videoSrc="https://www.youtube.com/embed/dQw4w9WgXcQ"
          thumbnailSrc="/images/hero-f1.jpg"
          thumbnailAlt="F1 Race Experience"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
        className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3"
      >
        <div className="flex flex-col items-center gap-2">
          <Calendar className="size-8 text-[#E10600]" />
          <h3 className="text-lg font-semibold">24 Race Weekends</h3>
          <p className="text-muted-foreground">
            Experience the thrill of F1 at iconic circuits worldwide
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <MapPin className="size-8 text-[#E10600]" />
          <h3 className="text-lg font-semibold">Global Destinations</h3>
          <p className="text-muted-foreground">
            From Monaco to Melbourne, we've got you covered
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Star className="size-8 text-[#E10600]" />
          <h3 className="text-lg font-semibold">VIP Experiences</h3>
          <p className="text-muted-foreground">
            Access exclusive paddock club and team garage tours
          </p>
        </div>
      </motion.div>
    </div>
  )
}
