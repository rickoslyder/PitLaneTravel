/*
<ai_context>
This client component provides the sidebar for the app.
</ai_context>
*/

"use client"

import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Calendar,
  Flag,
  MapPin,
  Package,
  Star,
  Ticket,
  Trophy,
  User,
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

// Sample data
const data = {
  user: {
    name: "F1 Fan",
    email: "fan@example.com",
    avatar: "/avatars/default.jpg"
  },
  teams: [
    {
      name: "2024 Season",
      logo: Trophy,
      plan: "Active"
    },
    {
      name: "2023 Archive",
      logo: Calendar,
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
        { title: "Compare", url: "/races/compare" }
      ]
    },
    {
      title: "Travel",
      url: "/packages",
      icon: Package,
      items: [
        { title: "Packages", url: "/packages" },
        { title: "Hotels", url: "/hotels" },
        { title: "Transport", url: "/transport" }
      ]
    },
    {
      title: "Experiences",
      url: "/experiences",
      icon: Star,
      items: [
        { title: "Paddock Club", url: "/experiences/paddock-club" },
        { title: "Team Garages", url: "/experiences/team-garages" },
        { title: "Driver Meet", url: "/experiences/driver-meet" }
      ]
    },
    {
      title: "Account",
      url: "/account",
      icon: User,
      items: [
        { title: "Profile", url: "/account/profile" },
        { title: "Bookings", url: "/account/bookings" },
        { title: "Payments", url: "/account/payments" }
      ]
    }
  ],
  projects: [
    { name: "Saved Races", url: "/saved/races", icon: Flag },
    { name: "Wishlist", url: "/saved/wishlist", icon: Star },
    { name: "Past Trips", url: "/saved/trips", icon: MapPin }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
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
