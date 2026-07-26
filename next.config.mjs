/*
<ai_context>
Configures Next.js for the app. Single source of truth — do NOT add a next.config.js
alongside this file (Next resolves .js before .mjs and would silently shadow this).

Note: we intentionally do not expose DUFFEL_ACCESS_TOKEN / GOOGLE_MAPS_API_KEY via the
`env` block — that inlines secrets into the client bundle. Server code reads them from
process.env directly.
</ai_context>
*/

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "vsszkzazjhvlecyryzon.supabase.co" },
      // Ticket-reseller and track-map images come from many third-party hosts.
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" }
    ]
  }
}

export default nextConfig
