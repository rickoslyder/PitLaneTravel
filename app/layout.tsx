/*
<ai_context>
The root server layout for the app.
</ai_context>
*/

import {
  createProfileAction,
  getProfileByUserIdAction
} from "@/actions/db/profiles-actions"
import { Toaster } from "@/components/ui/toaster"
import { PostHogPageview } from "@/components/utilities/posthog/posthog-pageview"
import { PostHogUserIdentify } from "@/components/utilities/posthog/posthog-user-identity"
import { Providers } from "@/components/utilities/providers"
import { TailwindIndicator } from "@/components/utilities/tailwind-indicator"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { cn } from "@/lib/utils"
import { ClerkProvider } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { GoogleTagManager } from "@next/third-parties/google"
import { gtmPixelID, gtmServerID } from "@/lib/google-tag-manager"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { PageViewTracker } from "./components/gtm/page-view-tracker"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PitLane Travel",
  description:
    "Your ultimate F1 travel planning platform. Book race tickets, accommodations, and experiences for Formula 1 events worldwide."
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

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
        rel="manifest"
        href="https://progressier.app/fCbsNMgvDZeSMoERSrZK/progressier.json"
      />
      <script
        defer
        async={true}
        src="https://progressier.app/fCbsNMgvDZeSMoERSrZK/script.js"
      ></script>
      <html lang="en" suppressHydrationWarning>
        <GoogleTagManager gtmId={gtmPixelID} />
        <GoogleTagManager gtmId={gtmServerID} />
        <body
          className={cn(
            "bg-background mx-auto min-h-screen w-full scroll-smooth antialiased",
            inter.className
          )}
        >
          <Providers
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <PostHogUserIdentify />
            <PostHogPageview />

            <PageViewTracker userId={userId} />

            {children}

            <TailwindIndicator />
            <SpeedInsights />

            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
