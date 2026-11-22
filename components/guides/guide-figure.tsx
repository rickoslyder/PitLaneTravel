import type { CSSProperties, ReactNode } from "react"

export type GuideArt = {
  webp: string
  jpg: string
  width: number
  height: number
}

export type GuideFigureModel = {
  id: string
  alt: string
  caption: string
  credit: ReactNode
  mobile: GuideArt
  desktop: GuideArt
  /**
   * Compact photo heroes that can sit in the first viewport. Tall graphics
   * stay lazy so they do not become the priority download.
   */
  priority: boolean
}

const creditLinkClass = "text-foreground underline underline-offset-2"

export function CreditLink({
  href,
  children
}: {
  href: string
  children: ReactNode
}) {
  return (
    <a className={creditLinkClass} href={href}>
      {children}
    </a>
  )
}

export function PhotoCredit({
  author,
  license,
  licenseHref,
  fileHref
}: {
  author: string
  license: string
  licenseHref: string
  fileHref: string
}) {
  return (
    <>
      Photo: {author}, <CreditLink href={licenseHref}>{license}</CreditLink>,
      via <CreditLink href={fileHref}>Wikimedia Commons</CreditLink>. Cropped
      and resized.
    </>
  )
}

export function IllustrationCredit() {
  return (
    <>
      Illustration: PitLane Travel. Icons:{" "}
      <CreditLink href="https://lucide.dev/license">Lucide (ISC)</CreditLink>.
    </>
  )
}

export function MapCredit() {
  return (
    <>
      Illustration: PitLane Travel. Map data{" "}
      <CreditLink href="https://www.openstreetmap.org/copyright">
        © OpenStreetMap contributors
      </CreditLink>{" "}
      (
      <CreditLink href="https://opendatacommons.org/licenses/odbl/1-0/">
        ODbL
      </CreditLink>
      ).{" "}
      <CreditLink href="https://www.naturalearthdata.com/about/terms-of-use/">
        Made with Natural Earth
      </CreditLink>
      .
    </>
  )
}

function aspectStyle(id: string, mobile: GuideArt, desktop: GuideArt): string {
  return `[data-guide-figure="${id}"] img{aspect-ratio:${desktop.width}/${desktop.height}}@media (max-width:639px){[data-guide-figure="${id}"] img{aspect-ratio:${mobile.width}/${mobile.height}}}`
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/**
 * Raw markup so srcset and fetchpriority survive React 18's server renderer.
 * The jpg on the img is the fallback when a browser skips the webp sources.
 */
function pictureMarkup(figure: GuideFigureModel): string {
  const priority = figure.priority ? ' fetchpriority="high"' : ""
  const loading = figure.priority ? "eager" : "lazy"
  return `<picture><source media="(max-width: 639px)" srcset="${figure.mobile.webp}" type="image/webp" width="${figure.mobile.width}" height="${figure.mobile.height}"><source media="(max-width: 639px)" srcset="${figure.mobile.jpg}" type="image/jpeg" width="${figure.mobile.width}" height="${figure.mobile.height}"><source srcset="${figure.desktop.webp}" type="image/webp" width="${figure.desktop.width}" height="${figure.desktop.height}"><img src="${figure.desktop.jpg}" alt="${escapeAttr(figure.alt)}" width="${figure.desktop.width}" height="${figure.desktop.height}" loading="${loading}" decoding="async"${priority} sizes="(max-width: 639px) 100vw, 48rem" class="block h-auto w-full max-w-full"></picture>`
}

export function GuideFigure({ figure }: { figure: GuideFigureModel }) {
  return (
    <figure
      data-guide-figure={figure.id}
      className="guide-figure my-6 max-w-full"
    >
      <style>{aspectStyle(figure.id, figure.mobile, figure.desktop)}</style>
      <div
        className="contents"
        dangerouslySetInnerHTML={{ __html: pictureMarkup(figure) }}
      />
      <figcaption className="text-muted-foreground mt-3 space-y-2 text-sm leading-relaxed">
        <p>{figure.caption}</p>
        <p>{figure.credit}</p>
      </figcaption>
    </figure>
  )
}
