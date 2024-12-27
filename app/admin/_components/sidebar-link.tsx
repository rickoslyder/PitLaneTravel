"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Circle, Home, Plane } from "lucide-react"

interface SidebarLinkProps {
  href: string
  iconName: string
  children: React.ReactNode
}

const iconMap = {
  home: Home,
  circle: Circle,
  plane: Plane
}

export default function SidebarLink({
  href,
  iconName,
  children
}: SidebarLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href
  const Icon = iconMap[iconName as keyof typeof iconMap]

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900",
        isActive && "bg-gray-100 text-gray-900"
      )}
    >
      <Icon className="size-4" />
      <span>{children}</span>
    </Link>
  )
}
