import { RaceWithDetails } from "@/types/race"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { CalendarDays, MapPin, Share2, Ticket } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { TripPlannerButton } from "@/components/trip-planner-button"

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
  const raceDate = new Date(race.date)
  const weekendStart = race.weekend_start ? new Date(race.weekend_start) : null
  const weekendEnd = race.weekend_end ? new Date(race.weekend_end) : null

  const getStatusColor = (status: RaceWithDetails["status"]) => {
    switch (status) {
      case "in_progress":
        return "bg-green-500/10 text-green-500"
      case "upcoming":
        return "bg-blue-500/10 text-blue-500"
      case "completed":
        return "bg-gray-500/10 text-gray-500"
      case "cancelled":
        return "bg-red-500/10 text-red-500"
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
    <div className="relative h-[60vh] w-full overflow-hidden">
      {race.circuit?.image_url ? (
        <div className="absolute inset-0">
          <img
            src={race.circuit.image_url}
            alt={race.name}
            className="size-full object-cover"
          />
          <div className="from-background via-background/50 absolute inset-0 bg-gradient-to-t to-transparent" />
        </div>
      ) : (
        <div className="from-primary/20 to-background absolute inset-0 bg-gradient-to-b" />
      )}

      <div className="absolute inset-0 -z-10 size-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="bg-primary absolute inset-x-0 top-0 -z-10 m-auto size-[310px] rounded-full opacity-20 blur-[100px]" />
      </div>

      <div className="container relative flex h-full items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <Badge
              variant="secondary"
              className={cn(getStatusColor(race.status), "backdrop-blur-md")}
            >
              {getStatusText(race.status)}
            </Badge>
            {race.is_sprint_weekend && (
              <Badge variant="secondary" className="backdrop-blur-md">
                Sprint Weekend
              </Badge>
            )}
          </div>

          <h1 className="mt-4 break-words text-3xl font-bold tracking-tight text-white backdrop-blur-sm sm:text-4xl lg:text-6xl">
            {race.name}
          </h1>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-base text-white/90 backdrop-blur-sm sm:gap-4 sm:text-lg">
            <div className="flex items-center gap-1">
              <MapPin className="size-4 sm:size-5" />
              <span className="break-words">
                {race.circuit?.location}, {race.country}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays className="size-4 sm:size-5" />
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

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <Button
              size="lg"
              className="bg-[#E10600] hover:bg-[#FF0800]"
              onClick={() => onTabChange("tickets")}
            >
              <Ticket className="mr-2 size-4" />
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
              className="bg-white/10 backdrop-blur-md hover:bg-white/20"
            >
              <Share2 className="mr-2 size-4" />
              Share
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
