"use server"

import NotFoundContent from "@/app/_components/not-found-content"
import Header from "@/components/header"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { brand } from "@/config/brand"

export default async function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex-1">
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
          <NotFoundContent />
        </div>
      </div>

      <footer className="border-t">
        <div className="mx-auto max-w-screen-2xl space-y-8 px-4 py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-lg font-semibold">About {brand.name}</h3>
              <p className="text-muted-foreground mt-4 text-sm">
                {brand.positioningShort}
              </p>
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
                    Packages
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
              © {new Date().getFullYear()} {brand.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
