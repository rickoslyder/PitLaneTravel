"use client"

import { useEffect, useState } from "react"
import { RaceWithDetails } from "@/types/race"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Info, MapPin, Plug, AlertTriangle, X } from "lucide-react"
import { format, addDays } from "date-fns"
import { motion } from "framer-motion"
import { getPlugsByCountryAction } from "@/actions/db/world-plugs-actions"
import Image from "next/image"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface TripInfoTabProps {
  race: RaceWithDetails
  description: string
}

interface PlugInfo {
  plugType: string
  voltage: string
  frequency: string
  imageUrl: string | null
}

export function TripInfoTab({ race, description }: TripInfoTabProps) {
  const [plugs, setPlugs] = useState<PlugInfo[]>([])
  const [isLoadingPlugs, setIsLoadingPlugs] = useState(true)
  const [selectedPlug, setSelectedPlug] = useState<PlugInfo | null>(null)

  // Convert UTC dates to local dates for display
  const practiceDate = race.weekend_start ? new Date(race.weekend_start) : null
  const qualifyingDate = race.date ? addDays(new Date(race.date), -1) : null
  const raceDate = race.date ? new Date(race.date) : null

  useEffect(() => {
    const fetchPlugs = async () => {
      const result = await getPlugsByCountryAction(race.country)
      if (result.isSuccess) {
        setPlugs(result.data)
      }
      setIsLoadingPlugs(false)
    }
    fetchPlugs()
  }, [race.country])

  // Get unique voltages and frequencies
  const uniqueVoltages = Array.from(new Set(plugs.map(p => p.voltage)))
  const uniqueFrequencies = Array.from(new Set(plugs.map(p => p.frequency)))

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="group transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="text-primary size-5" />
              Trip Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p>{description}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-medium">
                  <Calendar className="text-primary size-4" />
                  Race Weekend Schedule
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Practice:</span>
                    <span>
                      {practiceDate
                        ? format(practiceDate, "MMM d, yyyy")
                        : "TBD"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Qualifying:</span>
                    <span>
                      {qualifyingDate
                        ? format(qualifyingDate, "MMM d, yyyy")
                        : "TBD"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Race Day:</span>
                    <span className="text-primary font-medium">
                      {raceDate ? format(raceDate, "MMM d, yyyy") : "TBD"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-medium">
                  <MapPin className="text-primary size-4" />
                  Circuit Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Circuit:</span>
                    <span>{race.circuit?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{race.circuit?.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Country:</span>
                    <span>{race.country}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-medium">
                <Plug className="text-primary size-4" />
                Power Information
              </h3>
              <div className="space-y-4">
                {isLoadingPlugs ? (
                  <div className="text-muted-foreground text-sm">
                    Loading...
                  </div>
                ) : plugs.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-6">
                      {plugs.map((plug, index) => (
                        <TooltipProvider key={index}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setSelectedPlug(plug)}
                                className="group space-y-2 text-left"
                              >
                                <div className="border-border relative size-24 overflow-hidden rounded-lg border transition-shadow hover:shadow-md">
                                  <Image
                                    src={
                                      plug.imageUrl || "/placeholder-plug.jpg"
                                    }
                                    alt={`Type ${plug.plugType.split(" ")[1]} plug`}
                                    fill
                                    className="object-cover"
                                    sizes="96px"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                </div>
                                <div className="text-center">
                                  <span className="text-primary text-sm font-medium">
                                    Type {plug.plugType.split(" ")[1]}
                                  </span>
                                </div>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>Click to view larger image</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="border-border rounded-lg border p-4">
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                          <AlertTriangle className="size-4 text-yellow-500" />
                          Voltage
                        </h4>
                        <p className="text-primary text-2xl font-bold">
                          {uniqueVoltages.join(" / ")}
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm">
                          Check your devices' compatibility
                        </p>
                      </div>

                      <div className="border-border rounded-lg border p-4">
                        <h4 className="mb-2 text-sm font-medium">Frequency</h4>
                        <p className="text-primary text-2xl font-bold">
                          {uniqueFrequencies.join(" / ")}
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm">
                          Standard power frequency
                        </p>
                      </div>
                    </div>

                    <div className="text-muted-foreground bg-muted rounded-lg p-4 text-sm">
                      <p>
                        💡 Remember to bring appropriate power adapters for your
                        devices. Most modern electronics (phones, laptops) can
                        handle different voltages, but always double-check your
                        devices' specifications.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    No power information available
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog
        open={selectedPlug !== null}
        onOpenChange={open => !open && setSelectedPlug(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                Type {selectedPlug?.plugType.split(" ")[1]} Power Socket
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 rounded-md"
                onClick={() => setSelectedPlug(null)}
              >
                <X className="size-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedPlug && (
            <div className="relative aspect-square w-full">
              <Image
                src={selectedPlug.imageUrl || "/placeholder-plug.jpg"}
                alt={`Type ${selectedPlug.plugType.split(" ")[1]} plug`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
