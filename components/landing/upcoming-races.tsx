"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { RaceWithCircuitAndSeries } from "@/types/database"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Flag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface UpcomingRacesProps {
  races: RaceWithCircuitAndSeries[]
}

export function UpcomingRaces({ races }: UpcomingRacesProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const getVisibleCount = () => {
    if (typeof window === "undefined") return 4 // Default for SSR
    if (window.innerWidth >= 1536) return 4 // 2xl: 4 items in one row
    if (window.innerWidth >= 1024) return 3 // lg: exactly 3 items
    if (window.innerWidth >= 768) return 4 // md: 4 items in 2x2 grid
    return 1 // mobile: 1 item
  }

  const nextSlide = () => {
    const visibleCount = getVisibleCount()
    setCurrentIndex(current =>
      current + visibleCount >= races.length ? 0 : current + visibleCount
    )
  }

  const prevSlide = () => {
    const visibleCount = getVisibleCount()
    setCurrentIndex(current =>
      current - visibleCount < 0
        ? Math.max(races.length - visibleCount, 0)
        : current - visibleCount
    )
  }

  if (!races.length) return null

  const visibleCount = getVisibleCount()
  const visibleRaces = races.slice(currentIndex, currentIndex + visibleCount)

  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <h2 className="mb-4 text-4xl font-bold">Upcoming Races</h2>
          <p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-lg">
            Secure your spot at the next Formula 1 Grand Prix
          </p>
        </motion.div>

        <div className="relative">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="absolute -left-4 top-1/2 z-10 -translate-y-1/2"
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="size-6" />
            </Button>

            <div className="mx-auto grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {visibleRaces.map((race, index) => (
                <motion.div
                  key={race.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn(
                    "lg:col-span-1",
                    // On lg screens, if this is the 4th item, hide it
                    index === 3 && "lg:hidden 2xl:block"
                  )}
                >
                  <Card className="group h-full overflow-hidden">
                    <div className="relative aspect-[16/9]">
                      <Image
                        src={
                          race.circuit?.image_url || "/assets/placeholder.jpg"
                        }
                        alt={race.circuit?.name || "Race circuit"}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        fill
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="mb-2 text-xl font-semibold">
                        {race.name}
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        {race.circuit?.location}
                      </p>
                      <p className="text-sm">
                        {new Date(race.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric"
                        })}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button asChild className="w-full" variant="outline">
                        <Link href={`/races/${race.slug || race.id}`}>
                          <Flag className="mr-2 size-4" />
                          View Race Details
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="absolute -right-4 top-1/2 z-10 -translate-y-1/2"
              disabled={currentIndex + visibleCount >= races.length}
            >
              <ChevronRight className="size-6" />
            </Button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button asChild className="bg-[#E10600] hover:bg-[#FF0800]">
            <Link href="/races">View All Races</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
