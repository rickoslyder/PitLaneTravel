/*
<ai_context>
The root server layout for the app.
</ai_context>
*/

import {
  createProfileAction,
  getProfileByUserIdAction
} from "@/actions/db/profiles-actions"
import { AnalyticsController } from "@/components/privacy/analytics-controller"
import {
  PostHogPageview,
  PostHogUserIdentify,
  Toaster
} from "@/components/utilities/deferred-analytics"
import { Providers } from "@/components/utilities/providers"
import { TailwindIndicator } from "@/components/utilities/tailwind-indicator"
import { cn } from "@/lib/utils"
import { brand, brandCopy } from "@/config/brand"
import { getPackagesAvailability } from "@/lib/packages-availability"
import { DEFAULT_OG_IMAGE_URL, SITE_ORIGIN } from "@/lib/site-metadata"
import { racesCriticalUnblockScript } from "@/lib/races-critical-unblock"
import { racesCriticalCss } from "@/lib/races-critical-css"
import { racesInlineFontCss } from "@/lib/races-critical-font"
import {
  deferInterFontScript,
  shouldDeferInterFont
} from "@/lib/defer-inter-font"
import { loadRacesStylesheetManifest } from "@/lib/races-stylesheet-manifest"
import { getAuthedUserId } from "@/lib/auth"
import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata } from "next"
import { headers } from "next/headers"

export async function generateMetadata(): Promise<Metadata> {
  const availability = await getPackagesAvailability()
  const copy = brandCopy(availability.siteWide)

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: brand.name,
    description: copy.description,
    applicationName: brand.name,
    creator: brand.name,
    publisher: brand.name,
    // "./" resolves to the current path and drops query strings, so
    // /races/[slug]?tab=info canonicalizes to the path.
    alternates: { canonical: "./" },
    openGraph: {
      type: "website",
      siteName: brand.name,
      images: [{ url: DEFAULT_OG_IMAGE_URL, alt: brand.name }]
    }
  }
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = (await headers()).get("x-pathname")
  const deferRacesCss = pathname === "/races" || pathname === "/races/"
  const fontManifest = loadRacesStylesheetManifest()
  const deferInterFont = shouldDeferInterFont(pathname, fontManifest.fontHref)
  const interFallbackCss = deferInterFont ? racesInlineFontCss() : ""
  const userId = await getAuthedUserId()

  if (userId) {
    try {
      console.log("[Layout] Checking profile for user:", userId)
      const profileRes = await getProfileByUserIdAction(userId)

      if (!profileRes.isSuccess) {
        console.log("[Layout] Profile check result:", profileRes.message)

        // Only create if get fails due to not found
        if (profileRes.message === "Profile not found") {
          console.log("[Layout] Creating new profile for user:", userId)
          const createRes = await createProfileAction({ userId })

          if (!createRes.isSuccess) {
            console.error(
              "[Layout] Failed to create profile:",
              createRes.message
            )
            // Don't throw here, let the user continue even if profile creation fails
          } else {
            console.log("[Layout] Profile created successfully")
          }
        } else if (profileRes.message.includes("Database schema error")) {
          console.error("[Layout] Database schema error detected")
          // Don't throw here, let the user continue even if there are schema issues
        }
      } else {
        console.log("[Layout] Existing profile found for user:", userId)
      }
    } catch (error) {
      console.error("[Layout] Error handling profile:", error)
      if (error instanceof Error) {
        console.error("[Layout] Error name:", error.name)
        console.error("[Layout] Error message:", error.message)
        console.error("[Layout] Error stack:", error.stack)
      }
      // Don't throw here, let the user continue even if there are errors
    }
  }

  return (
    <ClerkProvider>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
      <html lang="en" suppressHydrationWarning>
        {deferRacesCss || deferInterFont ? (
          <head>
            {interFallbackCss ? (
              <style
                data-inter-fallback=""
                dangerouslySetInnerHTML={{ __html: interFallbackCss }}
              />
            ) : null}
            {deferInterFont ? (
              <script
                id="defer-inter-font"
                dangerouslySetInnerHTML={{
                  __html: deferInterFontScript(fontManifest.fontHref)
                }}
              />
            ) : null}
            {deferRacesCss && fontManifest.fontPreloadHref ? (
              <link
                rel="preload"
                as="font"
                href={fontManifest.fontPreloadHref}
                crossOrigin="anonymous"
                type="font/woff2"
              />
            ) : null}
            {deferRacesCss ? (
              <style
                data-races-critical=""
                dangerouslySetInnerHTML={{
                  __html: `${racesInlineFontCss()}${racesCriticalCss}`
                }}
              />
            ) : null}
            {deferRacesCss ? (
              <script
                id="races-critical-css-unblock"
                dangerouslySetInnerHTML={{
                  __html: racesCriticalUnblockScript(fontManifest.fontHref)
                }}
              />
            ) : null}
          </head>
        ) : null}
        <body
          className={cn(
            "bg-background mx-auto min-h-screen w-full antialiased motion-safe:scroll-smooth"
          )}
          style={{ fontFamily: 'Inter, "Inter Fallback"' }}
        >
          <a
            href="#main-content"
            className="focus:bg-background focus:text-foreground focus:ring-ring sr-only z-[80] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-md focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2"
          >
            Skip to main content
          </a>
          <Providers
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <AnalyticsController />
            <PostHogUserIdentify />
            <PostHogPageview />

            {children}

            <div
              data-privacy-settings-fallback=""
              className="border-t px-4 py-3 empty:hidden"
            />

            <TailwindIndicator />

            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
