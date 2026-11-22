"use server"

import { Suspense } from "react"
import Header from "@/components/header"
import { SiteFooter } from "@/components/site-footer"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { getPackagesAvailability } from "@/lib/packages-availability"
import { RacesBreadcrumb } from "./_components/races-breadcrumb"

async function RacesSiteHeader() {
  const { siteWide } = await getPackagesAvailability()
  return <Header showPackagesLink={siteWide} />
}

async function RacesSiteFooter() {
  const { siteWide } = await getPackagesAvailability()
  return <SiteFooter packagesLive={siteWide} />
}

export default async function RacesLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen min-w-0 flex-col">
      <Suspense fallback={<Header showPackagesLink={false} />}>
        <RacesSiteHeader />
      </Suspense>
      <SidebarProvider className="min-h-0 w-full flex-1">
        <AppSidebar className="lg:!bottom-auto lg:!top-16 lg:!h-[calc(100svh-4rem)]" />
        <SidebarInset id="main-content" tabIndex={-1} className="min-w-0">
          <div className="flex min-h-screen min-w-0 flex-col">
            <header
              data-races-toolbar=""
              className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur"
            >
              <div className="flex h-14 min-w-0 items-center gap-2 px-3 sm:gap-4 sm:px-4">
                <SidebarTrigger className="-ml-1 shrink-0 sm:-ml-2" />
                <Separator orientation="vertical" className="h-6 shrink-0" />
                <RacesBreadcrumb />
              </div>
            </header>

            <div className="min-w-0 flex-1">{children}</div>
            <Suspense fallback={null}>
              <RacesSiteFooter />
            </Suspense>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
