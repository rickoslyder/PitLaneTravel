"use client"

import * as React from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import * as Icons from "lucide-react"
import { Search } from "lucide-react"

interface IconSelectorProps {
  value: string
  onChange: (value: string) => void
}

const COMMON_ICONS = [
  "Ticket",
  "Star",
  "Trophy",
  "Medal",
  "Crown",
  "Gift",
  "Heart",
  "Coffee",
  "Utensils",
  "Car",
  "Plane",
  "Hotel",
  "Map",
  "Camera",
  "Music",
  "Tv",
  "Wifi",
  "Umbrella",
  "Glass",
  "UtensilsCrossed",
  "Wine",
  "Sandwich",
  "Pizza",
  "Beer",
  "Bus",
  "Train",
  "Taxi",
  "PartyPopper",
  "Sparkles",
  "ShieldCheck",
  "BadgeCheck",
  "Award",
  "Flag",
  "Clock",
  "Calendar",
  "MapPin",
  "Navigation",
  "Compass",
  "Binoculars",
  "Glasses",
  "Headphones",
  "Mic",
  "Speaker",
  "Radio",
  "Smartphone",
  "Tablet",
  "Monitor"
]

export function IconSelector({ value, onChange }: IconSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const filteredIcons = React.useMemo(() => {
    return COMMON_ICONS.filter(icon =>
      icon.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const IconComponent = value
    ? (Icons[value as keyof typeof Icons] as any)
    : Icons.HelpCircle

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            {IconComponent && <IconComponent className="size-4" />}
            <span>{value || "Select icon..."}</span>
          </div>
          <Icons.ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <div className="flex items-center border-b px-3 pb-2 pt-3">
          <Search className="mr-2 size-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0"
          />
        </div>
        <ScrollArea className="h-[300px]">
          <div className="grid grid-cols-4 gap-2 p-4">
            {filteredIcons.map(icon => {
              const Icon = Icons[icon as keyof typeof Icons] as any
              return (
                <Button
                  key={icon}
                  variant="ghost"
                  size="icon"
                  className={cn("size-12", value === icon && "bg-muted")}
                  onClick={() => {
                    onChange(icon)
                    setOpen(false)
                  }}
                >
                  <Icon className="size-6" />
                </Button>
              )
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
