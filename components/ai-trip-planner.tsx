"use client"

import { useState, useEffect, useRef } from "react"
import { useChat } from "ai/react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WeatherAndSchedule } from "@/components/races/weather-schedule/WeatherAndSchedule"
import LocalAttractions from "@/components/races/LocalAttractions"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  MapPin,
  Hotel,
  Utensils,
  Camera,
  Sun,
  Ticket,
  Plane,
  Car,
  Train,
  Info,
  MessageSquare,
  Map,
  Clock,
  Plus,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { RaceWithDetails } from "@/types/race"
import { toast } from "sonner"

interface Trip {
  id: string
  userId: string
  raceId: string
  title: string
  description: string
  visibility: "private" | "public" | "shared"
  sharedWith: string[]
  race: RaceWithDetails
  itinerary?: {
    id: number
    activities: {
      id: string
      type: string
      category: string
      title: string
      description: string
      startTime?: string
      endTime?: string
      location?: string
    }[]
  }
  tickets?: {
    id: number
    title: string
    description: string
    ticketType: string
    availability: string
    daysIncluded: string[]
    features: string[]
    pricing: {
      price: number
      currency: string
    }
  }[]
  transportInfo?: {
    id: string
    type: string
    name: string
    description: string
    options: string[]
  }[]
  localAttractions?: {
    id: string
    name: string
    description: string
    type: string
    distance: number
    rating: number
  }[]
  tips?: {
    id: string
    content: string
    category: string
  }[]
}

interface AiTripPlannerProps {
  tripDetails?: Trip
  onAddActivity: (activity: string) => void
}

