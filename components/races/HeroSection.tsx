"use client"

import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <div className="bg-background relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 size-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="bg-primary absolute inset-x-0 top-0 -z-10 m-auto size-[310px] rounded-full opacity-20 blur-[100px]" />
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Motorsport Race Calendar
            </h1>
            <p className="text-muted-foreground mt-6 text-lg leading-8">
              Compare race weekends and plan the trip yourself. PitLane
              Travel does not currently sell race-weekend packages. It does
              not book or issue flights, and it does not sell tickets.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
