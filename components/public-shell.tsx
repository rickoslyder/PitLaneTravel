import Header from "@/components/header"
import { SiteFooter } from "@/components/site-footer"
import { getPackagesAvailability } from "@/lib/packages-availability"

/**
 * Public pages, including the race calendar: one top nav and one footer.
 * Planning tools keep the sidebar.
 */
export async function PublicShell({
  children,
  showFooter = true
}: {
  children: React.ReactNode
  /** /races renders the footer with the calendar so it is not painted above the grid. */
  showFooter?: boolean
}) {
  const { siteWide } = await getPackagesAvailability()
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip">
      <Header showPackagesLink={siteWide} />
      <main id="main-content" tabIndex={-1} className="min-w-0 flex-1">
        {children}
      </main>
      {showFooter ? <SiteFooter packagesLive={siteWide} /> : null}
    </div>
  )
}
