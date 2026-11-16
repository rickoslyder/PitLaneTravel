import { z } from "zod"
import { raceHubSubpages } from "@/content/race-hub-subpages"
import { brand } from "@/config/brand"
import {
  absoluteUrl,
  formatGuideDate,
  getGuide,
  guidePath,
  type ArticleJsonLd,
  type BreadcrumbListJsonLd
} from "@/lib/guides"
import { SITE_ORIGIN } from "@/lib/site-metadata"

/**
 * Year-free slugs. Families, budget, solo/groups, and premium use the
 * labels in the question map (with-kids, on-a-budget, solo-and-groups,
 * hospitality). getting-there and camping are the other need pages.
 */
export const RACE_HUB_SUBPAGE_SLUGS = [
  "first-timers",
  "with-kids",
  "on-a-budget",
  "accessibility",
  "solo-and-groups",
  "hospitality",
  "what-to-bring",
  "getting-there",
  "camping"
] as const

export type RaceHubSubpageSlug = (typeof RACE_HUB_SUBPAGE_SLUGS)[number]

const AT_A_GLANCE_FIELDS = [
  "ticket",
  "stand",
  "transport",
  "stay",
  "budget"
] as const

export const AT_A_GLANCE_TOPICS: ReadonlyArray<{
  key: (typeof AT_A_GLANCE_FIELDS)[number]
  topic: string
}> = [
  { key: "ticket", topic: "Ticket" },
  { key: "stand", topic: "Stand" },
  { key: "transport", topic: "Transport" },
  { key: "stay", topic: "Stay" },
  { key: "budget", topic: "Budget" }
]

const YEAR_IN_SLUG = /(?:^|-)(?:19|20)\d{2}(?:-|$)/
const FIXTURE_SLUG = /^fixture(?:-[a-z0-9]+)+$/
const REDIRECT_PATH = /\/go\/|\/api\/redirect\//

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(isRealIsoDate, "must be a real YYYY-MM-DD date")

const subpageSchema = z
  .object({
    hubSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    published: z.boolean(),
    title: z.string().min(1),
    breadcrumbLabel: z.string().min(1),
    description: z.string().min(1),
    headline: z.string().min(1),
    hubLinkLabel: z.string().min(1),
    hubBreadcrumbLabel: z.string().min(1),
    publishedAt: isoDate,
    updatedAt: isoDate,
    checkedOn: isoDate,
    overview: z.string().min(1),
    atAGlance: z
      .object({
        ticket: z.string().min(1),
        stand: z.string().min(1),
        transport: z.string().min(1),
        stay: z.string().min(1),
        budget: z.string().min(1)
      })
      .strict(),
    questions: z
      .array(
        z
          .object({
            question: z.string().min(1),
            answer: z.string().min(1),
            includeInFaqPage: z.boolean()
          })
          .strict()
      )
      .min(6)
      .max(10),
    fanTips: z.array(z.string().min(1)).max(6).optional(),
    affiliateLinks: z
      .array(
        z
          .object({
            partner: z.string().min(1),
            href: z.string().url(),
            label: z.string().min(1)
          })
          .strict()
      )
      .optional()
  })
  .strict()

export type RaceHubSubpage = z.infer<typeof subpageSchema>

export type FaqPageJsonLd = {
  "@context": "https://schema.org"
  "@type": "FAQPage"
  mainEntity: Array<{
    "@type": "Question"
    name: string
    acceptedAnswer: {
      "@type": "Answer"
      text: string
    }
  }>
}

export type FaqSchemaBlock = {
  source: string
  names: readonly string[]
}

export type AtAGlanceRowModel = {
  topic: string
  verdict: string
}

function isRealIsoDate(value: string): boolean {
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(word => /[A-Za-z0-9]/.test(word)).length
}

export function checkedStamp(checkedOn: string): string {
  return `checked ${formatGuideDate(checkedOn)}`
}

export function raceHubSubpagePath(hubSlug: string, slug: string): string {
  return `/guides/${hubSlug}/${slug}`
}

function fail(slug: string, message: string): never {
  throw new Error(`${slug}: ${message}`)
}

function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === "string") {
    out.push(value)
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out)
    return
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStrings(item, out)
  }
}

function assertSingleLine(slug: string, label: string, value: string) {
  if (value.includes("\n") || value.includes("\r")) {
    fail(slug, `${label} must be a single line so it matches its schema text`)
  }
}

