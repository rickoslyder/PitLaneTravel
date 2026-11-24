import { RacesAdminLinks } from "@/app/races/_components/races-admin-links"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import {
  buildRaceTrailJsonLd,
  racePlanningLinks,
  type RaceTrailCrumb
} from "@/lib/race-trail"
import { serializeJsonLd } from "@/lib/site-metadata"
import Link from "next/link"
import { Fragment, Suspense } from "react"

export function RaceTrail({ items }: { items: readonly RaceTrailCrumb[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 py-3">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildRaceTrailJsonLd(items))
        }}
      />
      <div className="flex min-w-0 items-start justify-between gap-2">
        <Breadcrumb className="min-w-0">
          <BreadcrumbList>
            {items.map((item, index) => {
              const last = index === items.length - 1
              return (
                <Fragment key={`${item.path}-${item.name}`}>
                  {index > 0 ? <BreadcrumbSeparator /> : null}
                  <BreadcrumbItem>
                    {last ? (
                      <BreadcrumbPage>{item.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={item.path}>{item.name}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <Suspense fallback={null}>
          <RacesAdminLinks />
        </Suspense>
      </div>
      <nav
        aria-label="Plan the weekend"
        className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
      >
        {racePlanningLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="text-foreground inline-flex min-h-6 items-center font-medium underline-offset-2 hover:underline"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
