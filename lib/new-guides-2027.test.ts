import { readFileSync } from "node:fs"
import path from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import GuidePage, {
  generateMetadata,
  generateStaticParams
} from "@/app/(marketing)/guides/[slug]/page"
import GuidesIndexPage from "@/app/(marketing)/guides/page"
import { azerbaijanGp2027Faq } from "@/data/guides/azerbaijan-grand-prix-2027-faq"
import { f1TicketSaleFaq } from "@/data/guides/f1-2027-ticket-on-sale-faq"
import { wecLaunchWeekFaq } from "@/data/guides/wec-2027-launch-week-faq"
import {
  buildArticleJsonLd,
  buildGuideBreadcrumbJsonLd,
  getGuide,
  listGuides
} from "./guides"

const WEC_SLUG = "wec-2027-launch-week"
const BAKU_SLUG = "azerbaijan-grand-prix-2027-tickets-travel"
const NEW_SLUGS = [WEC_SLUG, BAKU_SLUG] as const

const PRIVATE_MARKERS = [
  "<!--",
  "/workspace/",
  "SEO desk",
  "Engineering Lead",
  "VIDEO SLOT",
  "VideoObject",
  "DRAFT",
  "first draft",
  "up to 50",
  "50%"
]

const WEC_INTERNAL = [
  "/circuits/silverstone-circuit/grandstands",
  "/guides/f1-2027-ticket-on-sale-dates",
  "/guides/two-races-one-trip-2027",
  "/guides/which-race-first-2027",
  "/races/24-hours-of-le-mans-2026-wec-2026",
  "/races/6-hours-of-fuji-2026-wec-2026",
  "/races/6-hours-of-imola-2026-wec-2026",
  "/races/lone-star-le-mans-2026-wec-2026",
  "/races/totalenergies-6-hours-of-spa-francorchamps-2026-wec-2026",
  "/series/wec"
]

const BAKU_INTERNAL = [
  "/circuits/baku-city-circuit/grandstands",
  "/guides/f1-2027-ticket-on-sale-dates",
  "/guides/which-race-first-2027",
  "/races/azerbaijan-grand-prix-2026-f1-2026",
  "/series/f1"
]

function visibleFaq(body: string): Array<{ name: string; text: string }> {
  const marker = "\n## FAQs\n"
  const start = body.indexOf(marker)
  const end = body.indexOf("\n## Change log\n", start)
  const faq = start >= 0 ? body.slice(start + marker.length, end) : ""
  return faq
    .split(/\n\*\*/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => {
      const [nameLine, ...rest] = block.split("\n")
      return {
        name: nameLine.replace(/\*\*$/, "").trim(),
        text: rest.join("\n").trim()
      }
    })
}

function internalPaths(body: string): string[] {
  return [...body.matchAll(/\]\((\/[^)\s]+)\)/g)].map(match => match[1]).sort()
}

function jsonLdBlocks(html: string): Array<Record<string, unknown>> {
  return [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
    )
  ].map(match => JSON.parse(match[1]) as Record<string, unknown>)
}

async function renderGuide(slug: string): Promise<string> {
  const element = await GuidePage({
    params: Promise.resolve({ slug })
  })
  return renderToStaticMarkup(element)
}

