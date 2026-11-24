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
  RacesStylesheetManifestPlugin,
  embedRacesStylesheetManifest
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
    "/sitemap.xml": ["./content/guides/**/*"]
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
  async redirects() {
    return [
      {
        source: "/blog",
        destination: "/guides",
        permanent: true
      },
      {
        source: "/blog/:path*",
        destination: "/guides",
        permanent: true
      }
    ]
  },
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
    config.plugins ??= []
    config.plugins.push(new RacesStylesheetManifestPlugin())
    return config
  }
}

// Next calls process.exit() when the build finishes, which skips beforeExit,
// and it rewrites server bundles during trace collection after the client
// compiler. Patch the href on the way out of the main build process.
const isMainNextBuild =
  process.argv.includes("build") &&
  process.env.NEXT_PRIVATE_BUILD_WORKER !== "1"
if (isMainNextBuild) {
  let racesStylesheetEmbedded = false
  const embedRacesStylesheetOrFail = () => {
    if (racesStylesheetEmbedded) return 0
    racesStylesheetEmbedded = true
    const result = embedRacesStylesheetManifest()
    if (result.hrefs.length === 0 || result.tokenRemaining > 0) {
      console.error(
        "Races stylesheet href was not embedded into the server bundle"
      )
      return 1
    }
    return 0
  }
  process.on("exit", () => {
    embedRacesStylesheetOrFail()
  })
  const exit = process.exit.bind(process)
  process.exit = code => {
    const failed = embedRacesStylesheetOrFail()
    exit(failed === 1 ? 1 : code)
  }
}

export default nextConfig
