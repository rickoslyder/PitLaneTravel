"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { RaceWithDetails } from "@/types/race"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Flag,
  Plane,
  Star,
  Ticket,
  CalendarDays,
  Calendar,
  ArrowUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ChevronDown, LucideIcon } from "lucide-react"
import { RaceHero } from "./hero/RaceHero"
import { SelectRaceHistory } from "@/db/schema/race-history-schema"
import { sendGTMEvent } from "@next/third-parties/google"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorBoundary } from "./error-boundary"
import { ProgressIndicator } from "./progress-indicator"
import { useAnnouncer } from "./use-announcer"

// Create a loading component
function TabLoadingSpinner() {
  return (
    <div className="flex h-[500px] items-center justify-center">
      <div className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent" />
    </div>
  )
}

// Lazy load heavy components with proper types
const RaceInfoTab = dynamic(
  () => import("./tabs/RaceInfoTab").then(mod => mod.RaceInfoTab),
  { loading: () => <TabLoadingSpinner /> }
)
const TicketSection = dynamic(
  () => import("./tickets/TicketSection").then(mod => mod.TicketSection),
  { loading: () => <TabLoadingSpinner /> }
)
const TravelTab = dynamic(
  () => import("./tabs/TravelTab").then(mod => mod.TravelTab),
  { loading: () => <TabLoadingSpinner /> }
)
const WeatherAndSchedule = dynamic(
  () =>
    import("./weather-schedule/WeatherAndSchedule").then(
      mod => mod.WeatherAndSchedule
    ),
  { loading: () => <TabLoadingSpinner /> }
)
const ReviewSection = dynamic(
  () => import("./reviews/ReviewSection").then(mod => mod.ReviewSection),
  { loading: () => <TabLoadingSpinner /> }
)
const RaceItinerary = dynamic(
  () => import("./RaceItinerary").then(mod => mod.RaceItinerary),
  { loading: () => <TabLoadingSpinner /> }
)

interface RaceDetailsPageProps {
  /** The race to display */
  race: RaceWithDetails
  /** The user's existing trip ID for this race, if any */
  existingTripId?: string
  /** The current user's ID */
  userId?: string | null
  /** The race's history data */
  history?: SelectRaceHistory
}

interface TabOption {
  value: string
  label: string
  icon: LucideIcon
}

// Move tab options to a constant
const TAB_OPTIONS: TabOption[] = [
  { value: "info", label: "Information", icon: Flag },
  { value: "tickets", label: "Tickets", icon: Ticket },
  { value: "travel", label: "Travel", icon: Plane },
  { value: "schedule", label: "Schedule", icon: CalendarDays },
  { value: "reviews", label: "Reviews", icon: Star },
  { value: "itinerary", label: "Itinerary", icon: Calendar }
]

function TabContent({
  children,
  isActive
}: {
  children: React.ReactNode
  isActive: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 20 }}
      transition={{ duration: 0.2 }}
      style={{ display: isActive ? "block" : "none" }}
    >
      {children}
    </motion.div>
  )
}