describe("WEC Launch Week and Baku 2027 guides", () => {
  it("registers both guides for the index and sitemap without changing other FAQ schema", () => {
    const slugs = listGuides().map(guide => guide.slug)
    expect(slugs).toEqual(expect.arrayContaining([...NEW_SLUGS]))
    expect(generateStaticParams().map(item => item.slug)).toEqual(
      expect.arrayContaining([...NEW_SLUGS])
    )

    const sitemap = readFileSync(
      path.join(process.cwd(), "app/sitemap.ts"),
      "utf8"
    )
    expect(sitemap).toContain("listGuides()")
    expect(sitemap).toContain("`${BASE_URL}/guides/${guide.slug}`")

    expect(f1TicketSaleFaq.mainEntity).toHaveLength(6)
    expect(f1TicketSaleFaq.mainEntity[0].name).toBe(
      "When do 2027 F1 tickets go on sale?"
    )
  })

  it("publishes the approved titles, dates, and checked prices", () => {
    const wec = getGuide(WEC_SLUG)
    const baku = getGuide(BAKU_SLUG)
    expect(wec).not.toBeNull()
    expect(baku).not.toBeNull()

    expect(wec!.title).toBe(
      "WEC 2027 Launch Week (10–16 Nov): Which Round to Book"
    )
    expect(wec!.description).toBe(
      "All nine 2027 WEC rounds compared: dates, cheapest official tickets, Launch Week offers and which race suits you, from Silverstone's return to Le Mans."
    )
    expect(baku!.title).toBe(
      "Azerbaijan Grand Prix 2027 Tickets: 20% Early Bird, Best Grandstands"
    )
    expect(baku!.description).toBe(
      "Baku's early-bird 20% ends 16 November 2026. Compare every grandstand's price and view, and plan your trip to the 24–26 September race."
    )

    for (const guide of [wec!, baku!]) {
      expect(guide.publishedAt).toBe("2026-11-08")
      expect(guide.updatedAt).toBe("2026-11-08")
      expect(guide.author).toBe("PitLane Travel")
      expect(guide.body).toContain("**Last checked: Sunday 8 November 2026.**")
      for (const marker of PRIVATE_MARKERS) {
        expect(guide.body).not.toContain(marker)
      }
      expect(guide.body).not.toContain("```")
    }

    expect(wec!.body.match(/Not shown \(8 Nov\)/g)).toHaveLength(11)
    expect(wec!.body).toContain("**¥9,000 (25% off), 10–16 Nov**")
    expect(wec!.body).toContain("June early-bird from-price")
    expect(baku!.body).toContain("**−20%**")
    expect(baku!.body).toContain("VALID UNTIL 16.11.2026")
    expect(baku!.body).not.toContain("sjv.io")
    expect(baku!.body).not.toContain("Omio")
  })

  it("matches each visible FAQ to FAQPage JSON-LD and emits Article plus BreadcrumbList", () => {
    const cases = [
      { slug: WEC_SLUG, faq: wecLaunchWeekFaq },
      { slug: BAKU_SLUG, faq: azerbaijanGp2027Faq }
    ] as const

    for (const { slug, faq } of cases) {
      const guide = getGuide(slug)
      expect(guide).not.toBeNull()
      const visible = visibleFaq(guide!.body)
      expect(faq["@type"]).toBe("FAQPage")
      expect(faq.mainEntity).toHaveLength(5)
      expect(visible).toHaveLength(5)
      faq.mainEntity.forEach((entity, index) => {
        expect(entity.name).toBe(visible[index].name)
        expect(entity.acceptedAnswer.text).toBe(visible[index].text)
      })

      const article = buildArticleJsonLd(guide!)
      const breadcrumb = buildGuideBreadcrumbJsonLd(guide!)
      expect(article.datePublished).toBe("2026-11-08")
      expect(article.dateModified).toBe("2026-11-08")
      expect(article.headline).toBe(guide!.headline)
      expect(article.mainEntityOfPage["@id"]).toBe(
        `https://www.pitlanetravel.com/guides/${slug}`
      )
      expect(article).not.toHaveProperty("image")
      expect(JSON.stringify(article)).not.toContain("VideoObject")
      expect(JSON.stringify(faq)).not.toContain("VideoObject")
      expect(breadcrumb.itemListElement[2]).toMatchObject({
        position: 3,
        name: guide!.title,
        item: `https://www.pitlanetravel.com/guides/${slug}`
      })
    }
  })

  it("keeps approved internal paths and the two known affiliate URLs", () => {
    const wec = getGuide(WEC_SLUG)!
    const baku = getGuide(BAKU_SLUG)!
    expect(internalPaths(wec.body)).toEqual(WEC_INTERNAL)
    expect(internalPaths(baku.body)).toEqual(BAKU_INTERNAL)
    expect(wec.body.match(/omio\.sjv\.io\/jR09OP/g)).toHaveLength(1)
    expect(wec.body.match(/airalo\.pxf\.io\/PzEM6e/g)).toHaveLength(1)
    expect(baku.body.match(/airalo\.pxf\.io\/PzEM6e/g)).toHaveLength(1)
    expect(wec.body).not.toContain("f1.pxf.io")
    expect(baku.body).not.toContain("f1.pxf.io")
    expect(wec.body.indexOf("two affiliate links")).toBeLessThan(
      wec.body.indexOf("## WEC Launch Week 2027 at a glance")
    )
    expect(
      baku.body.indexOf("Our only affiliate link here is to Airalo")
    ).toBeLessThan(baku.body.indexOf("## Baku 2027 at a glance"))
  })

  it("renders one main, indexable metadata, and affiliate rels without touching other guides", async () => {
    const indexHtml = renderToStaticMarkup(await GuidesIndexPage())
    expect(indexHtml).toContain('href="/guides/wec-2027-launch-week"')
    expect(indexHtml).toContain(
      "WEC 2027 Launch Week (10–16 Nov): Which Round to Book"
    )
    expect(indexHtml).toContain(
      'href="/guides/azerbaijan-grand-prix-2027-tickets-travel"'
    )
    expect(indexHtml).toContain(
      "Azerbaijan Grand Prix 2027 Tickets: 20% Early Bird, Best Grandstands"
    )

    for (const slug of NEW_SLUGS) {
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug })
      })
      const canonical = `https://www.pitlanetravel.com/guides/${slug}`
      expect(metadata.alternates).toEqual({ canonical })
      expect(metadata.robots).toEqual({ index: true, follow: true })
      expect(metadata.openGraph).toMatchObject({
        url: canonical,
        type: "article",
        locale: "en_GB",
        siteName: "PitLane Travel"
      })
      expect(metadata.description?.length).toBeGreaterThan(0)

      const html = await renderGuide(slug)
      expect(html.match(/<main[\s>]/g)).toHaveLength(1)
      expect(html.match(/<article[\s>]/g)).toHaveLength(1)
      expect(html).toContain("<main><article")
      const blocks = jsonLdBlocks(html)
      expect(blocks.map(block => block["@type"]).sort()).toEqual([
        "Article",
        "BreadcrumbList",
        "FAQPage"
      ])
      const faq = blocks.find(block => block["@type"] === "FAQPage")
      expect(faq?.mainEntity).toHaveLength(5)
      expect(html).not.toContain("VideoObject")
      expect(html).toContain('rel="sponsored nofollow noopener noreferrer"')
      expect(html).toContain('href="https://airalo.pxf.io/PzEM6e"')
    }

    const wecHtml = await renderGuide(WEC_SLUG)
    expect(wecHtml.match(/omio\.sjv\.io\/jR09OP/g)).toHaveLength(1)
    expect(wecHtml).toContain(
      'href="https://omio.sjv.io/jR09OP" target="_blank" rel="sponsored nofollow noopener noreferrer"'
    )
    const bakuHtml = await renderGuide(BAKU_SLUG)
    expect(bakuHtml).not.toContain("omio")
    expect(bakuHtml).not.toContain("sjv.io")

    const which = await renderGuide("which-race-first-2027")
    expect(which).not.toContain("<main")
    expect(jsonLdBlocks(which).map(block => block["@type"])).toEqual([
      "Article",
      "BreadcrumbList"
    ])

    const ticket = await renderGuide("f1-2027-ticket-on-sale-dates")
    expect(ticket).not.toContain("<main")
    expect(ticket).toContain("When do 2027 F1 tickets go on sale?")
    expect(ticket).not.toContain("When is WEC Launch Week 2026?")
    expect(ticket).not.toContain("When does the Baku F1 early bird end?")
    const ticketMeta = await generateMetadata({
      params: Promise.resolve({ slug: "f1-2027-ticket-on-sale-dates" })
    })
    expect(ticketMeta.robots).toBeUndefined()
  })
})
