import type { LocatorKeyItem } from "@/components/maps/locator-frame"
import {
  LocatorAreaKey,
  LocatorCredits,
  locatorLinkClass
} from "@/components/maps/locator-frame"

const NORTH_GRANDSTAND_HREF =
  "https://www.abudhabigp.com/en/formula1/tickets-2026/north-grandstand-4day"

export function YasMarinaSeatingDetails({
  items
}: {
  items: LocatorKeyItem[]
}) {
  return (
    <>
      <p>
        Seating-area locator using OpenStreetMap circuit and building data;
        positions cross-checked against the promoter&apos;s{" "}
        <a className={locatorLinkClass} href={NORTH_GRANDSTAND_HREF}>
          2026 North Grandstand location map
        </a>{" "}
        on 8 November 2026. Hill marker is approximate, not an entrance. Not a
        seat-view, shade or access-route map.
      </p>
      <LocatorAreaKey title="Seating key" items={items} />
      <LocatorCredits naturalEarth={false} />
    </>
  )
}
