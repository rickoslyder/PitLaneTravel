/*
<ai_context>
This client component provides a list of projects for the sidebar.
</ai_context>
*/

"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickAccessItem {
  name: string
  url: string
  icon: LucideIcon
  badge?: string
  isNew?: boolean
}

export function NavProjects({ projects }: { projects: QuickAccessItem[] }) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        {projects.map(item => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              className={cn(
                "relative",
                item.isNew && "text-[#B17A50] dark:text-[#c19573]"
              )}
            >
              <a href={item.url}>
                <item.icon
                  className={cn(
                    item.isNew && "text-[#B17A50] dark:text-[#c19573]"
                  )}
                />
                <span>{item.name}</span>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className="ml-auto rounded-sm bg-[#2e2c29]/10 px-1 py-0 text-[10px] text-[#2e2c29] dark:bg-[#c19573]/10 dark:text-[#c19573]"
                  >
                    {item.badge}
                  </Badge>
                )}
                {item.isNew && (
                  <Badge
                    variant="secondary"
                    className="ml-2 rounded-sm bg-[#B17A50]/10 px-1 py-0 text-[10px] text-[#B17A50] dark:bg-[#c19573]/10 dark:text-[#c19573]"
                  >
                    NEW
                  </Badge>
                )}
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <Forward className="text-[#494641]" />
                  <span>Open in New Tab</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-[#B17A50] dark:text-[#c19573]">
                  <Trash2 className="text-current" />
                  <span>Remove from Quick Access</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
