/*
<ai_context>
Configures Next.js for the app. Single source of truth — do NOT add a next.config.js
alongside this file (Next resolves .js before .mjs and would silently shadow this).

Note: we intentionally do not expose DUFFEL_ACCESS_TOKEN / GOOGLE_MAPS_API_KEY via the
`env` block — that inlines secrets into the client bundle. Server code reads them from
process.env directly.
</ai_context>
*/

import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const {
  RacesStylesheetManifestPlugin
} = require("./config/races-stylesheet-manifest.cjs")
const polyfillModule = require.resolve(
  "next/dist/build/polyfills/polyfill-module.js"
)
const stripBaselinePolyfillsLoader = fileURLToPath(
  new URL("./config/strip-baseline-polyfills-loader.cjs", import.meta.url)
)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Do not set experimental.inlineCss. Next puts the whole Tailwind sheet in
  // a render-blocking <style> and again in the flight payload, which raises
  // mobile FCP and the /series/f1 main-thread time.
  // Guide markdown is read from disk at build and again when the sitemap
  // regenerates. Keep the files in the server trace for those routes.
  outputFileTracingIncludes: {
    "/guides": ["./content/guides/**/*"],
    "/guides/[slug]": ["./content/guides/**/*"],
    "/guides/[slug]/[subpage]": ["./content/guides/**/*"],
    "/sitemap.xml": ["./content/guides/**/*"],
    // The href is a build artifact. .next/static is not in the server function
    // on Vercel, so /races must not discover the sheet by reading those files.
    "/races": ["./.next/races-stylesheet-manifest.json"]
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "vsszkzazjhvlecyryzon.supabase.co" },
      // Ticket-reseller and track-map images come from many third-party hosts.
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" }
    ]
  },
  // .browserslistrc raises the compile target, but Next 15.5 still imports
  // next/dist/build/polyfills/polyfill-module into every client runtime.
  // Alias that module out. Its flagged polyfills are native on Safari 16 /
  // Chrome 93. URL.canParse (Safari 17) is in the same module and has no
  // caller in the production client bundles.
  // posthog-js is prebuilt, so browserslist cannot remove the Math.trunc
  // polyfill Lighthouse reports from its chunk. The loader drops that
  // assignment only.
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      [polyfillModule]: false,
      "../build/polyfills/polyfill-module": false,
      "next/dist/build/polyfills/polyfill-module": false
    }
    config.module.rules.push({
      test: /[\\/]posthog-js[\\/]dist[\\/].+\.js$/,
      enforce: "pre",
      loader: stripBaselinePolyfillsLoader
    })
    config.plugins.push(new RacesStylesheetManifestPlugin())
    return config
  }
}

export default nextConfig
