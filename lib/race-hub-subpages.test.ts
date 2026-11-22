import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import GuidePage from "@/app/(marketing)/guides/[slug]/page"
import {
  generateMetadata,
  generateStaticParams
} from "@/app/(marketing)/guides/[slug]/[subpage]/page"
import { RaceHubSubpageView } from "@/components/guides/race-hub-subpage-view"
import {
  GA_VS_GRANDSTAND_SLUG,
  buildSubpageArticleJsonLd,
  buildSubpageBreadcrumbJsonLd,
  buildSubpageFaqJsonLd,
  duplicateFaqQuestionNames,
  faqSchemaBlocksForPages,
  hubFaqSchemaQuestions,
  parseRaceHubSubpage,
  publishedGuideHref,
  publishedRaceHubSubpagePaths,
  raceHubSubpagePath,
  raceHubSubpageRegistry,
  subpagesForBuild,
  type RaceHubSubpage
} from "@/lib/race-hub-subpages"

const HUB = "abu-dhabi-grand-prix-travel-guide"
const SLUGS = ["first-timers", "with-kids", "what-to-bring"] as const

const COPY = {
  "first-timers": {
    title: "Abu Dhabi GP for first-timers: tickets, app, what to expect",
    description:
      "First Abu Dhabi Grand Prix? How app-only tickets work, what's included, how the concerts work, December weather and UK visa rules. Checked 16 Nov 2026.",
    headline:
      "Abu Dhabi Grand Prix for first-timers: tickets, timings and what to expect at Yas Marina",
    breadcrumbLabel: "First-timers"
  },
  "with-kids": {
    title: "Abu Dhabi GP with kids: tickets, ages and ear protection",
    description:
      "Taking children to the Abu Dhabi GP? Who needs a ticket, 12+ and 21+ areas, baby food, ear protection and getting around Yas Island. Checked 16 Nov 2026.",
    headline:
      "Abu Dhabi Grand Prix with kids: child tickets, age limits, ear protection and food rules",
    breadcrumbLabel: "With kids"
  },
  "what-to-bring": {
    title: "What can you bring to the Abu Dhabi GP? Yas Marina rules",
    description:
      "Abu Dhabi GP bag, camera, flag and water rules, the full Yas Marina banned list, no cloakroom, and a December packing list. Checked 16 Nov 2026.",
    headline:
      "What you can bring to the Abu Dhabi Grand Prix: Yas Marina banned items, bags and cameras",
    breadcrumbLabel: "What to bring"
  }
} as const

function pageBySlug(slug: (typeof SLUGS)[number]): RaceHubSubpage {
  const page = raceHubSubpageRegistry.find(item => item.slug === slug)
  if (!page) throw new Error(`missing ${slug}`)
  return page
}

function renderView(
  page: RaceHubSubpage,
  gaVsGrandstandHref: string | null = null
) {
  return renderToStaticMarkup(
    createElement(RaceHubSubpageView, {
      page,
      siblings: [],
      gaVsGrandstandHref
    })
  )
}

function jsonLdBlocks(html: string): Array<Record<string, unknown>> {
  return [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
    )
  ].map(match => JSON.parse(match[1]) as Record<string, unknown>)
}