export function parseRaceHubSubpage(input: unknown): RaceHubSubpage {
  const parsed = subpageSchema.safeParse(input)
  const slug =
    input && typeof input === "object" && "slug" in input
      ? String(input.slug)
      : "sub-page"
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map(issue => `${issue.path.join(".") || "page"}: ${issue.message}`)
      .join("; ")
    fail(slug, detail)
  }

  const page = parsed.data
  if (YEAR_IN_SLUG.test(page.slug) || YEAR_IN_SLUG.test(page.hubSlug)) {
    fail(page.slug, "slugs must not include a year")
  }

  const fixture = FIXTURE_SLUG.test(page.slug)
  if (fixture && page.published) {
    fail(page.slug, "fixture sub-pages cannot be published")
  }
  if (
    !fixture &&
    !RACE_HUB_SUBPAGE_SLUGS.includes(page.slug as RaceHubSubpageSlug)
  ) {
    fail(
      page.slug,
      `slug must be one of ${RACE_HUB_SUBPAGE_SLUGS.join(", ")} (or a fixture- slug)`
    )
  }

  if (!getGuide(page.hubSlug)) {
    fail(page.slug, `hub "${page.hubSlug}" is not a guide in content/guides`)
  }

  const stamp = checkedStamp(page.checkedOn)
  if (!page.overview.includes(stamp)) {
    fail(page.slug, `overview must include the stamp "${stamp}"`)
  }
  const words = countWords(page.overview)
  if (words < 60 || words > 90) {
    fail(page.slug, `overview must be 60–90 words (got ${words})`)
  }

  const faqCount = page.questions.filter(
    question => question.includeInFaqPage
  ).length
  if (faqCount < 4 || faqCount > 6) {
    fail(page.slug, `FAQPage must include 4–6 questions (got ${faqCount})`)
  }

  const seen = new Set<string>()
  for (const question of page.questions) {
    if (seen.has(question.question)) {
      fail(page.slug, `duplicate question "${question.question}"`)
    }
    seen.add(question.question)
    assertSingleLine(page.slug, "question", question.question)
    assertSingleLine(page.slug, "answer", question.answer)
  }

  assertSingleLine(page.slug, "overview", page.overview)
  for (const field of AT_A_GLANCE_FIELDS) {
    assertSingleLine(page.slug, field, page.atAGlance[field])
  }
  for (const tip of page.fanTips ?? []) {
    assertSingleLine(page.slug, "fan tip", tip)
    const tipWords = countWords(tip)
    if (tipWords > 25) {
      fail(page.slug, `fan tip must be 25 words or fewer (got ${tipWords})`)
    }
  }

  for (const link of page.affiliateLinks ?? []) {
    let url: URL
    try {
      url = new URL(link.href)
    } catch {
      fail(page.slug, "affiliate href must be an absolute URL")
    }
    if (url.protocol !== "https:") {
      fail(page.slug, "affiliate href must use https")
    }
    if (REDIRECT_PATH.test(url.pathname)) {
      fail(page.slug, "affiliate href must not use /go/ or /api/redirect/")
    }
  }

  const strings: string[] = []
  collectStrings(page, strings)
  for (const value of strings) {
    if (value.includes("VideoObject") || value.includes("SportsEvent")) {
      fail(page.slug, "pages must not mention VideoObject or SportsEvent")
    }
    if (REDIRECT_PATH.test(value)) {
      fail(page.slug, "pages must not link through /go/ or /api/redirect/")
    }
  }

  return page
}

/**
 * Questions in the hub guide's FAQ section. Abu Dhabi's hub has no FAQPage
 * JSON-LD yet; section 6 says that block must match these visible questions
 * character for character, so they are the hub schema set the duplicate
 * rule includes.
 */
export function visibleGuideFaqQuestions(body: string): string[] {
  const match = /(?:^|\n)## FAQs?\n([\s\S]*?)(?=\n## |$)/.exec(body)
  if (!match) return []
  const names: string[] = []
  for (const line of match[1].split(/\r?\n/)) {
    const question = /^\*\*(.+)\*\*$/.exec(line.trim())
    if (question) names.push(question[1])
  }
  return names
}

export function hubFaqSchemaQuestions(hubSlug: string): string[] {
  const guide = getGuide(hubSlug)
  if (!guide) return []
  return visibleGuideFaqQuestions(guide.body)
}

export function faqQuestionsForSchema(page: RaceHubSubpage): Array<{
  name: string
  text: string
}> {
  return page.questions
    .filter(question => question.includeInFaqPage)
    .map(question => ({
      name: question.question,
      text: question.answer
    }))
}

/** name and text are the content strings, copied with no rewrite. */
export function buildSubpageFaqJsonLd(page: RaceHubSubpage): FaqPageJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqQuestionsForSchema(page).map(question => ({
      "@type": "Question",
      name: question.name,
      acceptedAnswer: {
        "@type": "Answer",
        text: question.text
      }
    }))
  }
}

export function buildSubpageArticleJsonLd(page: RaceHubSubpage): ArticleJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.headline,
    description: page.description,
    datePublished: page.publishedAt,
    dateModified: page.updatedAt,
    author: {
      "@type": "Organization",
      name: brand.name
    },
    publisher: {
      "@type": "Organization",
      name: brand.name,
      url: SITE_ORIGIN,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/android-chrome-192x192.png")
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(raceHubSubpagePath(page.hubSlug, page.slug))
    }
  }
}

export const AFFILIATE_LINK_REL = "sponsored nofollow"

/** Missing until that guide is added. Do not link a 404. */
export const GA_VS_GRANDSTAND_SLUG = "f1-2027-general-admission-vs-grandstand"