export function AiTripPlanner({
  tripDetails,
  onAddActivity
}: AiTripPlannerProps) {
  const [activeTab, setActiveTab] = useState("chat")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { messages, input, handleInputChange, handleSubmit, setMessages } =
    useChat({
      api: "/api/ai-trip-planner",
      initialMessages: tripDetails
        ? [
            {
              id: "init",
              role: "system",
              content: `Welcome to your F1 trip planning assistant! I'm here to help you plan your trip to the ${tripDetails.race.name} at ${tripDetails.race.circuit?.name || "the circuit"}.

What would you like to know about:
- Race weekend schedule and events
- Ticket options and viewing spots
- Local transportation and accommodation
- Things to do in ${tripDetails.race.country}
- Weather and what to pack
- Local customs and tips

Just ask me anything about your trip!`
            }
          ]
        : [],
      onResponse: () => {
        setIsTyping(false)
      },
      onFinish: () => {
        setIsTyping(false)
      },
      onError: () => {
        setIsTyping(false)
        toast.error("Failed to get response from AI assistant")
      }
    })

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleQuickQuery = async (query: string) => {
    // First update the input value
    const inputEvent = {
      target: { value: query }
    } as React.ChangeEvent<HTMLInputElement>
    handleInputChange(inputEvent)

    // Then submit the form
    const submitEvent = {
      preventDefault: () => {}
    } as React.FormEvent<HTMLFormElement>
    await handleSubmit(submitEvent)
  }

  const suggestActivity = (activity: string) => {
    onAddActivity(activity)
  }

  const formatMessage = (content: string) => {
    return content.split("\n").map((line, i) => (
      <div key={i} className="markdown whitespace-pre-wrap">
        {line}
      </div>
    ))
  }

  if (!tripDetails) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>AI Trip Planner</CardTitle>
          <CardDescription>Loading trip details...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-6xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI Trip Planner</CardTitle>
            <CardDescription>
              Get personalized suggestions for your F1 trip
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            {tripDetails.race.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="size-4" />
              Chat Assistant
            </TabsTrigger>
            <TabsTrigger value="planner" className="gap-2">
              <Calendar className="size-4" />
              Trip Planner
            </TabsTrigger>
            <TabsTrigger value="info" className="gap-2">
              <Info className="size-4" />
              Race Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_300px]">
              <div className="space-y-4">
                <ScrollArea
                  className="bg-muted/50 h-[500px] rounded-lg border p-4"
                  ref={scrollAreaRef}
                >
                  <div className="pr-4">
                    <AnimatePresence mode="popLayout">
                      {messages.map((message, i) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "mb-4",
                            message.role === "user" ? "text-right" : "text-left"
                          )}
                        >
                          <div
                            className={cn(
                              "inline-block max-w-[80%] rounded-lg p-3",
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            )}
                          >
                            <div
                              className={cn(
                                "prose prose-sm max-w-none break-words",
                                message.role === "user"
                                  ? "prose-invert"
                                  : "dark:prose-invert",
                                "prose-p:my-1 prose-ul:my-1 prose-li:my-0",
                                "prose-headings:mb-2 prose-headings:mt-4 first:prose-headings:mt-1",
                                "prose-pre:max-w-[calc(100vw-24rem)] prose-pre:overflow-x-auto"
                              )}
                            >
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                          </div>
                          {message.role === "assistant" &&
                            message.content.includes(
                              "suggest adding this activity"
                            ) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  suggestActivity(message.content.split('"')[1])
                                }
                                className="mt-2"
                              >
                                <Plus className="mr-2 size-4" />
                                Add to Activities
                              </Button>
                            )}
                        </motion.div>
                      ))}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-muted-foreground flex items-center gap-2"
                        >
                          <Loader2 className="size-4 animate-spin" />
                          <span className="text-sm">AI is typing...</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </ScrollArea>

                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    placeholder="Ask about your trip, the race, or local recommendations..."
                    onChange={handleInputChange}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isTyping}>
                    {isTyping ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Send"
                    )}
                  </Button>
                </form>
              </div>

              <div className="space-y-4">
                <div className="bg-card rounded-lg border p-4">
                  <h3 className="mb-2 font-medium">Quick Actions</h3>
                  <div className="grid gap-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() =>
                        handleQuickQuery(
                          "What's the weather like during the race weekend?"
                        )
                      }
                    >
                      <Sun className="size-4" />
                      Check Weather
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() =>
                        handleQuickQuery(
                          "What are the must-visit attractions near the circuit?"
                        )
                      }
                    >
                      <Camera className="size-4" />
                      Local Attractions
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() =>
                        handleQuickQuery("What local dishes should I try?")
                      }
                    >
                      <Utensils className="size-4" />
                      Local Cuisine
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() =>
                        handleQuickQuery(
                          "Tell me about the circuit and best viewing spots"
                        )
                      }
                    >
                      <MapPin className="size-4" />
                      Circuit Info
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() =>
                        handleQuickQuery(
                          "What's the best way to get to the circuit?"
                        )
                      }
                    >
                      <Car className="size-4" />
                      Transport Options
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() =>
                        handleQuickQuery(
                          "What accommodation options are available?"
                        )
                      }
                    >
                      <Hotel className="size-4" />
                      Accommodation
                    </Button>
                  </div>
                </div>

                <div className="bg-card rounded-lg border p-4">
                  <h3 className="mb-2 font-medium">Trip Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-muted-foreground size-4" />
                      <span>
                        {new Date(tripDetails.race.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="text-muted-foreground size-4" />
                      <span>
                        {tripDetails.race.circuit?.name},{" "}
                        {tripDetails.race.country}
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center gap-2">
                      <Clock className="text-muted-foreground size-4" />
                      <span>
                        {tripDetails.itinerary?.activities.length || 0}{" "}
                        Activities Planned
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="planner" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Weather & Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <WeatherAndSchedule race={tripDetails.race} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Local Attractions</CardTitle>
                </CardHeader>
                <CardContent>
                  {tripDetails.race.circuit && (
                    <LocalAttractions
                      circuit={{
                        id: tripDetails.race.circuit.id,
                        name: tripDetails.race.circuit.name,
                        latitude: String(tripDetails.race.circuit.latitude),
                        longitude: String(tripDetails.race.circuit.longitude)
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="info" className="mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="flex items-center gap-2 font-medium">
                  <Info className="size-4" />
                  Race Information
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {tripDetails.race.description}
                </p>
              </div>

              {tripDetails.transportInfo && (
                <div>
                  <h3 className="flex items-center gap-2 font-medium">
                    <Car className="size-4" />
                    Transport Options
                  </h3>
                  <div className="mt-1 grid gap-2">
                    {tripDetails.transportInfo.map(transport => (
                      <div key={transport.id} className="text-sm">
                        <span className="font-medium">{transport.name}</span>
                        <p className="text-muted-foreground">
                          {transport.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tripDetails.localAttractions && (
                <div>
                  <h3 className="flex items-center gap-2 font-medium">
                    <Camera className="size-4" />
                    Nearby Attractions
                  </h3>
                  <div className="mt-1 grid gap-2">
                    {tripDetails.localAttractions.map(attraction => (
                      <div key={attraction.id} className="text-sm">
                        <span className="font-medium">{attraction.name}</span>
                        <p className="text-muted-foreground">
                          {attraction.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tripDetails.tips && (
                <div>
                  <h3 className="flex items-center gap-2 font-medium">
                    <Sun className="size-4" />
                    Travel Tips
                  </h3>
                  <div className="mt-1 grid gap-2">
                    {tripDetails.tips.map(tip => (
                      <div key={tip.id} className="text-sm">
                        <Badge variant="outline" className="mb-1">
                          {tip.category}
                        </Badge>
                        <p className="text-muted-foreground">{tip.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
