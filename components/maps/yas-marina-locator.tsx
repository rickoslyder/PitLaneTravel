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

const OSM_COPYRIGHT_HREF = "https://www.openstreetmap.org/copyright"
const ODBL_HREF = "https://opendatacommons.org/licenses/odbl/1-0/"
const NATURAL_EARTH_HREF =
  "https://www.naturalearthdata.com/about/terms-of-use/"
const OSM_DERIVED_HREF = "/data/maps/yas-marina-osm-derived.json"
const NORTH_GRANDSTAND_HREF =
  "https://www.abudhabigp.com/en/formula1/tickets-2026/north-grandstand-4day"

const SEATING_ALT =
  "North-up Yas Marina Circuit locator with Main, West, North, South and Marina grandstands and an approximate Abu Dhabi Hill point, numbered to a six-area key."

const STAY_ALT =
  "Coastal map placing central Abu Dhabi west of Yas Island and Dubai to the northeast, with Dubai Marina and Downtown Dubai examples and a local inset showing Al Danah, Yas Island and Yas Marina Circuit."

const linkClass = "text-foreground underline underline-offset-2"

type Art = {
  svg: string
  png: string
  width: number
  height: number
}

type KeyItem = {
  name: string
  detail: string
}

type LocatorKind = "seating" | "stay-zones"

const seatingKey: KeyItem[] = [
  { name: "Main", detail: "Start / finish" },
  { name: "West", detail: "Turns 6–7" },
  { name: "North", detail: "Turn 5" },
  { name: "South", detail: "Turn 9" },
  { name: "Marina", detail: "Support-pit building" },
  {
    name: "Abu Dhabi Hill",
    detail: "Approximate area, not an entrance"
  }
]

