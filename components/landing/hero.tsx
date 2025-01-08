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
  ChevronDownIcon
} from "lucide-react"
import Link from "next/link"
import posthog from "posthog-js"
import AnimatedGradientText from "../magicui/animated-gradient-text"
import HeroVideoDialog from "../magicui/hero-video-dialog"
import supabaseLoader from "@/supabase-image-loader"
import Image from "next/image"
import { useScroll, useTransform } from "framer-motion"

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

  return (
    // <div className="flex flex-col items-center justify-center px-8 pt-24 text-center">
    //   <motion.div
    //     initial={{ opacity: 0, y: -20 }}
    //     animate={{ opacity: 1, y: 0 }}
    //     transition={{ duration: 0.6, ease: "easeOut" }}
    //     className="flex items-center justify-center"
    //   >
    //     <AnimatedGradientText>
    //       <Flag className="inline-block size-4" />
    //       <hr className="mx-2 h-4 w-px shrink-0 bg-gray-300" />
    //       <span
    //         className={cn(
    //           `animate-gradient inline bg-gradient-to-r from-[#E10600] via-[#FF0800] to-[#E10600] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
    //         )}
    //       >
    //         2025 F1 Season Now Available
    //       </span>
    //     </AnimatedGradientText>
    //   </motion.div>

    //   <motion.div
    //     initial={{ opacity: 0, y: 20 }}
    //     animate={{ opacity: 1, y: 0 }}
    //     transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
    //     className="mt-8 flex max-w-2xl flex-col items-center justify-center gap-6"
    //   >
    //     <motion.div
    //       initial={{ scale: 0.95, opacity: 0 }}
    //       animate={{ scale: 1, opacity: 1 }}
    //       transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
    //       className="text-balance text-6xl font-bold"
    //     >
    //       Your Ultimate F1 Travel Experience
    //     </motion.div>

    //     <motion.div
    //       initial={{ opacity: 0 }}
    //       animate={{ opacity: 1 }}
    //       transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
    //       className="max-w-xl text-balance text-xl"
    //     >
    //       Plan your perfect Formula 1 race weekend with expert travel packages,
    //       exclusive experiences, and seamless booking.
    //     </motion.div>

    //     <motion.div
    //       initial={{ opacity: 0, y: 10 }}
    //       animate={{ opacity: 1, y: 0 }}
    //       transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
    //       className="flex gap-4"
    //     >
    //       <Link href="/races" onClick={handleGetStartedClick}>
    //         <Button className="bg-[#E10600] text-lg hover:bg-[#FF0800]">
    //           <Flag className="mr-2 size-5" />
    //           View 2025 Races
    //         </Button>
    //       </Link>
    //       <Link href="/packages">
    //         <Button variant="outline" className="text-lg">
    //           <Star className="mr-2 size-5" />
    //           Browse Packages
    //         </Button>
    //       </Link>
    //     </motion.div>
    //   </motion.div>

    //   <motion.div
    //     initial={{ opacity: 0, y: 30 }}
    //     animate={{ opacity: 1, y: 0 }}
    //     transition={{ duration: 1, delay: 1, ease: "easeOut" }}
    //     className="mx-auto mt-20 flex w-full max-w-screen-lg items-center justify-center rounded-lg border shadow-lg"
    //   >
    //     {/* <HeroVideoDialog
    //       animationStyle="top-in-bottom-out"
    //       videoSrc="https://www.youtube.com/embed/dQw4w9WgXcQ"
    //       thumbnailSrc={supabaseLoader({
    //         src: "/assets/homepage/hero.jpeg",
    //         height: 1000,
    //         width: 1000,
    //         quality: 75
    //       })}
    //       thumbnailAlt="F1 Race Experience"
    //     /> */}
    //     <HeroImage />
    //   </motion.div>

    //   <motion.div
    //     initial={{ opacity: 0, y: 20 }}
    //     animate={{ opacity: 1, y: 0 }}
    //     transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
    //     className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3"
    //   >
    //     <div className="flex flex-col items-center gap-2">
    //       <Calendar className="size-8 text-[#E10600]" />
    //       <h3 className="text-lg font-semibold">24 Race Weekends</h3>
    //       <p className="text-muted-foreground">
    //         Experience the thrill of F1 at iconic circuits worldwide
    //       </p>
    //     </div>
    //     <div className="flex flex-col items-center gap-2">
    //       <MapPin className="size-8 text-[#E10600]" />
    //       <h3 className="text-lg font-semibold">Global Destinations</h3>
    //       <p className="text-muted-foreground">
    //         From Monaco to Melbourne, we've got you covered
    //       </p>
    //     </div>
    //     <div className="flex flex-col items-center gap-2">
    //       <Star className="size-8 text-[#E10600]" />
    //       <h3 className="text-lg font-semibold">VIP Experiences</h3>
    //       <p className="text-muted-foreground">
    //         Access exclusive paddock club and team garage tours
    //       </p>
    //     </div>
    //   </motion.div>
    // </div>
    <>
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
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
                className="mb-8 border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm"
              >
                <FlagIcon className="mr-2 size-4" />
                2025 F1 Season Now Available
              </Badge>
            </motion.div>

            {/* Main heading with text shadow for depth */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6"
            >
              <h1 className="text-5xl font-bold tracking-tighter text-white drop-shadow-2xl [text-shadow:_0_4px_24px_rgba(0,0,0,0.3)] md:text-6xl lg:text-7xl">
                Your Ultimate F1
                <br />
                <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                  Travel Experience
                </span>
              </h1>
            </motion.div>

            {/* Description with glass effect */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-12 max-w-2xl"
            >
              <p className="rounded-xl border border-white/10 bg-white/10 px-6 py-4 text-lg leading-relaxed text-white/90 shadow-xl backdrop-blur-md md:text-xl">
                Plan your perfect Formula 1 race weekend with expert travel
                packages, exclusive experiences, and seamless booking.
              </p>
            </motion.div>

            {/* Group the buttons and scroll indicator together */}
            <div className="flex flex-col items-center">
              {/* Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex w-full flex-col justify-center gap-4 sm:flex-row"
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-red-600 px-8 py-6 text-lg text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-red-700 hover:shadow-xl"
                >
                  <Link href="/races">
                    <FlagIcon className="mr-2 size-5" />
                    View 2025 Races
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/10 px-8 py-6 text-lg text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-xl"
                >
                  <Link href="/packages">
                    <StarIcon className="mr-2 size-5" />
                    Browse Packages
                  </Link>
                </Button>
              </motion.div>

              {/* Scroll indicator below buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-8" // Add margin top for spacing from buttons
              >
                <ChevronDownIcon className="size-8 animate-bounce text-white/70" />
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
