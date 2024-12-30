"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function NavLink({ href, children, className }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "hover:text-foreground block transition-colors",
        isActive ? "text-foreground font-medium" : "text-muted-foreground",
        className
      )}
    >
      {children}
    </Link>
  )
}
