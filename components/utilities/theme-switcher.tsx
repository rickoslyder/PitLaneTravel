/*
<ai_context>
This client component provides a theme switcher for the app.
</ai_context>
*/

"use client"

import { cn } from "@/lib/utils"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { ButtonHTMLAttributes, ReactNode } from "react"

interface ThemeSwitcherProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
}

export const ThemeSwitcher = ({ className, ...props }: ThemeSwitcherProps) => {
  const { setTheme, theme } = useTheme()
  const isDark = theme === "dark"

  const handleChange = (next: "dark" | "light") => {
    localStorage.setItem("theme", next)
    setTheme(next)
  }

  return (
    <button
      {...props}
      type="button"
      className={cn("p-1 hover:cursor-pointer hover:opacity-50", className)}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => handleChange(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Moon aria-hidden="true" className="size-6" />
      ) : (
        <Sun aria-hidden="true" className="size-6" />
      )}
    </button>
  )
}