describe("Abu Dhabi fan-type sub-page copy", () => {
  it("publishes the three approved pages with the desk titles", () => {
    expect(raceHubSubpageRegistry.map(page => page.slug)).toEqual([...SLUGS])
    for (const slug of SLUGS) {
      const page = pageBySlug(slug)
      expect(page.published).toBe(true)
      expect(page.hubSlug).toBe(HUB)
      expect(page.title).toBe(COPY[slug].title)
      expect(page.description).toBe(COPY[slug].description)
      expect(page.headline).toBe(COPY[slug].headline)
      expect(page.breadcrumbLabel).toBe(COPY[slug].breadcrumbLabel)
      expect(page.hubBreadcrumbLabel).toBe("Abu Dhabi GP")
      expect(page.article).toContain(
        "on the official F1 calendar as of 16 November 2026"
      )
      expect(page.article).not.toContain("when this was drafted")
      expect(page.article).not.toContain(GA_VS_GRANDSTAND_SLUG)
      expect(page.article).not.toContain("/go/")
      expect(page.article).not.toContain("/api/redirect/")
      expect(page.article).not.toMatch(/\bScout\b/)
      expect(page.article).not.toContain("/workspace/")
      expect(page.article).not.toContain("fact-check")
      expect(page.article).not.toMatch(/\bAD\d{1,2}\b/)
      expect(page.article).not.toContain("re-check AD")
      expect(JSON.stringify(page.questions)).not.toMatch(/\bScout\b/)
      expect(JSON.stringify(page.questions)).not.toMatch(/\bAD\d{1,2}\b/)
      expect(page.questions).toHaveLength(5)
      expect(page.questions.every(question => question.includeInFaqPage)).toBe(
        true
      )
    }
    expect(pageBySlug("first-timers").article).toContain(
      "Formula 2 and the AZM GT Trophy support races (official F1 timetable)"
    )
    expect(pageBySlug("first-timers").article).not.toContain(
      "other support races"
    )
    expect(pageBySlug("what-to-bring").article).toContain(
      "That ban doesn't name phones, and the organiser's conditions of entry (January 2025 edition) allow mobile phones and permit recordings for private, non-commercial use only."
    )
    expect(publishedRaceHubSubpagePaths()).toEqual(
      SLUGS.map(slug => raceHubSubpagePath(HUB, slug))
    )
  })

  it("matches each visible FAQ to the FAQPage JSON character for character", () => {
    const blocks = faqSchemaBlocksForPages(raceHubSubpageRegistry)
    expect(duplicateFaqQuestionNames(blocks)).toEqual([])
    const hubNames = new Set(hubFaqSchemaQuestions(HUB))
    expect(hubNames.size).toBeGreaterThan(0)

    for (const page of raceHubSubpageRegistry) {
      const faq = buildSubpageFaqJsonLd(page)
      expect(faq["@type"]).toBe("FAQPage")
      expect(faq.mainEntity).toHaveLength(5)
      faq.mainEntity.forEach((entity, index) => {
        const source = page.questions[index]
        expect(entity.name).toBe(source.question)
        expect(entity.acceptedAnswer.text).toBe(source.answer)
        expect(page.article).toContain(`**${source.question}**`)
        expect(page.article).toContain(source.answer)
        expect(hubNames.has(source.question)).toBe(false)
      })
      const article = buildSubpageArticleJsonLd(page)
      expect(article["@type"]).toBe("Article")
      expect(article.headline).toBe(page.headline)
      expect(article.description).toBe(page.description)
      expect(article.dateModified).toBe("2026-11-16")
      expect(article.mainEntityOfPage["@id"]).toBe(
        `https://www.pitlanetravel.com/guides/${HUB}/${page.slug}`
      )
      expect(JSON.stringify(article)).not.toContain("VideoObject")
      expect(JSON.stringify(article)).not.toContain("SportsEvent")
      expect(JSON.stringify(faq)).not.toContain("VideoObject")
      const breadcrumb = buildSubpageBreadcrumbJsonLd(page)
      expect(breadcrumb.itemListElement.map(item => item.name)).toEqual([
        "Guides",
        "Abu Dhabi GP",
        page.breadcrumbLabel
      ])
      expect(breadcrumb.itemListElement.map(item => item.item)).toEqual([
        "https://www.pitlanetravel.com/guides",
        `https://www.pitlanetravel.com/guides/${HUB}`,
        `https://www.pitlanetravel.com/guides/${HUB}/${page.slug}`
      ])
    }
  })

  it("renders the draft disclosure under the overview and keeps affiliate rels exact", () => {
    const html = renderView(pageBySlug("first-timers"))
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
    expect(html).toContain(
      "Abu Dhabi Grand Prix for first-timers: tickets, timings and what to expect at Yas Marina"
    )
    expect(html).toContain("Formula 2 and the AZM GT Trophy support races")
    expect(html.match(/data-answer-first/g)).toHaveLength(1)
    expect(html).toMatch(
      /data-answer-first[\s\S]*?<\/p>\s*<\/div>\s*<figure[^>]*data-guide-figure="hero-floodlights"[\s\S]*?<\/figure>\s*<div[^>]*>\s*<p[^>]*>Some links on this page are affiliate links\./
    )
    expect(html).toContain(
      'href="https://airalo.pxf.io/PzEM6e" rel="sponsored nofollow"'
    )
    expect(html).not.toContain("noopener")
    expect(html).not.toContain("<video")
    expect(html).not.toContain("<iframe")
    expect(html).not.toContain("VideoObject")
    expect(html).not.toContain("SportsEvent")
    expect(html).not.toContain(GA_VS_GRANDSTAND_SLUG)
    expect(html).toContain("Abu Dhabi GP")
    const types = jsonLdBlocks(html)
      .map(block => block["@type"])
      .sort()
    expect(types).toEqual(["Article", "BreadcrumbList", "FAQPage"])

    const bring = renderView(pageBySlug("what-to-bring"))
    expect(bring).toContain("That ban doesn")
    expect(bring).toContain(
      'href="https://f1.pxf.io/5kEv72" rel="sponsored nofollow"'
    )
    expect(bring.match(/airalo\.pxf\.io\/PzEM6e/g)).toHaveLength(1)

    const withGate = renderView(
      pageBySlug("with-kids"),
      "/guides/which-race-first-2027"
    )
    expect(withGate.match(/General admission vs grandstand/g)).toHaveLength(1)
    expect(publishedGuideHref(GA_VS_GRANDSTAND_SLUG)).toBeNull()
  })

  it("lists the published pages from the hub and in production params", async () => {
    const hubHtml = renderToStaticMarkup(
      await GuidePage({ params: Promise.resolve({ slug: HUB }) })
    )
    expect(hubHtml).toContain("Plan by fan type")
    for (const slug of SLUGS) {
      expect(hubHtml).toContain(raceHubSubpagePath(HUB, slug))
    }

    const previous = process.env.VERCEL_ENV
    try {
      process.env.VERCEL_ENV = "production"
      expect(generateStaticParams()).toEqual(
        SLUGS.map(subpage => ({ slug: HUB, subpage }))
      )
      expect(
        subpagesForBuild(raceHubSubpageRegistry, "production")
      ).toHaveLength(3)
    } finally {
      if (previous === undefined) delete process.env.VERCEL_ENV
      else process.env.VERCEL_ENV = previous
    }

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: HUB, subpage: "first-timers" })
    })
    expect(metadata.alternates).toEqual({
      canonical:
        "https://www.pitlanetravel.com/guides/abu-dhabi-grand-prix-travel-guide/first-timers"
    })
    expect(metadata.robots).toEqual({ index: true, follow: true })
    expect(metadata.title).toBe(
      "Abu Dhabi GP for first-timers: tickets, app, what to expect | PitLane Travel"
    )
  })
})

