export type BrowserRequestClass = "allow" | "suppress" | "deny"

export type IsolationRequestMeta = {
  method: string
  url: string
}

export type SuppressionFulfillment = {
  status: 200 | 204
  contentType: "application/json" | "text/plain"
  body: string
}

const EMPTY_SUPPRESSION: SuppressionFulfillment = {
  status: 204,
  contentType: "text/plain",
  body: ""
}

const POSTHOG_INGEST_SUCCESS: SuppressionFulfillment = {
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({ status: 1 })
}

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1"])

const SUPPRESS_HOST_PATTERNS: RegExp[] = [
  /(^|\.)googletagmanager\.com$/i,
  /(^|\.)google-analytics\.com$/i,
  /(^|\.)googleadservices\.com$/i,
  /(^|\.)doubleclick\.net$/i,
  /(^|\.)googlesyndication\.com$/i,
  /server-side-tagging/i,
  /(^|\.)a\.run\.app$/i,
  /(^|\.)progressier\.app$/i,
  /(^|\.)posthog\.invalid$/i,
  /(^|\.)posthog\.com$/i,
  /(^|\.)i\.posthog\.com$/i,
  /(^|\.)vercel-insights\.com$/i,
  /(^|\.)va\.vercel-scripts\.com$/i,
  /(^|\.)clarity\.ms$/i,
  /(^|\.)formula1\.com$/i,
  /(^|\.)supabase\.co$/i,
  /(^|\.)supabase\.in$/i
]

const LITE_YOUTUBE_EMBED_ASSET =
  /^\/gh\/paulirish\/lite-youtube-embed@master\/src\/lite-yt-embed\.(?:css|js)$/i

function hostnameOf(url: URL): string {
  return url.hostname.replace(/\.$/, "")
}

function isLoopback(url: URL): boolean {
  return LOOPBACK_HOSTS.has(hostnameOf(url))
}

function isPostHogIngestPath(url: URL): boolean {
  return url.pathname === "/ingest" || url.pathname.startsWith("/ingest/")
}

function isLocalSupportPath(url: URL): boolean {
  const optimizedSource =
    url.pathname === "/_next/image" ? url.searchParams.get("url") : null
  const optimizesExternalImage =
    optimizedSource != null &&
    /^https?:\/\//i.test(optimizedSource) &&
    !isLoopback(new URL(optimizedSource))

  return (
    url.pathname.startsWith("/_vercel/speed-insights") ||
    url.pathname.startsWith("/_vercel/insights") ||
    isPostHogIngestPath(url) ||
    url.pathname.includes("progressier") ||
    optimizesExternalImage
  )
}

function isKnownLiteYoutubeEmbedAsset(url: URL): boolean {
  return (
    hostnameOf(url) === "cdn.jsdelivr.net" &&
    LITE_YOUTUBE_EMBED_ASSET.test(url.pathname)
  )
}

function isKnownTelemetryOrRemoteAsset(url: URL): boolean {
  const host = hostnameOf(url)
  if (isKnownLiteYoutubeEmbedAsset(url)) {
    return true
  }
  if (
    host === "ci.invalid" &&
    url.pathname.startsWith("/npm/@clerk/clerk-js")
  ) {
    return true
  }
  if (
    (host === "www.pitlanetravel.com" || host === "pitlanetravel.com") &&
    isPostHogIngestPath(url)
  ) {
    return true
  }
  if (SUPPRESS_HOST_PATTERNS.some(pattern => pattern.test(host))) {
    return true
  }
  return false
}

export function classifyBrowserRequest(urlString: string): BrowserRequestClass {
  let url: URL
  try {
    url = new URL(urlString)
  } catch {
    return "deny"
  }

  if (
    url.protocol === "data:" ||
    url.protocol === "blob:" ||
    url.protocol === "about:"
  ) {
    return "allow"
  }

  if (isLoopback(url)) {
    if (isLocalSupportPath(url)) {
      return "suppress"
    }
    return "allow"
  }

  if (isKnownTelemetryOrRemoteAsset(url)) {
    return "suppress"
  }

  return "deny"
}

export function suppressionResponseFor(
  request: IsolationRequestMeta
): SuppressionFulfillment {
  if (request.method.toUpperCase() !== "POST") {
    return EMPTY_SUPPRESSION
  }
  if (classifyBrowserRequest(request.url) !== "suppress") {
    return EMPTY_SUPPRESSION
  }

  let url: URL
  try {
    url = new URL(request.url)
  } catch {
    return EMPTY_SUPPRESSION
  }

  if (!isPostHogIngestPath(url)) {
    return EMPTY_SUPPRESSION
  }

  return POSTHOG_INGEST_SUCCESS
}

export function isNetworkOnlyConsoleError(text: string): boolean {
  // Generic "Failed to load resource" is also used for same-origin HTTP 4xx/5xx.
  return (
    /net::ERR_/i.test(text) ||
    /NS_ERROR_/i.test(text) ||
    /ERR_BLOCKED_BY_CLIENT/i.test(text) ||
    /blocked by CORS policy/i.test(text)
  )
}

export function isAppOriginConsoleError(text: string): boolean {
  if (isNetworkOnlyConsoleError(text)) {
    return false
  }
  return true
}
