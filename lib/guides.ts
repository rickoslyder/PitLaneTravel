import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { format, parseISO } from "date-fns"
import { z } from "zod"
import { brand } from "@/config/brand"

export const SITE_ORIGIN = "https://www.pitlanetravel.com"
export const GUIDES_DIR = path.join(process.cwd(), "content", "guides")

const WORDS_PER_MINUTE = 220
const SMALL_WORDS = new Set(["of", "the", "and", "or", "a"])

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(isRealIsoDate, "must be a real YYYY-MM-DD date")

const frontmatterSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    publishedAt: isoDate,
    updatedAt: isoDate,
    author: z.string().min(1),
    heroImage: z.string().min(1).optional(),
    relatedRaces: z.array(z.string().min(1)).optional()
  })
  .strict()

export type GuideFrontmatter = z.infer<typeof frontmatterSchema>

export type Guide = GuideFrontmatter & {
  relatedRaces: string[]
  headline: string
  body: string
  readingMinutes: number
}

export type ArticleJsonLd = {
  "@context": "https://schema.org"
  "@type": "Article"
  headline: string
  description: string
  datePublished: string
  dateModified: string
  author: {
    "@type": "Organization"
    name: string
  }
  publisher: {
    "@type": "Organization"
    name: string
    url: string
    logo: {
      "@type": "ImageObject"
      url: string
    }
  }
  mainEntityOfPage: {
    "@type": "WebPage"
    "@id": string
  }
  image?: string
}

export type BreadcrumbListJsonLd = {
  "@context": "https://schema.org"
  "@type": "BreadcrumbList"
  itemListElement: Array<{
    "@type": "ListItem"
    position: number
    name: string
    item: string
  }>
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

function unquote(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
    (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
  ) {
    return value.slice(1, -1)
  }
  return value
}

function parseFrontmatterBlock(
  block: string,
  filename: string
): Record<string, string | string[]> {
  const data: Record<string, string | string[]> = {}
  const lines = block.split(/\r?\n/)
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim()) {
      index += 1
      continue
    }

    const match = /^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/.exec(line)
    if (!match) {
      throw new Error(`${filename} has an invalid frontmatter line`)
    }

    const key = match[1]
    const rawValue = match[2]
    if (rawValue === "") {
      const items: string[] = []
      let next = index + 1
      while (next < lines.length && /^  - /.test(lines[next])) {
        items.push(unquote(lines[next].slice(4).trim()))
        next += 1
      }
      if (items.length === 0) {
        throw new Error(`${filename} is missing a value for ${key}`)
      }
      data[key] = items
      index = next
      continue
    }

    data[key] = unquote(rawValue.trim())
    index += 1
  }

  return data
}

export function readingMinutesFromMarkdown(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
  const words = text.split(/\s+/).filter(word => /[A-Za-z0-9]/.test(word))
  return Math.max(1, Math.ceil(words.length / WORDS_PER_MINUTE))
}

export function parseGuideSource(source: string, filename: string): Guide {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(source)
  if (!match) {
    throw new Error(`${filename} is missing frontmatter`)
  }

  const parsed = frontmatterSchema.safeParse(
    parseFrontmatterBlock(match[1], filename)
  )
  if (!parsed.success) {
    throw new Error(`${filename} has invalid frontmatter`)
  }

  const expectedSlug = filename.replace(/\.mdx$/, "")
  if (parsed.data.slug !== expectedSlug) {
    throw new Error(`${filename} slug does not match its filename`)
  }

  const body = match[2].replace(/^\r?\n/, "")
  const heading = /^# (.+)$/m.exec(body)
  if (!heading) {
    throw new Error(`${filename} is missing an H1`)
  }

  return {
    ...parsed.data,
    relatedRaces: parsed.data.relatedRaces ?? [],
    headline: heading[1].trim(),
    body,
    readingMinutes: readingMinutesFromMarkdown(body)
  }
}

export function listGuides(): Guide[] {
  return readdirSync(GUIDES_DIR)
    .filter(filename => filename.endsWith(".mdx"))
    .sort()
    .map(filename =>
      parseGuideSource(
        readFileSync(path.join(GUIDES_DIR, filename), "utf8"),
        filename
      )
    )
    .sort((left, right) => {
      if (left.publishedAt === right.publishedAt) {
        return left.slug < right.slug ? -1 : left.slug > right.slug ? 1 : 0
      }
      return left.publishedAt < right.publishedAt ? 1 : -1
    })
}

export function getGuide(slug: string): Guide | null {
  return listGuides().find(guide => guide.slug === slug) ?? null
}

export function guidePath(slug: string): string {
  return `/guides/${slug}`
}

export function absoluteUrl(pathname: string): string {
  return `${SITE_ORIGIN}${pathname.startsWith("/") ? pathname : `/${pathname}`}`
}

export function formatGuideDate(isoDateValue: string): string {
  return format(parseISO(isoDateValue), "d MMM yyyy")
}

export function raceLinkLabel(slug: string): string {
  const trimmed = slug
    .replace(/-(?:f1|motogp|formula-e|indycar|wec)-\d{4}$/, "")
    .replace(/-race-\d+$/, "")
    .replace(/-\d{4}$/, "")

  const label = trimmed
    .split("-")
    .map((part, index) => {
      if (part === "e") return "E"
      if (part === "tt" || part === "gp") return part.toUpperCase()
      if (index > 0 && SMALL_WORDS.has(part)) return part
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(" ")

  return label.replace(/E Prix/g, "E-Prix")
}

function absoluteAsset(url: string): string {
  if (url.startsWith("https://") || url.startsWith("http://")) return url
  return absoluteUrl(url)
}

export function buildArticleJsonLd(guide: Guide): ArticleJsonLd {
  const jsonLd: ArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.headline,
    description: guide.description,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    author: {
      "@type": "Organization",
      name: guide.author
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
      "@id": absoluteUrl(guidePath(guide.slug))
    }
  }

  if (guide.heroImage) {
    jsonLd.image = absoluteAsset(guide.heroImage)
  }

  return jsonLd
}

export function buildGuideBreadcrumbJsonLd(guide: Guide): BreadcrumbListJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/")
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Guides",
        item: absoluteUrl("/guides")
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.title,
        item: absoluteUrl(guidePath(guide.slug))
      }
    ]
  }
}

export function buildGuidesIndexBreadcrumbJsonLd(): BreadcrumbListJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/")
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Guides",
        item: absoluteUrl("/guides")
      }
    ]
  }
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
