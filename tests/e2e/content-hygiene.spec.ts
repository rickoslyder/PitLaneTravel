import { listGuides } from "@/lib/guides"
import { FORBIDDEN_PUBLIC_COPY } from "@/lib/public-content-hygiene"
import { publishedRaceHubSubpagePaths } from "@/lib/race-hub-subpages"
import { expect, test } from "./fixtures"

const ABU_DHABI_SUBPAGES = [
  "/guides/abu-dhabi-grand-prix-travel-guide/first-timers",
  "/guides/abu-dhabi-grand-prix-travel-guide/with-kids",
  "/guides/abu-dhabi-grand-prix-travel-guide/what-to-bring"
] as const

function isBlockedPath(pathname: string): boolean {
  return (
    /^\/go(?:\/|$)/.test(pathname) || /^\/api\/redirect(?:\/|$)/.test(pathname)
  )
}

test.describe("public HTML hides internal research references", () => {
  test("GETs public pages over the app origin and never ticket hops", async ({
    request
  }) => {
    const paths = [
      "/",
      "/races",
      "/faq",
      "/guides",
      ...listGuides().map(guide => `/guides/${guide.slug}`),
      ...publishedRaceHubSubpagePaths()
    ]
    expect(new Set(paths).size).toBe(paths.length)
    for (const required of ABU_DHABI_SUBPAGES) {
      expect(paths).toContain(required)
    }

    for (const pathname of paths) {
      expect(pathname.startsWith("/"), pathname).toBe(true)
      expect(pathname.includes("://"), pathname).toBe(false)
      expect(isBlockedPath(pathname), pathname).toBe(false)

      const response = await request.get(pathname, { maxRedirects: 0 })
      expect(response.status(), pathname).toBe(200)

      const url = new URL(response.url())
      expect(url.pathname, pathname).toBe(pathname)
      expect(isBlockedPath(url.pathname), url.href).toBe(false)
      expect(["http:", "https:"]).toContain(url.protocol)

      const html = await response.text()
      expect(html, pathname).toMatch(
        /<link[^>]*rel="canonical"[^>]*href="https:\/\/www\.pitlanetravel\.com/
      )
      for (const rule of FORBIDDEN_PUBLIC_COPY) {
        rule.pattern.lastIndex = 0
        expect(
          rule.pattern.test(html),
          `${pathname} contains ${rule.label}`
        ).toBe(false)
      }
    }
  })
})