const stayKey: KeyItem[] = [
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

function Credits({ naturalEarth }: { naturalEarth: boolean }) {
  return (
    <p>
      <a className={linkClass} href={OSM_COPYRIGHT_HREF}>
        © OpenStreetMap contributors
      </a>
      {" · "}
      <a className={linkClass} href={ODBL_HREF}>
        ODbL
      </a>
      {naturalEarth ? (
        <>
          {" · "}
          <a className={linkClass} href={NATURAL_EARTH_HREF}>
            Made with Natural Earth
          </a>
        </>
      ) : null}
      {" · "}
      <a className={linkClass} href={OSM_DERIVED_HREF}>
        OpenStreetMap-derived source data
      </a>
    </p>
  )
}

function SeatingCaption() {
  return (
    <p>
      Seating-area locator using OpenStreetMap circuit and building data;
      positions cross-checked against the promoter&apos;s{" "}
      <a className={linkClass} href={NORTH_GRANDSTAND_HREF}>
        2026 North Grandstand location map
      </a>{" "}
      on 8 November 2026. Hill marker is approximate, not an entrance. Not a
      seat-view, shade or access-route map.
    </p>
  )
}

function StayCaption() {
  return (
    <p>
      Geographic locator, not navigation. Al Danah represents one downtown Abu
      Dhabi area; Dubai Marina and Downtown Dubai are examples, not all Dubai.
      OpenStreetMap named-area and circuit data and a generalized Natural Earth
      coastline, checked 8 November 2026. No travel times or routes. Place
      sources:{" "}
      <a
        className={linkClass}
        href="https://www.openstreetmap.org/relation/13251311"
      >
        Al Danah
      </a>
      ,{" "}
      <a
        className={linkClass}
        href="https://www.openstreetmap.org/relation/13251334"
      >
        Yas Island
      </a>
      ,{" "}
      <a
        className={linkClass}
        href="https://www.openstreetmap.org/relation/11912728"
      >
        Dubai Marina
      </a>
      , and{" "}
      <a
        className={linkClass}
        href="https://www.openstreetmap.org/way/1012139061"
      >
        Downtown Dubai
      </a>
      .
    </p>
  )
}

function AreaKey({ title, items }: { title: string; items: KeyItem[] }) {
  return (
    <div>
      <p className="text-foreground font-medium">{title}</p>
      <ol className="mt-2 list-decimal space-y-1 pl-5">
        {items.map(item => (
          <li key={item.name}>
            <span className="text-foreground font-medium">{item.name}</span>
            {": "}
            {item.detail}
          </li>
        ))}
      </ol>
    </div>
  )
}

function InlineArt({
  mobile,
  desktop,
  alt,
  loading,
  aspectClass
}: {
  mobile: Art
  desktop: Art
  alt: string
  loading: "eager" | "lazy"
  aspectClass: string
}) {
  return (
    <picture>
      <source
        media="(max-width: 639px)"
        srcSet={mobile.svg}
        type="image/svg+xml"
        width={mobile.width}
        height={mobile.height}
      />
      <source
        media="(max-width: 639px)"
        srcSet={mobile.png}
        type="image/png"
        width={mobile.width}
        height={mobile.height}
      />
      <source
        srcSet={desktop.svg}
        type="image/svg+xml"
        width={desktop.width}
        height={desktop.height}
      />
      <img
        src={desktop.png}
        alt={alt}
        width={desktop.width}
        height={desktop.height}
        loading={loading}
        decoding="async"
        data-locator-art="inline"
        style={{ width: "100%", height: "auto" }}
        className={`block max-w-full ${aspectClass}`}
      />
    </picture>
  )
}

export function YasMarinaLocator({ kind }: { kind: LocatorKind }) {
  const seating = kind === "seating"
  const alt = seating ? SEATING_ALT : STAY_ALT
  const expandLabel = seating ? "Expand seating map" : "Expand stay-zone map"
  const title = seating
    ? "Yas Marina seating locator"
    : "Abu Dhabi stay-zone locator"
  const keyTitle = seating ? "Seating key" : "Stay-zone key"
  const items = seating ? seatingKey : stayKey
  const mobile: Art = seating
    ? {
        svg: "/images/maps/yas-marina-seating-375.svg",
        png: "/images/maps/yas-marina-seating-375.png",
        width: 375,
        height: 1045
      }
    : {
        svg: "/images/maps/abu-dhabi-stay-zones-375.svg",
        png: "/images/maps/abu-dhabi-stay-zones-375.png",
        width: 375,
        height: 1070
      }
  const desktop: Art = seating
    ? {
        svg: "/images/maps/yas-marina-seating-desktop.svg",
        png: "/images/maps/yas-marina-seating-desktop.png",
        width: 1200,
        height: 960
      }
    : {
        svg: "/images/maps/abu-dhabi-stay-zones-desktop.svg",
        png: "/images/maps/abu-dhabi-stay-zones-desktop.png",
        width: 1200,
        height: 1010
      }
  const aspectClass = seating
    ? "aspect-[1200/960] max-sm:aspect-[375/1045]"
    : "aspect-[1200/1010] max-sm:aspect-[375/1070]"
  // The seating locator starts in the first viewport. Load it then, without
  // fetchpriority, so it is not treated as the LCP image.
  const loading = seating ? "eager" : "lazy"

  return (
    <figure
      data-locator={seating ? "yas-marina-seating" : "abu-dhabi-stay-zones"}
      className="my-6 max-w-full"
    >
      <InlineArt
        mobile={mobile}
        desktop={desktop}
        alt={alt}
        loading={loading}
        aspectClass={aspectClass}
      />
      <figcaption className="text-muted-foreground mt-3 space-y-3 text-sm leading-relaxed">
        {seating ? <SeatingCaption /> : <StayCaption />}
        <AreaKey title={keyTitle} items={items} />
        <Credits naturalEarth={!seating} />
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">
              {expandLabel}
            </Button>
          </DialogTrigger>
          <DialogContent className="flex max-h-[90vh] w-[min(calc(100%-2rem),1240px)] max-w-none flex-col gap-4 overflow-hidden">
            <DialogHeader className="shrink-0 pr-8">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="sr-only">
                {seating
                  ? "Full seating locator with its legend, key, and source links."
                  : "Full stay-zone locator with its legend, key, and source links."}
              </DialogDescription>
            </DialogHeader>
            <div
              tabIndex={0}
              aria-label={expandLabel}
              className="min-h-0 flex-1 overflow-auto"
            >
              <img
                src={desktop.svg}
                alt={alt}
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
            </div>
            <div className="text-muted-foreground shrink-0 space-y-3 text-sm leading-relaxed">
              {seating ? <SeatingCaption /> : <StayCaption />}
              <AreaKey title={keyTitle} items={items} />
              <Credits naturalEarth={!seating} />
            </div>
          </DialogContent>
        </Dialog>
      </figcaption>
    </figure>
  )
}
