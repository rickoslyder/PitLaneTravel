"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Image from "next/image"
import { useNextRace } from "@/hooks/useNextRace"

const backgrounds = [
  "/placeholder.svg?height=1080&width=1920",
  "/placeholder.svg?height=1080&width=1920",
  "/placeholder.svg?height=1080&width=1920"
]

export default function HeroSectionFromV0() {
  const [currentBg, setCurrentBg] = useState(0)
  const { days, hours, minutes, raceName } = useNextRace()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % backgrounds.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      className="relative h-screen w-full overflow-hidden"
      aria-label="Hero Section"
    >
      {backgrounds.map((bg, index) => (
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: index === currentBg ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          <Image
            src={bg}
            alt={`F1 background ${index + 1}`}
            layout="fill"
            objectFit="cover"
            priority={index === 0}
          />
        </motion.div>
      ))}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 p-4 text-white">
        <motion.h1
          className="gradient-text mb-4 text-center text-5xl font-bold md:text-7xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Experience Formula 1 Like Never Before
        </motion.h1>
        <motion.p
          className="mb-8 max-w-2xl text-center text-xl md:text-2xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Plan your perfect F1 race weekend with ease and confidence using
          PitLane Travel's expert guidance and tools
        </motion.p>
        <motion.div
          className="mb-8 text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="mb-2 text-lg">Next race: {raceName} in:</p>
          <div className="flex justify-center space-x-4">
            <div className="text-center">
              <span className="text-4xl font-bold">{days}</span>
              <p className="text-sm">Days</p>
            </div>
            <div className="text-center">
              <span className="text-4xl font-bold">{hours}</span>
              <p className="text-sm">Hours</p>
            </div>
            <div className="text-center">
              <span className="text-4xl font-bold">{minutes}</span>
              <p className="text-sm">Minutes</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button size="lg" className="px-8 py-6 text-lg">
            Start Your F1 Adventure
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