export function publishedGuideHref(slug: string): string | null {
  if (!getGuide(slug)) return null
  return guidePath(slug)
}

export function buildSubpageBreadcrumbJsonLd(
  page: RaceHubSubpage
): BreadcrumbListJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Guides",
        item: absoluteUrl("/guides")
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.hubBreadcrumbLabel,
        item: absoluteUrl(guidePath(page.hubSlug))
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.breadcrumbLabel,
        item: absoluteUrl(raceHubSubpagePath(page.hubSlug, page.slug))
      }
    ]
  }
}

export function atAGlanceRows(page: RaceHubSubpage): AtAGlanceRowModel[] {
  return AT_A_GLANCE_TOPICS.map(topic => ({
    topic: topic.topic,
    verdict: page.atAGlance[topic.key]
  }))
}

export function faqSchemaBlocksForPages(
  pages: readonly RaceHubSubpage[],
  hubQuestions: (hubSlug: string) => readonly string[] = hubFaqSchemaQuestions
): FaqSchemaBlock[] {
  const hubSlugs = [...new Set(pages.map(page => page.hubSlug))]
  const blocks: FaqSchemaBlock[] = []
  for (const hubSlug of hubSlugs) {
    blocks.push({
      source: `hub:${hubSlug}`,
      names: [...hubQuestions(hubSlug)]
    })
    for (const page of pages) {
      if (page.hubSlug !== hubSlug) continue
      blocks.push({
        source: `subpage:${page.hubSlug}/${page.slug}`,
        names: faqQuestionsForSchema(page).map(question => question.name)
      })
    }
  }
  return blocks
}

export function duplicateFaqQuestionNames(
  blocks: readonly FaqSchemaBlock[]
): string[] {
  const owner = new Map<string, string>()
  const duplicates = new Set<string>()
  for (const block of blocks) {
    const seenInBlock = new Set<string>()
    for (const name of block.names) {
      if (seenInBlock.has(name)) duplicates.add(name)
      seenInBlock.add(name)
      const previous = owner.get(name)
      if (previous !== undefined && previous !== block.source) {
        duplicates.add(name)
      }
      if (previous === undefined) owner.set(name, block.source)
    }
  }
  return [...duplicates].sort()
}

export function assertNoDuplicateFaqQuestions(
  blocks: readonly FaqSchemaBlock[]
): void {
  const duplicates = duplicateFaqQuestionNames(blocks)
  if (duplicates.length === 0) return
  const detail = duplicates
    .map(name => {
      const sources = blocks
        .filter(block => block.names.includes(name))
        .map(block => block.source)
      return `"${name}" (${sources.join(", ")})`
    })
    .join("; ")
  throw new Error(
    `FAQPage question appears in more than one schema block: ${detail}`
  )
}

/**
 * Unpublished pages render on preview and local builds. Vercel sets
 * VERCEL_ENV to "production" for the live site and "preview" for preview
 * deployments. Local builds leave it unset.
 */
export function isSubpageVisible(
  page: { published: boolean },
  env: string | undefined = process.env.VERCEL_ENV
): boolean {
  if (page.published) return true
  return env !== "production"
}

export function subpagesForBuild<T extends { published: boolean }>(
  pages: readonly T[],
  env: string | undefined = process.env.VERCEL_ENV
): T[] {
  return pages.filter(page => isSubpageVisible(page, env))
}

export function publishedSubpages<T extends { published: boolean }>(
  pages: readonly T[]
): T[] {
  return pages.filter(page => page.published)
}

function loadRegistry(inputs: readonly unknown[]): RaceHubSubpage[] {
  const pages = inputs.map(input => parseRaceHubSubpage(input))
  assertNoDuplicateFaqQuestions(faqSchemaBlocksForPages(pages))
  return pages
}

export const raceHubSubpageRegistry = loadRegistry(raceHubSubpages)

export function getRaceHubSubpage(
  hubSlug: string,
  slug: string,
  pages: readonly RaceHubSubpage[] = raceHubSubpageRegistry
): RaceHubSubpage | null {
  return (
    pages.find(page => page.hubSlug === hubSlug && page.slug === slug) ?? null
  )
}

export function publishedRaceHubSubpagePaths(
  pages: readonly RaceHubSubpage[] = raceHubSubpageRegistry
): string[] {
  return publishedSubpages(pages).map(page =>
    raceHubSubpagePath(page.hubSlug, page.slug)
  )
}

export function publishedSubpagesForHub(
  hubSlug: string,
  pages: readonly RaceHubSubpage[] = raceHubSubpageRegistry
): RaceHubSubpage[] {
  return publishedSubpages(pages).filter(page => page.hubSlug === hubSlug)
}

export function publishedSiblingSubpages(
  page: Pick<RaceHubSubpage, "hubSlug" | "slug">,
  pages: readonly RaceHubSubpage[] = raceHubSubpageRegistry
): RaceHubSubpage[] {
  return publishedSubpagesForHub(page.hubSlug, pages).filter(
    other => other.slug !== page.slug
  )
}
