export type BrowserRequestClass = "allow" | "suppress" | "deny"

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
