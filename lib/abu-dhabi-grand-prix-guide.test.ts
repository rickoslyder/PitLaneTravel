import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import GuidePage from "@/app/(marketing)/guides/[slug]/page"
import {
  abuDhabiGrandPrixTravelGuideFaq,
  type AbuDhabiGuideFaqPage
} from "@/data/guides/abu-dhabi-grand-prix-travel-guide-faq"
import {
  buildArticleJsonLd,
  buildGuideBreadcrumbJsonLd,
  getGuide
} from "./guides"

const SLUG = "abu-dhabi-grand-prix-travel-guide"

type JsonLdBlock = {
  "@context"?: string
  "@type"?: string
  mainEntity?: Array<{
    "@type"?: string
    name?: string
    acceptedAnswer?: { "@type"?: string; text?: string }
  }>
  dateModified?: string
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
}

function visibleFaqFromBody(
  body: string
): Array<{ name: string; text: string }> {
  const start = body.indexOf("\n## FAQ\n")
  const end = body.indexOf("\n## Sources\n", start)
  const faq = body.slice(start + "\n## FAQ\n".length, end).trim()
  return faq
    .split(/\n\*\*/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => {
      const [nameLine, ...rest] = block.replace(/^\*\*/, "").split("\n")
      const text = rest
        .join("\n")
        .split(/\n\*(?!\*)/)[0]
        .trim()
      return {
        name: nameLine.replace(/\*\*$/, "").trim(),
        text
      }
    })
}

function visibleFaqFromHtml(
  html: string
): Array<{ name: string; text: string }> {
  const start = html.indexOf('<h2 id="faq">')
  const end = html.indexOf('<h2 id="sources">', start)
  const section = html.slice(start, end)
  return [...section.matchAll(/<p>([\s\S]*?)<\/p>/g)]
    .map(match => match[1])
    .filter(paragraph => paragraph.includes("<strong>"))
    .map(paragraph => {
      const name = decodeHtml(
        paragraph.match(/<strong>([\s\S]*?)<\/strong>/)?.[1] ?? ""
      ).trim()
      const text = decodeHtml(
        paragraph
          .replace(/<strong>[\s\S]*?<\/strong>/, "")
          .replace(/<br\s*\/?>/g, " ")
          .replace(/<[^>]+>/g, "")
      )
        .replace(/\s+/g, " ")
        .trim()
      return { name, text }
    })
}

function jsonLdBlocks(html: string): JsonLdBlock[] {
  return [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
    )
  ].map(match => JSON.parse(match[1]) as JsonLdBlock)
}

function assertFaqPageStructuredData(faq: AbuDhabiGuideFaqPage) {
  expect(faq["@context"]).toBe("https://schema.org")
  expect(faq["@type"]).toBe("FAQPage")
  expect(faq.mainEntity).toHaveLength(9)
  const names = new Set<string>()
  for (const question of faq.mainEntity) {
    expect(question["@type"]).toBe("Question")
    expect(question.name.endsWith("?")).toBe(true)
    expect(question.acceptedAnswer["@type"]).toBe("Answer")
    expect(question.acceptedAnswer.text.length).toBeGreaterThan(40)
    expect(question.acceptedAnswer.text).not.toContain("<")
    expect(question.acceptedAnswer.text).not.toContain("**")
    expect(names.has(question.name)).toBe(false)
    names.add(question.name)
  }
}

describe("Abu Dhabi Grand Prix travel guide", () => {
  it("restamps the 16 Nov 2026 ticket check without the retired prices", () => {
    const guide = getGuide(SLUG)
    expect(guide).not.toBeNull()
    expect(guide!.publishedAt).toBe("2026-10-31")
    expect(guide!.updatedAt).toBe("2026-11-16")
    expect(guide!.body).toContain(
      '**Official "from" prices, checked 16 Nov 2026:**'
    )
    expect(guide!.body).toContain(
      "| Promoter (abudhabigp.com) [5] | General admission | AED 745 | On sale |"
    )
    expect(guide!.body).toContain(
      "| Promoter [5] | Premium hospitality | AED 9,795 | On sale |"
    )
    expect(guide!.body).toContain(
      "| F1 Tickets [8] | West Grandstand | €1,333.18 | On sale |"
    )
    expect(guide!.body).toContain(
      "| F1 Tickets [8] | Abu Dhabi Hill | — | Sold out |"
    )
    expect(guide!.body).toContain(
      "| F1 Tickets [8] | North Straight Grandstand | — | Sold out |"
    )
    expect(guide!.body).toContain(
      "| F1 Tickets [8] | South Grandstand | — | Sold out |"
    )
    expect(guide!.body).toContain(
      "| F1 Tickets [8] | West Straight Grandstand | — | Sold out |"
    )
    expect(guide!.body).toContain(
      "For seats sold out on F1 Tickets, check the promoter: general admission is listed from AED 745."
    )
    expect(guide!.body).not.toContain("AED 7,995")
    expect(guide!.body).not.toContain("€379.28")
    expect(guide!.body).not.toContain("€736.24")
    expect(guide!.body).not.toContain("€1,311.84")
    expect(guide!.body).not.toContain("31 Oct 2026:**")
    expect(guide!.body).toContain("https://airalo.pxf.io/PzEM6e")
    expect(guide!.body).toContain("https://f1.pxf.io/5kEv72")
    expect(guide!.body).not.toContain("](/go/")
    expect(guide!.body).not.toContain("/api/redirect/")
  })

  it("publishes one FAQPage with the nine visible questions", async () => {
    const guide = getGuide(SLUG)
    expect(guide).not.toBeNull()
    const fromBody = visibleFaqFromBody(guide!.body)
    assertFaqPageStructuredData(abuDhabiGrandPrixTravelGuideFaq)
    expect(fromBody).toHaveLength(9)
    abuDhabiGrandPrixTravelGuideFaq.mainEntity.forEach((entity, index) => {
      expect(entity.name).toBe(fromBody[index].name)
      expect(entity.acceptedAnswer.text).toBe(fromBody[index].text)
    })

    const element = await GuidePage({
      params: Promise.resolve({ slug: SLUG })
    })
    const html = renderToStaticMarkup(element)
    const fromHtml = visibleFaqFromHtml(html)
    expect(fromHtml).toEqual(fromBody)

    const blocks = jsonLdBlocks(html)
    expect(blocks.map(block => block["@type"]).sort()).toEqual([
      "Article",
      "BreadcrumbList",
      "FAQPage"
    ])
    const faqBlocks = blocks.filter(block => block["@type"] === "FAQPage")
    expect(faqBlocks).toHaveLength(1)
    expect(faqBlocks[0]).toEqual(abuDhabiGrandPrixTravelGuideFaq)
    expect(faqBlocks[0]?.mainEntity).toHaveLength(9)

    const article = buildArticleJsonLd(guide!)
    const breadcrumb = buildGuideBreadcrumbJsonLd(guide!)
    expect(blocks.find(block => block["@type"] === "Article")).toEqual(article)
    expect(blocks.find(block => block["@type"] === "BreadcrumbList")).toEqual(
      breadcrumb
    )
    expect(article.datePublished).toBe("2026-10-31")
    expect(article.dateModified).toBe("2026-11-16")
    expect(article["@type"]).toBe("Article")
    expect(breadcrumb["@type"]).toBe("BreadcrumbList")

    const other = renderToStaticMarkup(
      await GuidePage({
        params: Promise.resolve({ slug: "which-race-first-2027" })
      })
    )
    expect(
      jsonLdBlocks(other).filter(block => block["@type"] === "FAQPage")
    ).toHaveLength(0)
  })
})
