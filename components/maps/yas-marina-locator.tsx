"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { CircuitSeatingMap } from "@/components/maps/circuit-seating-map"
import {
  LocatorAreaKey,
  LocatorCredits,
  LocatorInlineArt,
  locatorLinkClass,
  type LocatorArt,
  type LocatorKeyItem
} from "@/components/maps/locator-frame"
import { yasMarinaSeatingMap } from "@/data/circuit-seating-maps/yas-marina-circuit"

const STAY_ALT =
  "Coastal map placing central Abu Dhabi west of Yas Island and Dubai to the northeast, with Dubai Marina and Downtown Dubai examples and a local inset showing Al Danah, Yas Island and Yas Marina Circuit."

const stayKey: LocatorKeyItem[] = [
  {
    name: "Downtown Abu Dhabi",
    detail: "Al Danah is the area shown, not the whole city"
  },
  {
    name: "Yas Island",
    detail: "Island boundary, with the circuit in the local detail"
  },
  {
    name: "Dubai",
    detail:
      "3a Dubai Marina and 3b Downtown Dubai are examples, not all of Dubai"
  }
]

function StayCaption() {
  return (
    <p>
      Geographic locator, not navigation. Al Danah represents one downtown Abu
      Dhabi area; Dubai Marina and Downtown Dubai are examples, not all Dubai.
      OpenStreetMap named-area and circuit data and a generalized Natural Earth
      coastline, checked 8 November 2026. No travel times or routes. Place
      sources:{" "}
      <a
        className={locatorLinkClass}
        href="https://www.openstreetmap.org/relation/13251311"
      >
        Al Danah
      </a>
      ,{" "}
      <a
        className={locatorLinkClass}
        href="https://www.openstreetmap.org/relation/13251334"
      >
        Yas Island
      </a>
      ,{" "}
      <a
        className={locatorLinkClass}
        href="https://www.openstreetmap.org/relation/11912728"
      >
        Dubai Marina
      </a>
      , and{" "}
      <a
        className={locatorLinkClass}
        href="https://www.openstreetmap.org/way/1012139061"
      >
        Downtown Dubai
      </a>
      .
    </p>
  )
}

export function YasMarinaLocator({ kind }: { kind: "seating" | "stay-zones" }) {
  if (kind === "seating") {
    return (
      <CircuitSeatingMap
        circuitName="Yas Marina Circuit"
        circuitSlug={yasMarinaSeatingMap.circuitSlug}
        map={yasMarinaSeatingMap}
        grandstands={yasMarinaSeatingMap.pins.map(pin => ({
          slug: pin.slug,
          name: pin.grandstandName
        }))}
      />
    )
  }

  const mobile: LocatorArt = {
    svg: "/images/maps/abu-dhabi-stay-zones-375.svg",
    png: "/images/maps/abu-dhabi-stay-zones-375.png",
    width: 375,
    height: 1070
  }
  const desktop: LocatorArt = {
    svg: "/images/maps/abu-dhabi-stay-zones-desktop.svg",
    png: "/images/maps/abu-dhabi-stay-zones-desktop.png",
    width: 1200,
    height: 1010
  }

  return (
    <figure data-locator="abu-dhabi-stay-zones" className="my-6 max-w-full">
      <LocatorInlineArt
        mobile={mobile}
        desktop={desktop}
        alt={STAY_ALT}
        loading="lazy"
        aspectClass="aspect-[1200/1010] max-sm:aspect-[375/1070]"
      />
      <figcaption className="text-muted-foreground mt-3 space-y-3 text-sm leading-relaxed">
        <StayCaption />
        <LocatorAreaKey title="Stay-zone key" items={stayKey} />
        <LocatorCredits naturalEarth />
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">
              Expand stay-zone map
            </Button>
          </DialogTrigger>
          <DialogContent className="flex max-h-[90vh] w-[min(calc(100%-2rem),1240px)] max-w-none flex-col gap-4 overflow-hidden">
            <DialogHeader className="shrink-0 pr-8">
              <DialogTitle>Abu Dhabi stay-zone locator</DialogTitle>
              <DialogDescription className="sr-only">
                Full stay-zone locator with its legend, key, and source links.
              </DialogDescription>
            </DialogHeader>
            <div
              tabIndex={0}
              aria-label="Expand stay-zone map"
              data-locator-scroll=""
              className="min-h-0 flex-1 overflow-auto"
            >
              <img
                src={desktop.svg}
                alt={STAY_ALT}
                width={desktop.width}
                height={desktop.height}
                decoding="async"
                data-locator-art="expanded"
                style={{
                  width: desktop.width,
                  height: "auto",
                  maxWidth: "none"
                }}
              />
              <div className="text-muted-foreground mt-4 space-y-3 text-sm leading-relaxed">
                <StayCaption />
                <LocatorAreaKey title="Stay-zone key" items={stayKey} />
                <LocatorCredits naturalEarth />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </figcaption>
    </figure>
  )
}
