/**
 * Build placeholder. The client compilation replaces this exact string in the
 * emitted server bundles with the public CSS href. Vercel does not include
 * `.next/static` in the server function, so the page cannot discover the file
 * by reading disk.
 */
export const RACES_STYLESHEET_MANIFEST = "__RACES_STYLESHEET_MANIFEST__"

export type RacesStylesheetManifest = {
  hrefs: string[]
  fallbackFontCss: string
  /** Inter sheet. Deferred until load on pages whose LCP is a photo. */
  fontHref: string
}

const emptyManifest: RacesStylesheetManifest = {
  hrefs: [],
  fallbackFontCss: "",
  fontHref: ""
}

function isStylesheetHref(href: unknown): href is string {
  return (
    typeof href === "string" &&
    href.startsWith("/_next/static/css/") &&
    !href.includes('"') &&
    !href.includes("<")
  )
}

export function parseRacesStylesheetManifest(
  raw: string
): RacesStylesheetManifest {
  const parsed: unknown = JSON.parse(raw)
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return emptyManifest
  }
  const record = parsed as {
    hrefs?: unknown
    fallbackFontCss?: unknown
    fontHref?: unknown
  }
  const hrefs = Array.isArray(record.hrefs)
    ? record.hrefs.filter(isStylesheetHref)
    : []
  const fallbackFontCss =
    typeof record.fallbackFontCss === "string" &&
    !record.fallbackFontCss.includes("</")
      ? record.fallbackFontCss
      : ""
  const fontHref = isStylesheetHref(record.fontHref) ? record.fontHref : ""
  return { hrefs, fallbackFontCss, fontHref }
}

/** Href recorded in the server bundle. An unreplaced token yields no links. */
export function loadRacesStylesheetManifest(
  raw = RACES_STYLESHEET_MANIFEST
): RacesStylesheetManifest {
  if (!raw.startsWith("{")) return emptyManifest
  try {
    return parseRacesStylesheetManifest(raw)
  } catch {
    return emptyManifest
  }
}
