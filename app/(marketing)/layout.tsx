/*
<ai_context>
This server layout provides a shared header and basic structure for (marketing) routes.
</ai_context>
*/

"use server"

import Header from "@/components/header"
import { Separator } from "@/components/ui/separator"

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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-lg font-semibold">About Pit Lane Travel</h3>
              <p className="text-muted-foreground mt-4 text-sm">
                Your premier destination for Formula 1 travel experiences. We
                make attending F1 races seamless and unforgettable.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a
                    href="/races"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Race Calendar
                  </a>
                </li>
                <li>
                  <a
                    href="/packages"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Travel Packages
                  </a>
                </li>
                <li>
                  <a
                    href="/experiences"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    VIP Experiences
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Support</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a
                    href="/help"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="/faq"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    FAQs
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a
                    href="/privacy"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/refund"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <Separator />

          <div className="text-muted-foreground flex flex-col items-center justify-between gap-4 text-center text-sm md:flex-row md:text-left">
            <p>
              © {new Date().getFullYear()} Pit Lane Travel. All rights
              reserved.
            </p>
            <p>Official F1® Travel Partner</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
