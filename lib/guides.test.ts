import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import {
  buildArticleJsonLd,
  buildGuideBreadcrumbJsonLd,
  getGuide,
  listGuides,
  parseGuideSource,
  raceLinkLabel,
  readingMinutesFromMarkdown,
  serializeJsonLd,
  type ArticleJsonLd,
  type BreadcrumbListJsonLd
} from "./guides"

const publishedSlugs = [
  "abu-dhabi-grand-prix-travel-guide",
  "two-races-one-trip-2027",
  "which-race-first-2027"
] as const

function assertArticleShape(jsonLd: ArticleJsonLd, guideSlug: string) {
  expect(jsonLd["@context"]).toBe("https://schema.org")
  expect(jsonLd["@type"]).toBe("Article")
  expect(jsonLd.headline.length).toBeGreaterThan(0)
  expect(jsonLd.description.length).toBeGreaterThan(0)
  expect(jsonLd.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  expect(jsonLd.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  expect(jsonLd.author["@type"]).toBe("Organization")
  expect(jsonLd.author.name.length).toBeGreaterThan(0)
  expect(jsonLd.publisher["@type"]).toBe("Organization")
  expect(jsonLd.publisher.name).toBe("PitLane Travel")
  expect(jsonLd.publisher.url).toBe("https://www.pitlanetravel.com")
  expect(jsonLd.publisher.logo["@type"]).toBe("ImageObject")
  expect(jsonLd.publisher.logo.url).toMatch(/^https:\/\//)
  expect(jsonLd.mainEntityOfPage["@type"]).toBe("WebPage")
  expect(jsonLd.mainEntityOfPage["@id"]).toBe(
    `https://www.pitlanetravel.com/guides/${guideSlug}`
  )
}

function assertBreadcrumbShape(
  jsonLd: BreadcrumbListJsonLd,
  guideSlug: string,
  currentName: string
) {
  expect(jsonLd["@context"]).toBe("https://schema.org")
  expect(jsonLd["@type"]).toBe("BreadcrumbList")
  expect(jsonLd.itemListElement.map(item => item.position)).toEqual([1, 2, 3])
  expect(jsonLd.itemListElement.map(item => item["@type"])).toEqual([
    "ListItem",
    "ListItem",
    "ListItem"
  ])
  expect(jsonLd.itemListElement.map(item => item.name)).toEqual([
    "Home",
    "Guides",
    currentName
  ])
  expect(jsonLd.itemListElement.map(item => item.item)).toEqual([
    "https://www.pitlanetravel.com/",
    "https://www.pitlanetravel.com/guides",
    `https://www.pitlanetravel.com/guides/${guideSlug}`
  ])
}

describe("guide content loader", () => {
  it("loads the published guides from content/guides", () => {
    const guides = listGuides()

    expect(guides.map(guide => guide.slug)).toEqual([...publishedSlugs])
    for (const guide of guides) {
      expect(guide.publishedAt).toBe("2026-10-31")
      expect(guide.updatedAt).toBe("2026-10-31")
      expect(guide.author).toBe("PitLane Travel")
      expect(guide.heroImage).toBeUndefined()
      expect(guide.relatedRaces.length).toBeGreaterThan(0)
      expect(guide.readingMinutes).toBeGreaterThan(5)
      expect(guide.body.startsWith(`# ${guide.headline}`)).toBe(true)
    }
  })

  it("returns null for an unknown slug", () => {
    expect(getGuide("not-a-guide")).toBeNull()
  })

  it("keeps the writer copy and rewrites only site links to relative paths", () => {
    const which = getGuide("which-race-first-2027")
    const two = getGuide("two-races-one-trip-2027")
    expect(which).not.toBeNull()
    expect(two).not.toBeNull()

    expect(which!.headline).toBe(
      "Which motorsport race should you go to first? F1, MotoGP, Le Mans, Formula E or the Indy 500"
    )
    expect(which!.body).toContain(
      'Pick the series by the kind of weekend you want, not by which one is "best".'
    )
    expect(which!.body).toContain(
      "https://corp.formula1.com/2027-calendar-announced-with-10-sprint-events/"
    )
    expect(which!.body).toContain("](/races/british-grand-prix-2026-f1-2026)")
    expect(which!.body).toContain(
      "[Two Races, One Trip: Best Cross-Series Pairings for 2027](/guides/two-races-one-trip-2027)"
    )

    expect(two!.headline).toBe(
      "Two races, one trip: the best cross-series pairings for 2027"
    )
    expect(two!.body).toContain(
      "Yes, you can see two series on one trip in 2027."
    )
    expect(two!.body).toContain(
      "https://www.24h-lemans.com/en/news/tickets-go-on-sale-on-friday-6-november-for-next-year-s-24-hours-of-le-mans-61106"
    )
    expect(two!.body).toContain(
      "[Which motorsport race should you go to first?](/guides/which-race-first-2027)"
    )

    for (const guide of [which!, two!]) {
      expect(guide.body).not.toContain("pitlanetravel.com")
      expect(guide.body).not.toContain("editor_flags")
      expect(guide.body).not.toContain("/workspace/")
      expect(guide.body).not.toContain("Internal: Scout")
      expect(guide.body).not.toContain("**Prices used:**")
      expect(guide.body).not.toContain("\nNotes:\n")
      expect(guide.body).not.toContain("(TBD)")
      expect(guide.body).not.toContain("Editor:")
      expect(guide.body).toContain("## Date verification (checked 31 Oct 2026)")
      expect(guide.body).toContain("## Sources")
    }
  })

  it("does not publish editorial frontmatter in the source files", () => {
    for (const slug of publishedSlugs) {
      const source = readFileSync(
        path.join(process.cwd(), "content", "guides", `${slug}.mdx`),
        "utf8"
      )
      expect(source).not.toContain("editor_flags")
      expect(source).not.toContain("alt_title")
      expect(source).not.toContain("word_count")
      expect(source).not.toContain("meta_option_2")
    }
  })

  it("refuses to publish a guide that contains HOLD or TODO", () => {
    const source = `---
title: "Hello"
description: "A short dek."
slug: hello-guide
publishedAt: 2026-10-31
updatedAt: 2026-10-31
author: PitLane Travel
---

# Hello

TODO: finish this.
`
    expect(() => parseGuideSource(source, "hello-guide.mdx")).toThrow(/TODO/)
    expect(() =>
      parseGuideSource(
        source.replace("TODO: finish this.", "HOLD this."),
        "hello-guide.mdx"
      )
    ).toThrow(/HOLD/)
  })

  it("rejects frontmatter that does not match the filename", () => {
    const source = `---
title: "Hello"
description: "A short dek."
slug: hello-guide
publishedAt: 2026-10-31
updatedAt: 2026-10-31
author: PitLane Travel
---

# Hello

A sentence.
`
    expect(parseGuideSource(source, "hello-guide.mdx").slug).toBe("hello-guide")
    expect(() => parseGuideSource(source, "other-guide.mdx")).toThrow(
      /filename/
    )
    expect(() =>
      parseGuideSource(
        source.replace(
          "author: PitLane Travel\n",
          "author: PitLane Travel\neditor_flags:\n  - hidden\n"
        ),
        "hello-guide.mdx"
      )
    ).toThrow(/frontmatter/)
  })

  it("counts reading time from prose rather than citation URLs", () => {
    expect(readingMinutesFromMarkdown("one two three")).toBe(1)
    const words = Array.from({ length: 221 }, () => "word").join(" ")
    expect(readingMinutesFromMarkdown(words)).toBe(2)
    expect(
      readingMinutesFromMarkdown(
        `[label](https://example.com/${"a".repeat(500)}) word`
      )
    ).toBe(1)
  })

  it("labels related race slugs for the article footer", () => {
    expect(raceLinkLabel("british-grand-prix-2026-f1-2026")).toBe(
      "British Grand Prix"
    )
    expect(raceLinkLabel("24-hours-of-le-mans-2026-wec-2026")).toBe(
      "24 Hours of Le Mans"
    )
    expect(raceLinkLabel("london-e-prix-2026-race-1-formula-e-2026")).toBe(
      "London E-Prix"
    )
    expect(
      raceLinkLabel(
        "grand-prix-of-san-marino-and-the-rimini-riviera-2026-motogp-2026"
      )
    ).toBe("Grand Prix of San Marino and the Rimini Riviera")
  })
})

describe("guide JSON-LD shape", () => {
  it("matches Article and BreadcrumbList for both published guides", () => {
    for (const slug of publishedSlugs) {
      const guide = getGuide(slug)
      expect(guide).not.toBeNull()
      const article = buildArticleJsonLd(guide!)
      const breadcrumb = buildGuideBreadcrumbJsonLd(guide!)

      assertArticleShape(article, slug)
      assertBreadcrumbShape(breadcrumb, slug, guide!.title)
      expect(article.headline).toBe(guide!.headline)
      expect(article.datePublished).toBe(guide!.publishedAt)
      expect(article.dateModified).toBe(guide!.updatedAt)
      expect(article.author.name).toBe(guide!.author)
      expect(article).not.toHaveProperty("image")
      expect(JSON.parse(serializeJsonLd(article))).toEqual(article)
      expect(JSON.parse(serializeJsonLd(breadcrumb))).toEqual(breadcrumb)
    }
  })

  it("adds an absolute image only when a hero is present", () => {
    const guide = getGuide("which-race-first-2027")
    expect(guide).not.toBeNull()

    const relative = buildArticleJsonLd({
      ...guide!,
      heroImage: "/images/example-hero.jpg"
    })
    expect(relative.image).toBe(
      "https://www.pitlanetravel.com/images/example-hero.jpg"
    )

    const remote = buildArticleJsonLd({
      ...guide!,
      heroImage: "https://cdn.example/hero.jpg"
    })
    expect(remote.image).toBe("https://cdn.example/hero.jpg")
  })

  it("escapes angle brackets so JSON-LD cannot close the script tag", () => {
    const serialized = serializeJsonLd({ headline: "</script><script>" })
    expect(serialized).not.toContain("</")
    expect(serialized).toContain("\\u003c")
    expect(JSON.parse(serialized)).toEqual({ headline: "</script><script>" })
  })
})
