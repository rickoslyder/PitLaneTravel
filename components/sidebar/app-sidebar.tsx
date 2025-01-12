/*
<ai_context>
This client component provides the sidebar for the app.
</ai_context>
*/

"use client"

import {
  Calendar,
  Flag,
  MapPin,
  Plane,
  Star,
  User,
  Map,
  Info,
  Hotel,
  Car,
  Ticket,
  Settings,
  Heart,
  Archive,
  Users,
  Clock,
  Sun,
  Wallet
} from "lucide-react"
import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import PitLaneTravelLogo from "@/logos/PitLaneTravelLogo"
import router from "next/router"
import Link from "next/link"

const data = {
  user: {
    name: "F1 Fan",
    email: "fan@example.com",
    avatar: "/avatars/default.jpg"
  },
  navMain: [
    {
      title: "Race Calendar",
      url: "/races",
      icon: Flag,
      isActive: true,
      isPremium: true,
      items: [
        { title: "2025 Season", url: "/races", isPrimary: true },
        { title: "Interactive Map", url: "/races/map", icon: Map },
        { title: "Compare Events", url: "/races/compare" }
        // { title: "2024 Archive", url: "/races/archive", icon: Archive }
      ]
    },
    {
      title: "My F1 Trips",
      url: "/trips",
      icon: Calendar,
      isPremium: true,
      items: [
        { title: "Active Trips", url: "/trips", isPrimary: true },
        { title: "AI Trip Planner", url: "/trips/planner", isNew: true },
        { title: "Group Trips", url: "/trips/shared", icon: Users },
        { title: "Past Trips", url: "/trips/archive" }
      ]
    },
    {
      title: "Travel Hub",
      url: "/travel",
      icon: Plane,
      items: [
        { title: "Flight Search", url: "/flights", isPrimary: true },
        { title: "Hotels", url: "/hotels", icon: Hotel },
        { title: "Transport", url: "/transport", icon: Car },
        { title: "My Bookings", url: "/bookings", icon: Ticket }
      ]
    },
    {
      title: "Circuit Guides",
      url: "/circuits",
      icon: Info,
      items: [
        {
          title: "Grandstand Guide",
          url: "/circuits/grandstands",
          isPrimary: true
        },
        { title: "Local Area", url: "/circuits/guide", icon: Map },
        { title: "Track Weather", url: "/circuits/weather", icon: Sun }
      ]
    }
  ],
  quickAccess: [
    {
      name: "Saved Items",
      url: "/saved",
      icon: Heart,
      badge: "3"
    },
    {
      name: "Recent Views",
      url: "/recent",
      icon: Clock
    },
    {
      name: "Trip Budget",
      url: "/budget",
      icon: Wallet,
      isNew: true
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link href="/races" className="block px-2 py-4">
          <PitLaneTravelLogo className="h-[34px]" />
        </Link>
      </SidebarHeader>

      <SidebarContent className="space-y-6">
        <NavMain items={data.navMain} />
        <div className="px-2">
          <div className="text-muted-foreground mb-2 px-4 text-xs font-medium">
            Quick Access
          </div>
          <NavProjects projects={data.quickAccess} />
        </div>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
