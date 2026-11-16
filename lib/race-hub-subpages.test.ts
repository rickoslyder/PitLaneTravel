import { readFileSync } from "node:fs"
import path from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import GuidePage from "@/app/(marketing)/guides/[slug]/page"
import RaceHubSubpagePage, {
  generateMetadata,
  generateStaticParams
} from "@/app/(marketing)/guides/[slug]/[subpage]/page"
import { RaceHubSubpageView } from "@/components/guides/race-hub-subpage-view"
import { PlanByFanTypeList } from "@/components/guides/plan-by-fan-type"
import {
  AFFILIATE_LINK_REL,
  GA_VS_GRANDSTAND_SLUG,
  assertNoDuplicateFaqQuestions,
  atAGlanceRows,
  buildSubpageArticleJsonLd,
  buildSubpageBreadcrumbJsonLd,
  buildSubpageFaqJsonLd,
  countWords,
  duplicateFaqQuestionNames,
  faqQuestionsForSchema,
  faqSchemaBlocksForPages,
  hubFaqSchemaQuestions,
  isSubpageVisible,
  parseRaceHubSubpage,
  publishedGuideHref,
  publishedRaceHubSubpagePaths,
  publishedSiblingSubpages,
  publishedSubpagesForHub,
  raceHubSubpagePath,
  raceHubSubpageRegistry,
  subpagesForBuild,
  visibleGuideFaqQuestions,
  type RaceHubSubpage
} from "@/lib/race-hub-subpages"

const HUB = "abu-dhabi-grand-prix-travel-guide"
const SLUGS = ["first-timers", "with-kids", "what-to-bring"] as const

function pageBySlug(slug: string): RaceHubSubpage {
  const page = raceHubSubpageRegistry.find(item => item.slug === slug)
  if (!page) throw new Error(`missing ${slug}`)
  return page
}

function renderView(
  page: RaceHubSubpage,
  options?: {
    siblings?: { href: string; label: string }[]
    gaVsGrandstandHref?: string | null
  }
): string {
  return renderToStaticMarkup(
    createElement(RaceHubSubpageView, {
      page,
      siblings: options?.siblings ?? [],
      gaVsGrandstandHref: options?.gaVsGrandstandHref ?? null
    })
  )
}

function headingLevels(html: string): number[] {
  return [...html.matchAll(/<h([1-6])\b/g)].map(match => Number(match[1]))
}

function jsonLdBlocks(html: string): Array<Record<string, unknown>> {
  return [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
    )
  ].map(match => JSON.parse(match[1]) as Record<string, unknown>)
}

