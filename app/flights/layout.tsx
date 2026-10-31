"use server"

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"

export default async function FlightsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-x-clip">
        <div className="flex min-h-screen min-w-0 flex-col">
          <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
            <div className="flex h-14 min-w-0 items-center gap-4 px-4">
              <SidebarTrigger className="-ml-2" />
              <Separator orientation="vertical" className="h-6" />
              <div className="font-medium">Flights</div>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
