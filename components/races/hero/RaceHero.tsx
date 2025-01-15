import { RaceWithDetails } from "@/types/race"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  format,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds
} from "date-fns"
import { CalendarDays, MapPin, Share2, Ticket, Timer } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { TripPlannerButton } from "@/components/trip-planner-button"
import { useEffect, useState, useMemo } from "react"

interface RaceHeroProps {
  race: RaceWithDetails
  userId?: string | null
  existingTripId?: string
  onTabChange: (tab: string) => void
}

export function RaceHero({
  race,
  userId,
  existingTripId,
  onTabChange
}: RaceHeroProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const raceDate = useMemo(() => new Date(race.date), [race.date])
  const weekendStart = useMemo(
    () => (race.weekend_start ? new Date(race.weekend_start) : null),
    [race.weekend_start]
  )
  const weekendEnd = useMemo(
    () => (race.weekend_end ? new Date(race.weekend_end) : null),
    [race.weekend_end]
  )

  useEffect(() => {
    let timer: NodeJS.Timeout

    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = raceDate.getTime() - now.getTime()

      if (difference > 0) {
        setTimeLeft({
          days: differenceInDays(raceDate, now),
          hours: differenceInHours(raceDate, now) % 24,
          minutes: differenceInMinutes(raceDate, now) % 60,
          seconds: differenceInSeconds(raceDate, now) % 60
        })
      } else {
        clearInterval(timer)
      }
    }

    calculateTimeLeft()
    timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [raceDate])

  const getStatusColor = (status: RaceWithDetails["status"]) => {
    switch (status) {
      case "in_progress":
        return "bg-white text-green-600 border-green-100"
      case "upcoming":
        return "bg-white text-blue-600 border-blue-100"
      case "completed":
        return "bg-white text-gray-600 border-gray-100"
      case "cancelled":
        return "bg-white text-red-600 border-red-100"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: RaceWithDetails["status"]) => {
    switch (status) {
      case "in_progress":
        return "Live"
      case "upcoming":
        return "Upcoming"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      default:
        return "Unknown"
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: race.name,
      text: `Check out the ${race.name} on ${format(raceDate, "MMM d, yyyy")}`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success("Link copied to clipboard!")
      }
    } catch (error) {
      console.error("Error sharing:", error)
      toast.error("Failed to share")
    }
  }

  return (
    <div className="relative h-[75vh] min-h-[500px] w-full overflow-hidden">
      {race.circuit?.image_url ? (
        <div className="absolute inset-0">
          <img
            src={race.circuit.image_url}
            alt={race.name}
            className="size-full object-cover"
          />
          <div className="from-background/90 via-background/25 absolute inset-0 bg-gradient-to-t to-transparent" />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      ) : (
        <div className="from-primary/20 to-background absolute inset-0 bg-gradient-to-b" />
      )}

      <div className="absolute inset-0 -z-10 size-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]">
        <div className="bg-primary absolute inset-x-0 top-0 -z-10 m-auto size-[310px] rounded-full opacity-20 blur-[100px]" />
      </div>

      <div className="container relative flex h-full flex-col items-center justify-center gap-6 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge
              variant="secondary"
              className={cn(
                getStatusColor(race.status),
                "border font-medium shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105"
              )}
            >
              {getStatusText(race.status)}
            </Badge>
            {race.is_sprint_weekend && (
              <Badge
                variant="secondary"
                className="border border-white/10 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:scale-105"
              >
                Sprint Weekend
              </Badge>
            )}
          </div>

          <h1 className="mt-4 break-words text-2xl font-bold tracking-tight text-white [text-shadow:_0_4px_24px_rgba(0,0,0,0.5)] sm:text-4xl lg:text-6xl">
            {race.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-white/90 sm:mt-6 sm:gap-4 sm:text-base">
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-md transition-all duration-300 hover:bg-white/10 sm:px-4 sm:py-1.5">
              <MapPin className="size-3 sm:size-4" />
              <span className="break-words">
                {race.circuit?.location}, {race.country}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-md transition-all duration-300 hover:bg-white/10 sm:px-4 sm:py-1.5">
              <CalendarDays className="size-3 sm:size-4" />
              <span>
                {weekendStart && weekendEnd
                  ? `${format(weekendStart, "MMM d")} - ${format(
                      weekendEnd,
                      "MMM d, yyyy"
                    )}`
                  : format(raceDate, "MMM d, yyyy")}
              </span>
            </div>
          </div>

          {race.status === "upcoming" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 flex flex-col items-center sm:mt-8"
            >
              <div className="flex flex-col items-center space-y-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
                <div className="flex items-center gap-2 text-white/90">
                  <Timer className="size-4 sm:size-5" />
                  <span className="text-base font-medium sm:text-lg">
                    Race Starts In
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  <CountdownUnit value={timeLeft.days} label="DAYS" />
                  <CountdownSeparator />
                  <CountdownUnit value={timeLeft.hours} label="HRS" />
                  <CountdownSeparator />
                  <CountdownUnit value={timeLeft.minutes} label="MIN" />
                  <CountdownSeparator />
                  <CountdownUnit value={timeLeft.seconds} label="SEC" />
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-8 sm:gap-4"
          >
            <Button
              size="lg"
              className="group relative bg-[#E10600] px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 hover:bg-[#FF0800] hover:shadow-[0_0_30px_rgba(225,6,0,0.4)] sm:p-6 sm:text-base"
              onClick={() => onTabChange("tickets")}
            >
              <div className="absolute inset-0 rounded-md bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <Ticket className="mr-2 size-4 sm:size-5" />
              Book Now
            </Button>
            <TripPlannerButton
              race={race}
              userId={userId}
              existingTripId={existingTripId}
            />
            <Button
              size="lg"
              variant="outline"
              onClick={handleShare}
              className="group relative bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/20 sm:p-6 sm:text-base"
            >
              <div className="absolute inset-0 rounded-md bg-gradient-to-r from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <Share2 className="mr-2 size-4 sm:size-5" />
              Share
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-[60px] flex-col items-center sm:min-w-[80px]">
      <motion.div
        key={value}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className="text-xl font-bold text-white sm:text-3xl"
      >
        {value.toString().padStart(2, "0")}
      </motion.div>
      <div className="text-[10px] text-white/70 sm:text-xs">{label}</div>
    </div>
  )
}

function CountdownSeparator() {
  return (
    <motion.div
      animate={{
        opacity: [1, 0.3, 1],
        transition: {
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }
      }}
      className="text-2xl font-bold text-white/50 sm:text-3xl"
    >
      :
    </motion.div>
  )
}
