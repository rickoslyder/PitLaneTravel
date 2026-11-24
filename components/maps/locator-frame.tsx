const OSM_COPYRIGHT_HREF = "https://www.openstreetmap.org/copyright"
const ODBL_HREF = "https://opendatacommons.org/licenses/odbl/1-0/"
const NATURAL_EARTH_HREF =
  "https://www.naturalearthdata.com/about/terms-of-use/"
const OSM_DERIVED_HREF = "/data/maps/yas-marina-osm-derived.json"

export const locatorLinkClass = "text-foreground underline underline-offset-2"

/** Small-label teal shared by the seating maps. */
export const seatingKeyTitleClass = "font-medium text-[#08797e]"

export type LocatorArt = {
  svg: string
  png: string
  webp?: string
  width: number
  height: number
}

export type LocatorKeyItem = {
  name: string
  detail: string
}

export function LocatorCredits({ naturalEarth }: { naturalEarth: boolean }) {
  return (
    <p>
      <a className={locatorLinkClass} href={OSM_COPYRIGHT_HREF}>
        © OpenStreetMap contributors
      </a>
      {" · "}
      <a className={locatorLinkClass} href={ODBL_HREF}>
        ODbL
      </a>
      {naturalEarth ? (
        <>
          {" · "}
          <a className={locatorLinkClass} href={NATURAL_EARTH_HREF}>
            Made with Natural Earth
          </a>
        </>
      ) : null}
      {" · "}
      <a className={locatorLinkClass} href={OSM_DERIVED_HREF}>
        OpenStreetMap-derived source data
      </a>
    </p>
  )
}

export function LocatorAreaKey({
  title,
  items,
  titleClassName
}: {
  title: string
  items: LocatorKeyItem[]
  titleClassName?: string
}) {
  return (
    <div>
      <p className={titleClassName ?? "text-foreground font-medium"}>{title}</p>
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

export function LocatorInlineArt({
  mobile,
  desktop,
  alt,
  loading,
  aspectClass
}: {
  mobile: LocatorArt
  desktop: LocatorArt
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
      {mobile.webp ? (
        <source
          media="(max-width: 639px)"
          srcSet={mobile.webp}
          type="image/webp"
          width={mobile.width}
          height={mobile.height}
        />
      ) : null}
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
      {desktop.webp ? (
        <source
          srcSet={desktop.webp}
          type="image/webp"
          width={desktop.width}
          height={desktop.height}
        />
      ) : null}
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
