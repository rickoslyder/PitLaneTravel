import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: never[]) => unknown) => fn
}))
vi.mock("next/image", () => ({
  default: (props: { alt?: string }) => createElement("img", { alt: props.alt ?? "" })
}))
vi.mock("framer-motion", () => {
  const passthrough = (props: { children?: unknown }) =>
    createElement("div", props, props.children as never)
  return {
    motion: new Proxy(
      {},
      {
        get: () => passthrough
      }
    ),
    AnimatePresence: (props: { children?: unknown }) =>
      createElement("div", {}, props.children as never),
    useScroll: () => ({ scrollY: 0 }),
    useTransform: () => 1
  }
})
vi.mock("@/hooks/useNextRace", () => ({
  useNextRace: () => ({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    raceName: "",
    isLoading: true,
    error: null,
    nextRace: null
  })
}))
vi.mock("@/lib/analytics/capture", () => ({
  captureAnalyticsEvent: () => ({ status: "ok" })
}))
vi.mock("@clerk/nextjs", () => ({
  SignedIn: (props: { children?: unknown }) =>
    createElement("div", {}, props.children as never),
  SignedOut: (props: { children?: unknown }) =>
    createElement("div", {}, props.children as never),
  SignInButton: (props: { children?: unknown }) =>
    createElement("div", {}, props.children as never),
  SignUpButton: (props: { children?: unknown }) =>
    createElement("div", {}, props.children as never),
  UserButton: () => null
}))
vi.mock("@/components/utilities/theme-switcher", () => ({
  ThemeSwitcher: () => null
}))

const { availability } = vi.hoisted(() => ({
  availability: vi.fn()
}))
vi.mock("@/lib/packages-availability", () => ({
  getPackagesAvailability: (...args: unknown[]) => availability(...args)
}))

import { FeaturesSection } from "@/components/landing/features"
import { HeroSection } from "@/components/landing/hero"
import FaqSection from "@/components/FaqSection"
import WhyChooseFeaturesSection from "@/components/WhyChooseFeaturesSection"
import Header from "@/components/header"
import HelpPage from "@/app/(marketing)/help/page"

function html(element: ReturnType<typeof createElement>): string {
  return renderToStaticMarkup(element)
}

describe("switched copy rendering", () => {
  it("renders None copy without the live package phrases", () => {
    const markup = [
      html(createElement(FeaturesSection, { packagesLive: false })),
      html(createElement(HeroSection, { packagesLive: false })),
      html(createElement(FaqSection, { packagesLive: false })),
      html(createElement(WhyChooseFeaturesSection, { packagesLive: false }))
    ].join("\n")

    expect(markup).toContain("Find tickets")
    expect(markup).toContain("What you can bring")
    expect(markup).toContain("Compare races")
    expect(markup).toContain("Get out on time")
    expect(markup).not.toContain("VIP hospitality")
    expect(markup).not.toContain("Race packages")
    expect(markup).not.toContain("See F1 &amp; MotoGP packages")
    expect(markup).not.toContain("See F1 & MotoGP packages")
  })

  it("renders Live copy", () => {
    const markup = [
      html(createElement(FeaturesSection, { packagesLive: true })),
      html(createElement(HeroSection, { packagesLive: true })),
      html(createElement(FaqSection, { packagesLive: true })),
      html(createElement(WhyChooseFeaturesSection, { packagesLive: true }))
    ].join("\n")

    expect(markup).toContain("Race packages")
    expect(markup).toContain("VIP hospitality")
    expect(markup).toContain("See F1 &amp; MotoGP packages")
    expect(markup).toContain("Can I book a race package or VIP hospitality?")
    expect(markup).toContain(
      "Each package names the travel company that provides it before you book."
    )
  })

  it("shows the Packages nav link only when asked", () => {
    const hidden = html(createElement(Header))
    const shown = html(createElement(Header, { showPackagesLink: true }))
    expect(hidden).not.toContain('href="/packages"')
    expect(shown).toContain('href="/packages"')
  })

  describe("help page", () => {
    beforeEach(() => {
      availability.mockReset()
    })

    it("renders both switch states from getPackagesAvailability", async () => {
      availability.mockResolvedValue({ siteWide: false, byRace: () => false })
      const none = html(await HelpPage())
      expect(none).toContain("Tickets, seats, flights and hotels, answered.")
      expect(none).not.toContain("Packages and VIP")

      availability.mockResolvedValue({ siteWide: true, byRace: () => true })
      const live = html(await HelpPage())
      expect(live).toContain("Packages and VIP")
      expect(live).toContain('href="/packages"')
    })
  })
})