describe("race hub sub-page template", () => {
  it("ships only the three unpublished Abu Dhabi slugs", () => {
    expect(raceHubSubpageRegistry.map(page => page.slug)).toEqual([...SLUGS])
    expect(raceHubSubpageRegistry.map(page => page.hubSlug)).toEqual([
      HUB,
      HUB,
      HUB
    ])
    for (const page of raceHubSubpageRegistry) {
      expect(page.published).toBe(false)
      expect(page.hubBreadcrumbLabel).toBe("Abu Dhabi GP guide")
      expect(countWords(page.overview)).toBeGreaterThanOrEqual(60)
      expect(countWords(page.overview)).toBeLessThanOrEqual(90)
      expect(page.questions.length).toBeGreaterThanOrEqual(6)
      expect(page.questions.length).toBeLessThanOrEqual(10)
      const faqCount = page.questions.filter(
        question => question.includeInFaqPage
      ).length
      expect(faqCount).toBeGreaterThanOrEqual(4)
      expect(faqCount).toBeLessThanOrEqual(6)
    }
    expect(publishedRaceHubSubpagePaths()).toEqual([])
    expect(publishedSubpagesForHub(HUB)).toEqual([])
    expect(SLUGS.map(slug => raceHubSubpagePath(HUB, slug))).toEqual([
      "/guides/abu-dhabi-grand-prix-travel-guide/first-timers",
      "/guides/abu-dhabi-grand-prix-travel-guide/with-kids",
      "/guides/abu-dhabi-grand-prix-travel-guide/what-to-bring"
    ])
  })

  it("copies FAQPage JSON from the same question and answer strings", () => {
    for (const page of raceHubSubpageRegistry) {
      const visible = faqQuestionsForSchema(page)
      const faq = buildSubpageFaqJsonLd(page)
      expect(faq["@type"]).toBe("FAQPage")
      expect(faq.mainEntity).toHaveLength(visible.length)
      faq.mainEntity.forEach((entity, index) => {
        expect(entity.name).toBe(visible[index].name)
        expect(entity.acceptedAnswer.text).toBe(visible[index].text)
        expect(entity.name).toBe(
          page.questions.filter(q => q.includeInFaqPage)[index].question
        )
        expect(entity.acceptedAnswer.text).toBe(
          page.questions.filter(q => q.includeInFaqPage)[index].answer
        )
      })
      const article = buildSubpageArticleJsonLd(page)
      expect(article["@type"]).toBe("Article")
      expect(article.dateModified).toBe(page.updatedAt)
      expect(article.headline).toBe(page.headline)
      expect(article.mainEntityOfPage["@id"]).toBe(
        `https://www.pitlanetravel.com/guides/${HUB}/${page.slug}`
      )
      expect(JSON.stringify(article)).not.toContain("VideoObject")
      expect(JSON.stringify(article)).not.toContain("SportsEvent")
      expect(JSON.stringify(faq)).not.toContain("VideoObject")
      expect(JSON.stringify(faq)).not.toContain("SportsEvent")

      const breadcrumb = buildSubpageBreadcrumbJsonLd(page)
      expect(breadcrumb.itemListElement.map(item => item.position)).toEqual([
        1, 2, 3
      ])
      expect(breadcrumb.itemListElement.map(item => item.name)).toEqual([
        "Guides",
        "Abu Dhabi GP guide",
        page.breadcrumbLabel
      ])
      expect(breadcrumb.itemListElement.map(item => item.item)).toEqual([
        "https://www.pitlanetravel.com/guides",
        `https://www.pitlanetravel.com/guides/${HUB}`,
        `https://www.pitlanetravel.com/guides/${HUB}/${page.slug}`
      ])
    }
  })

  it("fails when a FAQ question is repeated across the hub and its sub-pages", () => {
    const blocks = faqSchemaBlocksForPages(raceHubSubpageRegistry)
    expect(blocks.map(block => block.source)).toEqual([
      `hub:${HUB}`,
      `subpage:${HUB}/first-timers`,
      `subpage:${HUB}/with-kids`,
      `subpage:${HUB}/what-to-bring`
    ])
    expect(duplicateFaqQuestionNames(blocks)).toEqual([])
    const hubNames = hubFaqSchemaQuestions(HUB)
    expect(hubNames).toEqual(
      visibleGuideFaqQuestions(
        readFileSync(
          path.join(
            process.cwd(),
            "content/guides/abu-dhabi-grand-prix-travel-guide.mdx"
          ),
          "utf8"
        ).replace(/^---[\s\S]*?---\n/, "")
      )
    )
    expect(hubNames.length).toBeGreaterThan(0)

    const stolen = {
      ...pageBySlug("first-timers"),
      questions: pageBySlug("first-timers").questions.map((question, index) =>
        index === 0
          ? { ...question, question: hubNames[0], includeInFaqPage: true }
          : question
      )
    }
    expect(() =>
      assertNoDuplicateFaqQuestions(faqSchemaBlocksForPages([stolen]))
    ).toThrow(/FAQPage question appears in more than one schema block/)

    expect(
      duplicateFaqQuestionNames([
        { source: `hub:${HUB}`, names: ["Owned by the hub?"] },
        { source: `subpage:${HUB}/with-kids`, names: ["Owned by the hub?"] }
      ])
    ).toEqual(["Owned by the hub?"])
    expect(
      duplicateFaqQuestionNames([
        { source: `subpage:${HUB}/first-timers`, names: ["Shared sample?"] },
        { source: `subpage:${HUB}/what-to-bring`, names: ["Shared sample?"] }
      ])
    ).toEqual(["Shared sample?"])
  })

  it("shows unpublished pages on preview and local builds and hides them in production", () => {
    const sample = pageBySlug("first-timers")
    expect(isSubpageVisible(sample, "production")).toBe(false)
    expect(isSubpageVisible(sample, "preview")).toBe(true)
    expect(isSubpageVisible(sample, "development")).toBe(true)
    expect(isSubpageVisible(sample, undefined)).toBe(true)
    expect(isSubpageVisible({ published: true }, "production")).toBe(true)
    expect(subpagesForBuild(raceHubSubpageRegistry, "production")).toEqual([])
    expect(
      subpagesForBuild(raceHubSubpageRegistry, "preview").map(page => page.slug)
    ).toEqual([...SLUGS])
    expect(publishedSiblingSubpages(sample)).toEqual([])

    const published = parseRaceHubSubpage({
      ...sample,
      slug: "on-a-budget",
      published: true,
      breadcrumbLabel: "On a budget",
      questions: sample.questions.map(question => ({
        ...question,
        question: question.question.replaceAll("first-timers", "on-a-budget")
      })),
      overview: sample.overview.replaceAll("first-timers", "on-a-budget"),
      affiliateLinks: undefined
    })
    expect(publishedRaceHubSubpagePaths([published])).toEqual([
      "/guides/abu-dhabi-grand-prix-travel-guide/on-a-budget"
    ])
    expect(subpagesForBuild([published], "production")).toHaveLength(1)
    expect(publishedSubpagesForHub(HUB, [published, sample])).toEqual([
      published
    ])
    expect(publishedSiblingSubpages(sample, [published, sample])).toEqual([
      published
    ])
  })

  it("links general admission vs grandstand only when that guide exists", () => {
    expect(publishedGuideHref(GA_VS_GRANDSTAND_SLUG)).toBeNull()
    expect(publishedGuideHref("which-race-first-2027")).toBe(
      "/guides/which-race-first-2027"
    )
    expect(publishedGuideHref("missing-guide")).toBeNull()
  })

  it("rejects a broken sub-page before it can be registered", () => {
    const sample = pageBySlug("first-timers")
    expect(() =>
      parseRaceHubSubpage({ ...sample, slug: "first-timers-2026" })
    ).toThrow(/year/)
    expect(() => parseRaceHubSubpage({ ...sample, slug: "families" })).toThrow(
      /with-kids/
    )
    expect(() =>
      parseRaceHubSubpage({
        ...sample,
        overview: "Too short, checked 16 Nov 2026."
      })
    ).toThrow(/60–90/)
    expect(() =>
      parseRaceHubSubpage({
        ...sample,
        questions: sample.questions.map(question => ({
          ...question,
          answer: `${question.answer} VideoObject`
        }))
      })
    ).toThrow(/VideoObject/)
    expect(() =>
      parseRaceHubSubpage({
        ...sample,
        affiliateLinks: [
          {
            partner: "Fixture Partner",
            href: "https://example.com/go/out",
            label: "Bad"
          }
        ]
      })
    ).toThrow(/\/go\//)
  })

  it("renders one H1, the disclosure under the overview, and no video player", () => {
    const page = pageBySlug("first-timers")
    const html = renderView(page)
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
    expect(html).not.toContain("<main")
    expect(html).not.toContain("VideoObject")
    expect(html).not.toContain("SportsEvent")
    expect(html).not.toContain("<video")
    expect(html).not.toContain("<iframe")
    expect(html).toContain('data-video-slot="placeholder"')
    expect(html).toContain('scope="col"')
    expect(html).toContain('scope="row"')
    expect(html).toContain("<caption ")
    expect(atAGlanceRows(page).map(row => row.topic)).toEqual([
      "Ticket",
      "Stand",
      "Transport",
      "Stay",
      "Budget"
    ])
    expect(html).toMatch(
      /data-answer-first[^>]*>[\s\S]*?<\/p><aside aria-label="Affiliate disclosure"/
    )
    expect(html).toContain(`rel="${AFFILIATE_LINK_REL}"`)
    expect(html).not.toContain("noopener")
    expect(html).not.toContain(GA_VS_GRANDSTAND_SLUG)
    expect(html).toContain("Plan by fan type")
    expect(html).toContain("Abu Dhabi GP guide")
    expect(html).not.toContain(">Home<")
    const levels = headingLevels(html)
    expect(levels[0]).toBe(1)
    expect(levels.filter(level => level === 1)).toHaveLength(1)
    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index]).toBeLessThanOrEqual(levels[index - 1] + 1)
    }
    const types = jsonLdBlocks(html)
      .map(block => block["@type"])
      .sort()
    expect(types).toEqual(["Article", "BreadcrumbList", "FAQPage"])

    const withoutAffiliate = renderView(pageBySlug("with-kids"))
    expect(withoutAffiliate).not.toContain("Affiliate disclosure")
    expect(withoutAffiliate).not.toContain(AFFILIATE_LINK_REL)

    const withGa = renderView(page, {
      gaVsGrandstandHref: "/guides/which-race-first-2027"
    })
    expect(withGa.match(/General admission vs grandstand/g)).toHaveLength(1)
    expect(withGa).toContain('href="/guides/which-race-first-2027"')

    const withSibling = renderView(page, {
      siblings: [
        {
          href: "/guides/abu-dhabi-grand-prix-travel-guide/on-a-budget",
          label: "On a budget"
        }
      ]
    })
    expect(withSibling).toContain(
      'href="/guides/abu-dhabi-grand-prix-travel-guide/on-a-budget"'
    )
    expect(withSibling).not.toContain("fixture-not-a-page")

    const videoSource = readFileSync(
      path.join(process.cwd(), "components/guides/guide-video-slot.tsx"),
      "utf8"
    )
    expect(videoSource).not.toContain("<video")
    expect(videoSource).not.toContain("<iframe")
    expect(videoSource).not.toContain("VideoObject")
  })

  it("keeps the hub free of unpublished links and the production param list empty", async () => {
    const hubHtml = renderToStaticMarkup(
      await GuidePage({ params: Promise.resolve({ slug: HUB }) })
    )
    expect(hubHtml).not.toContain("Plan by fan type")
    for (const slug of SLUGS) {
      expect(hubHtml).not.toContain(slug)
    }
    expect(
      renderToStaticMarkup(createElement(PlanByFanTypeList, { links: [] }))
    ).toBe("")

    const previous = process.env.VERCEL_ENV
    try {
      delete process.env.VERCEL_ENV
      expect(generateStaticParams()).toEqual(
        SLUGS.map(subpage => ({ slug: HUB, subpage }))
      )
      process.env.VERCEL_ENV = "production"
      expect(generateStaticParams()).toEqual([])
      await expect(
        RaceHubSubpagePage({
          params: Promise.resolve({ slug: HUB, subpage: "first-timers" })
        })
      ).rejects.toThrow()
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
    expect(metadata.robots).toEqual({ index: false, follow: false })

    const sitemap = readFileSync(
      path.join(process.cwd(), "app/sitemap.ts"),
      "utf8"
    )
    expect(sitemap).toContain("publishedRaceHubSubpagePaths()")
    const route = readFileSync(
      path.join(
        process.cwd(),
        "app/(marketing)/guides/[slug]/[subpage]/page.tsx"
      ),
      "utf8"
    )
    expect(route).toContain("export const dynamicParams = false")
    expect(route).toContain("isSubpageVisible")
  })
})