describe("race hub sub-page template rules", () => {
  const overview = `${Array.from({ length: 66 }, (_, index) => `word${index}`).join(" ")} checked 16 Nov 2026`

  function draftPage(overrides: Record<string, unknown> = {}) {
    return {
      hubSlug: HUB,
      slug: "on-a-budget",
      published: false,
      title: "Budget template",
      breadcrumbLabel: "On a budget",
      description: "Template shape used only by the validator tests.",
      headline: "Budget template headline",
      hubLinkLabel: "Full Abu Dhabi travel guide",
      hubBreadcrumbLabel: "Abu Dhabi GP",
      publishedAt: "2026-11-16",
      updatedAt: "2026-11-16",
      checkedOn: "2026-11-16",
      overview,
      atAGlance: {
        ticket: "Ticket line.",
        stand: "Stand line.",
        transport: "Transport line.",
        stay: "Stay line.",
        budget: "Budget line."
      },
      questions: Array.from({ length: 8 }, (_, index) => ({
        question: `Template budget question ${index}?`,
        answer: `Template budget answer ${index}.`,
        includeInFaqPage: index < 5
      })),
      ...overrides
    }
  }

  it("still rejects a year slug, a short overview, and a redirect href", () => {
    expect(() =>
      parseRaceHubSubpage(draftPage({ slug: "on-a-budget-2026" }))
    ).toThrow(/year/)
    expect(() =>
      parseRaceHubSubpage(
        draftPage({ overview: "Too short, checked 16 Nov 2026." })
      )
    ).toThrow(/60–90/)
    expect(() =>
      parseRaceHubSubpage(
        draftPage({
          affiliateLinks: [
            {
              partner: "Fixture Partner",
              href: "https://example.com/go/out",
              label: "Bad"
            }
          ]
        })
      )
    ).toThrow(/\/go\//)
  })
})
