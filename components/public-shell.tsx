import Header from "@/components/header"
import { SiteFooter } from "@/components/site-footer"
import { getPackagesAvailability } from "@/lib/packages-availability"

/**
 * Public pages: one top nav and one footer. Planning tools keep the sidebar.
 */
export async function PublicShell({ children }: { children: React.ReactNode }) {
  const { siteWide } = await getPackagesAvailability()
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip">
      <Header showPackagesLink={siteWide} />
      <div className="min-w-0 flex-1">{children}</div>
      <SiteFooter packagesLive={siteWide} />
    </div>
  )
}
