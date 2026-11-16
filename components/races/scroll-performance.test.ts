import { readFileSync } from "node:fs"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { Announcer } from "@/components/races/use-announcer"
import { ProgressIndicator } from "@/components/races/progress-indicator"

function read(path: string) {
  return readFileSync(path, "utf8")
}

describe("scroll announcer markup", () => {
  it("renders one polite live region", () => {
    const html = renderToStaticMarkup(createElement(Announcer))
    expect(html).toContain('role="status"')
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('aria-atomic="true"')
    expect(html).toContain("sr-only")
    expect(html).toContain("data-scroll-announcer")
    expect(html).not.toContain("offsetWidth")
  })
})

describe("scroll progress markup", () => {
  it("starts scaled to empty and does not store progress in markup", () => {
    const html = renderToStaticMarkup(createElement(ProgressIndicator))
    expect(html).toContain("data-scroll-progress")
    expect(html).toContain("data-scroll-progress-bar")
    expect(html).toContain("scale-x-0")
    expect(html).not.toMatch(/width:\s*\d/)
  })
})

describe("scroll handler wiring", () => {
  it("keeps the header listener passive and skips unchanged scroll state", () => {
    const header = read("components/header.tsx")
    expect(header).toContain("isScrolledFromTop")
    expect(header).toContain(
      'addEventListener("scroll", handleScroll, { passive: true })'
    )
    expect(header).toContain("if (next === isScrolledRef.current) return")
    expect(header).not.toContain("setIsScrolled(window.scrollY")
  })

  it("drives the progress bar from a ref instead of setState", () => {
    const progress = read("components/races/progress-indicator.tsx")
    expect(progress).not.toContain("useState")
    expect(progress).toContain("barRef")
    expect(progress).toContain("scrollProgressScale")
    expect(progress).toContain("scrollProgressUsesTimeline")
    expect(progress).toContain("requestAnimationFrame")
    expect(progress).toContain("bar.style.transform = `scaleX(${scale})`")
    expect(progress).toContain(
      'setProperty("animation-timeline", "scroll(root)")'
    )
    expect(progress).toContain("{ passive: true }")
  })

  it("defines Announcer outside the hook and does not force layout", () => {
    const announcer = read("components/races/use-announcer.tsx")
    expect(announcer).not.toContain("offsetWidth")
    expect(announcer.indexOf("function Announcer")).toBeGreaterThan(-1)
    expect(announcer.indexOf("function Announcer")).toBeLessThan(
      announcer.indexOf("function useAnnouncer")
    )
    expect(announcer).toContain("publishLiveMessage")
    expect(announcer).toContain("return { announce, announcerRef, Announcer }")
    expect(announcer).not.toContain("Announcer: () =>")
  })

  it("announces race scroll position from scrollend, not every scroll frame", () => {
    const page = read("components/races/RaceDetailsPage.tsx")
    expect(page).toContain("reduceScrollFlags")
    expect(page).toContain(
      "listenForScrollEnd(window, announcePosition, window)"
    )
    expect(page).toContain("scrollPositionMessage")
    expect(page).toContain(
      'addEventListener("scroll", handleScroll, { passive: true })'
    )
    expect(page).not.toContain("offsetWidth")
    expect(page).not.toContain('announce("At the top of the page")')
    expect(page).not.toContain('announce("Nearing the end of the page")')
  })
})
