"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import {
  Home,
  Circle,
  Trophy,
  Plane,
  Bus,
  Star,
  Ticket,
  MessageSquare,
  Users,
  ChevronRight,
  BarChart,
  Settings,
  Flag,
  Map,
  Package,
  Hotel,
  CreditCard,
  Briefcase,
  ChevronDown,
  DollarSign
} from "lucide-react"
import PitLaneTravelLogo from "@/logos/PitLaneTravelLogo"

interface NavSection {
  title: string
  items: {
    title: string
    href: string
    icon: React.ReactNode
  }[]
}

const sections: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: <Home className="mr-2 size-4" />
      }
    ]
  },
  {
    title: "Race Management",
    items: [
      {
        title: "Races",
        href: "/admin/races",
        icon: <Flag className="mr-2 size-4" />
      },
      {
        title: "Circuits",
        href: "/admin/circuits",
        icon: <Circle className="mr-2 size-4" />
      },
      {
        title: "Supporting Series",
        href: "/admin/series",
        icon: <Trophy className="mr-2 size-4" />
      }
    ]
  },
  {
    title: "Travel & Activities",
    items: [
      {
        title: "Airports",
        href: "/admin/airports",
        icon: <Plane className="mr-2 size-4" />
      },
      {
        title: "Transport",
        href: "/admin/transport",
        icon: <Bus className="mr-2 size-4" />
      },
      {
        title: "Attractions",
        href: "/admin/attractions",
        icon: <Star className="mr-2 size-4" />
      }
    ]
  },
  {
    title: "Sales & Bookings",
    items: [
      {
        title: "Tickets",
        href: "/admin/tickets",
        icon: <Ticket className="mr-2 size-4" />
      },
      {
        title: "Trips",
        href: "/admin/trips",
        icon: <Briefcase className="mr-2 size-4" />
      },
      {
        title: "Flights",
        href: "/admin/flights",
        icon: <Plane className="mr-2 size-4" />
      }
    ]
  },
  {
    title: "Community",
    items: [
      {
        title: "Reviews & Tips",
        href: "/admin/reviews",
        icon: <MessageSquare className="mr-2 size-4" />
      },
      {
        title: "Meetups",
        href: "/admin/meetups",
        icon: <Users className="mr-2 size-4" />
      }
    ]
  },
  {
    title: "System",
    items: [
      {
        title: "Users",
        href: "/admin/users",
        icon: <Users className="mr-2 size-4" />
      },
      {
        title: "Exchange Rates",
        href: "/admin/exchange-rates",
        icon: <DollarSign className="mr-2 size-4" />
      }
    ]
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>(
    sections.map(s => s.title)
  )

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    )
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <PitLaneTravelLogo className="h-[4vh]" />
        </div>
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="flex-1 space-y-2 px-3 py-4">
          {sections.map(section => (
            <div key={section.title}>
              <Button
                variant="ghost"
                className="h-8 w-full justify-between px-2 py-1.5"
                onClick={() => toggleSection(section.title)}
              >
                <span className="text-xs font-semibold uppercase text-gray-400">
                  {section.title}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    expandedSections.includes(section.title)
                      ? "rotate-0"
                      : "-rotate-90"
                  )}
                />
              </Button>

              {expandedSections.includes(section.title) && (
                <div className="ml-2 space-y-0.5">
                  {section.items.map(item => (
                    <Button
                      key={item.href}
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      className="h-8 w-full justify-start py-1"
                      asChild
                    >
                      <Link href={item.href}>
                        {item.icon}
                        {item.title}
                      </Link>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
