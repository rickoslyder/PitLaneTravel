"use server"

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { RacesBreadcrumb } from "./_components/races-breadcrumb"

export default async function RacesLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex min-h-screen flex-col">
          <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
            <div className="flex h-14 min-w-0 items-center gap-2 px-3 sm:gap-4 sm:px-4">
              <SidebarTrigger className="-ml-1 shrink-0 sm:-ml-2" />
              <Separator orientation="vertical" className="h-6 shrink-0" />
              <RacesBreadcrumb />
            </div>
          </header>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