export function RaceDetailsPage({
  race,
  existingTripId,
  userId,
  history
}: RaceDetailsPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { announce, Announcer } = useAnnouncer()
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams.get("tab")
    return tabFromUrl && TAB_OPTIONS.some(tab => tab.value === tabFromUrl)
      ? tabFromUrl
      : "info"
  })
  const [isScrolled, setIsScrolled] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 0)
      setShowScrollTop(scrollTop > 500)

      // Announce scroll position for screen readers when reaching certain thresholds
      if (scrollTop === 0) {
        announce("At the top of the page")
      } else if (
        scrollTop + window.innerHeight >=
        document.documentElement.scrollHeight - 100
      ) {
        announce("Nearing the end of the page")
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [announce])

  // Update URL when tab changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams.toString())
    if (activeTab) {
      newParams.set("tab", activeTab)
      router.replace(`?${newParams.toString()}`, { scroll: false })
    }
  }, [activeTab, router, searchParams])

  // Get active tab option
  const activeTabOption = TAB_OPTIONS.find(tab => tab.value === activeTab)

  const handleTabChange = (value: string) => {
    const newTab = TAB_OPTIONS.find(tab => tab.value === value)
    if (newTab) {
      setActiveTab(value)
      // Announce tab change to screen readers
      announce(`Switched to ${newTab.label} tab`)

      // Calculate offset for fixed headers (breadcrumb + sticky nav)
      const HEADER_OFFSET = 120 // 56px (breadcrumb) + 64px (sticky nav)

      // Scroll to content accounting for fixed headers
      const content = document.getElementById("tab-content")
      if (content) {
        const contentTop = content.getBoundingClientRect().top + window.scrollY
        window.scrollTo({
          top: contentTop - HEADER_OFFSET,
          behavior: "smooth"
        })
      }
    }
  }

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    announce("Scrolled to top of page")
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = TAB_OPTIONS.findIndex(tab => tab.value === activeTab)

      if (e.target instanceof HTMLElement && e.target.tagName === "INPUT") {
        return // Don't handle if user is typing in an input
      }

      switch (e.key) {
        case "ArrowLeft":
          if (currentIndex > 0) {
            handleTabChange(TAB_OPTIONS[currentIndex - 1].value)
          }
          break
        case "ArrowRight":
          if (currentIndex < TAB_OPTIONS.length - 1) {
            handleTabChange(TAB_OPTIONS[currentIndex + 1].value)
          }
          break
        case "Home":
          if (e.ctrlKey || e.metaKey) {
            handleScrollToTop()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeTab])

  sendGTMEvent({
    event: "view_item",
    user_data: {
      external_id: userId ?? null
    },
    x_fb_ud_external_id: userId ?? null,
    x_fb_cd_content_ids: [race.id],
    x_fb_cd_content_category: "race",
    items: [
      {
        item_name: race.name,
        quantity: 1,
        item_category: "race",
        item_brand: "F1"
      }
    ]
  })

  // Handle swipe gestures
  const handleSwipe = (event: TouchEvent, startX: number) => {
    const SWIPE_THRESHOLD = 50
    const deltaX = event.changedTouches[0].clientX - startX

    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      const currentIndex = TAB_OPTIONS.findIndex(tab => tab.value === activeTab)
      if (deltaX > 0 && currentIndex > 0) {
        // Swipe right - go to previous tab
        handleTabChange(TAB_OPTIONS[currentIndex - 1].value)
      } else if (deltaX < 0 && currentIndex < TAB_OPTIONS.length - 1) {
        // Swipe left - go to next tab
        handleTabChange(TAB_OPTIONS[currentIndex + 1].value)
      }
    }
  }

  useEffect(() => {
    let startX = 0
    const content = document.getElementById("tab-content")

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
    }

    const handleTouchEnd = (e: TouchEvent) => {
      handleSwipe(e, startX)
    }

    if (content) {
      content.addEventListener("touchstart", handleTouchStart as any)
      content.addEventListener("touchend", handleTouchEnd as any)

      return () => {
        content.removeEventListener("touchstart", handleTouchStart as any)
        content.removeEventListener("touchend", handleTouchEnd as any)
      }
    }
  }, [activeTab]) // Re-attach listeners when active tab changes

  return (
    <div
      className="min-h-screen w-full"
      role="region"
      aria-label={`${race.name} details`}
    >
      <Announcer />
      <ProgressIndicator />

      <RaceHero
        race={race}
        userId={userId}
        existingTripId={existingTripId}
        onTabChange={handleTabChange}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-6 sm:space-y-8"
        >
          <div className="sticky top-[3.5rem] z-50">
            <div
              className={cn(
                "bg-background/95 supports-[backdrop-filter]:bg-background/60 -mx-4 border-b backdrop-blur-md transition-shadow duration-200 sm:-mx-6 lg:-mx-8",
                isScrolled && "shadow-md"
              )}
              role="navigation"
              aria-label="Race details navigation"
            >
              <div className="mx-auto max-w-7xl px-4 py-1.5 sm:px-6 sm:py-2 lg:px-8">
                {/* Mobile Dropdown */}
                <div className="w-full sm:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        aria-label={`Current tab: ${activeTabOption?.label}`}
                      >
                        <span className="flex items-center gap-2">
                          {activeTabOption && (
                            <activeTabOption.icon className="size-4" />
                          )}
                          {activeTabOption?.label}
                        </span>
                        <ChevronDown className="size-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-[--radix-dropdown-menu-trigger-width]"
                      align="end"
                    >
                      {TAB_OPTIONS.map((tab: TabOption) => (
                        <DropdownMenuItem
                          key={tab.value}
                          onClick={() => handleTabChange(tab.value)}
                          className="flex items-center gap-2"
                        >
                          <tab.icon className="size-4" />
                          {tab.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Desktop Tabs */}
                <TabsList
                  className="hidden w-full flex-nowrap overflow-x-auto sm:flex"
                  aria-label="Race details tabs"
                >
                  {TAB_OPTIONS.map((tab: TabOption) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="min-w-max flex-1"
                    >
                      <tab.icon className="mr-2 size-4" />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>
          </div>

          <div
            id="tab-content"
            className="relative min-h-[500px] touch-pan-y"
            role="tabpanel"
            aria-label={`${activeTabOption?.label} content`}
          >
            <ErrorBoundary>
              <TabContent isActive={activeTab === "info"}>
                <TabsContent value="info" className="mt-4">
                  <RaceInfoTab race={race} history={history} />
                </TabsContent>
              </TabContent>
            </ErrorBoundary>

            <ErrorBoundary>
              <TabContent isActive={activeTab === "tickets"}>
                <TabsContent value="tickets" className="mt-4">
                  <TicketSection race={race} />
                </TabsContent>
              </TabContent>
            </ErrorBoundary>

            <ErrorBoundary>
              <TabContent isActive={activeTab === "travel"}>
                <TabsContent value="travel" className="mt-4">
                  <TravelTab race={race} />
                </TabsContent>
              </TabContent>
            </ErrorBoundary>

            <ErrorBoundary>
              <TabContent isActive={activeTab === "schedule"}>
                <TabsContent value="schedule" className="mt-4">
                  <WeatherAndSchedule race={race} />
                </TabsContent>
              </TabContent>
            </ErrorBoundary>

            <ErrorBoundary>
              <TabContent isActive={activeTab === "reviews"}>
                <TabsContent value="reviews" className="mt-4">
                  <ReviewSection raceId={race.id} />
                </TabsContent>
              </TabContent>
            </ErrorBoundary>

            <ErrorBoundary>
              <TabContent isActive={activeTab === "itinerary"}>
                <TabsContent value="itinerary" className="mt-4">
                  <RaceItinerary race={race} />
                </TabsContent>
              </TabContent>
            </ErrorBoundary>
          </div>
        </Tabs>
      </div>

      {/* Scroll to top button with improved accessibility */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="icon"
              variant="secondary"
              onClick={handleScrollToTop}
              className="rounded-full shadow-lg transition-shadow hover:shadow-xl"
              aria-label="Scroll to top of page"
              title="Scroll to top"
            >
              <ArrowUp className="size-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
