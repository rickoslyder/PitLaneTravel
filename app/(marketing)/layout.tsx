/*
<ai_context>
This server layout provides a shared header and basic structure for (marketing) routes.
</ai_context>
*/

"use server"

import Header from "@/components/header"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { SERIES } from "@/config/series"

export default async function MarketingLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex-1">{children}</div>

      <footer className="border-t">
        <div className="mx-auto max-w-screen-2xl space-y-8 px-4 py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <h3 className="text-lg font-semibold">About PitLane Travel</h3>
              <p className="text-muted-foreground mt-4 text-sm">
                Your trusted platform for motorsport travel planning. We help
                make attending races seamless and unforgettable.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Championships</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {SERIES.map(s => (
                  <li key={s.slug}>
                    <Link
                      href={`/series/${s.slug}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link
                    href="/races"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Race Calendar
                  </Link>
                </li>
                <li>
                  <Link
                    href="/packages"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Travel Packages
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Support</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link
                    href="/faq"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cancellation"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cancellation Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <Separator />

          <div className="text-muted-foreground flex flex-col items-center justify-between gap-4 text-center text-sm md:flex-row md:text-left">
            <p>
              © {new Date().getFullYear()} PitLane Travel. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
