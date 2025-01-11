"use server"

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { auth } from "@clerk/nextjs/server"
import { getProfileAction } from "@/actions/db/profiles-actions"
import { AdminButton } from "@/components/admin/admin-buttons"
import { cookies } from "next/headers"

export default async function TripsLayout({
  children,
  searchParams
}: {
  children: React.ReactNode
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { userId } = await auth()
  let isAdmin = false
  const showAdmin = !searchParams["noadmin"]

  if (userId) {
    const result = await getProfileAction(userId)
    if (result.isSuccess) {
      isAdmin = result.data.isAdmin
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex min-h-screen flex-col">
          <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
            <div className="flex h-14 items-center gap-4 px-4">
              <SidebarTrigger className="-ml-2" />
              <Separator orientation="vertical" className="h-6" />
              <div className="flex flex-1 items-center">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/trips">My Trips</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Trips</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              {isAdmin && showAdmin && <AdminButton type="trips" />}
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
