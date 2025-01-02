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
  Archive
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
  teams: [
    {
      name: "2025 Season",
      logo: Calendar,
      plan: "Active"
    },
    {
      name: "2024 Archive",
      logo: Archive,
      plan: "Archive"
    }
  ],
  navMain: [
    {
      title: "Races",
      url: "/races",
      icon: Flag,
      isActive: true,
      items: [
        { title: "Calendar", url: "/races" },
        { title: "Map View", url: "/races/map" },
        { title: "Compare Races", url: "/races/compare" }
      ]
    },
    {
      title: "Trips",
      url: "/trips",
      icon: Calendar,
      items: [
        { title: "My Trips", url: "/trips" },
        { title: "Trip Planner", url: "/trips/planner" },
        { title: "Shared Trips", url: "/trips/shared" }
      ]
    },
    {
      title: "Travel",
      url: "/travel",
      icon: Plane,
      items: [
        { title: "Flights", url: "/flights" },
        { title: "My Bookings", url: "/bookings" },
        { title: "Hotels", url: "/travel/hotels" },
        { title: "Transport", url: "/travel/transport" }
      ]
    },
    {
      title: "Circuit Info",
      url: "/circuits",
      icon: Info,
      items: [
        { title: "Grandstands", url: "/circuits/grandstands" },
        { title: "Local Guide", url: "/circuits/guide" },
        { title: "Weather", url: "/circuits/weather" }
      ]
    },
    {
      title: "Account",
      url: "/account",
      icon: User,
      items: [
        { title: "Profile", url: "/account/profile" },
        { title: "My Trips", url: "/account/trips" },
        { title: "Settings", url: "/account/settings" }
      ]
    }
  ],
  projects: [
    { name: "Saved Races", url: "/saved/races", icon: Heart },
    { name: "Trip Plans", url: "/saved/trips", icon: Calendar },
    { name: "Recent Views", url: "/saved/recent", icon: Star }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <PitLaneTravelLogo className="m-2 h-[35px]" />
        {/* <TeamSwitcher teams={data.teams} /> */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
