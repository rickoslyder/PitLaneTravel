/*
<ai_context>
This client component provides a main navigation for the sidebar.
</ai_context>
*/

"use client"

import { usePathname } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Sparkles, type LucideIcon } from "lucide-react"
import { NavLink } from "./nav-link"
import { cn } from "@/lib/utils"

interface SubItem {
  title: string
  url: string
  icon?: LucideIcon
  isPrimary?: boolean
  isNew?: boolean
}

interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  isPremium?: boolean
  items?: SubItem[]
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item => {
          const isActive = item.items?.some(subItem => subItem.url === pathname)

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(
                      "relative",
                      item.isPremium && "text-foreground"
                    )}
                  >
                    {item.icon && (
                      <item.icon
                        className={cn(item.isPremium && "text-foreground")}
                      />
                    )}
                    <span>{item.title}</span>
                    {item.isPremium && (
                      <Sparkles className="text-foreground ml-2 size-4" />
                    )}
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map(subItem => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          className={cn(
                            "relative",
                            subItem.isPrimary && "text-foreground font-medium"
                          )}
                        >
                          <NavLink href={subItem.url}>
                            {subItem.icon && (
                              <subItem.icon className="mr-2 size-4" />
                            )}
                            <span>{subItem.title}</span>
                            {subItem.isNew && (
                              <Badge
                                variant="secondary"
                                className="bg-foreground/10 text-foreground ml-2 rounded-sm px-1 py-0 text-[10px]"
                              >
                                NEW
                              </Badge>
                            )}
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
