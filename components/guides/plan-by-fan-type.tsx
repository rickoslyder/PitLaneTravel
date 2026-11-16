import Link from "next/link"
import {
  publishedSubpagesForHub,
  raceHubSubpagePath
} from "@/lib/race-hub-subpages"

export function PlanByFanTypeList({
  links,
  showWhenEmpty = false
}: {
  links: readonly { href: string; label: string }[]
  showWhenEmpty?: boolean
}) {
  if (links.length === 0 && !showWhenEmpty) return null

  return (
    <nav aria-label="Plan by fan type" className="mt-12 border-t pt-8">
      <h2 className="text-lg font-semibold">Plan by fan type</h2>
      {links.length > 0 && (
        <ul className="mt-4 space-y-2">
          {links.map(link => (
            <li key={link.href}>
              <Link href={link.href} className="hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}

export function PlanByFanType({ hubSlug }: { hubSlug: string }) {
  const links = publishedSubpagesForHub(hubSlug).map(page => ({
    href: raceHubSubpagePath(page.hubSlug, page.slug),
    label: page.breadcrumbLabel
  }))
  return <PlanByFanTypeList links={links} />
}
