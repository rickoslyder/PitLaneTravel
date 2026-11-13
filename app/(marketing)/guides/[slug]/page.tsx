import { F1TicketSaleTable } from "@/components/guides/f1-ticket-sale-table"
import { GuideMarkdown } from "@/components/guides/guide-markdown"
import { azerbaijanGp2027Faq } from "@/data/guides/azerbaijan-grand-prix-2027-faq"
import { f1TicketSaleFaq } from "@/data/guides/f1-2027-ticket-on-sale-faq"
import { f1TicketSales2027 } from "@/data/guides/f1-2027-ticket-sales"
import { wecLaunchWeekFaq } from "@/data/guides/wec-2027-launch-week-faq"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { brand } from "@/config/brand"
import {
  absoluteUrl,
  buildArticleJsonLd,
  buildGuideBreadcrumbJsonLd,
  formatGuideDate,
  getGuide,
  guidePath,
  listGuides,
  raceLinkLabel,
  serializeJsonLd
} from "@/lib/guides"
import { DEFAULT_OG_IMAGE_URL, pageSeo } from "@/lib/site-metadata"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

interface GuidePageProps {
  params: Promise<{ slug: string }>
}

const TICKET_SALE_TABLE = "{{f1-2027-ticket-sales}}"

const NEW_GUIDE_SLUGS = new Set([
  "wec-2027-launch-week",
  "azerbaijan-grand-prix-2027-tickets-travel"
])

function faqJsonLdForNewGuide(slug: string) {
  if (slug === "wec-2027-launch-week") return wecLaunchWeekFaq
  if (slug === "azerbaijan-grand-prix-2027-tickets-travel") {
    return azerbaijanGp2027Faq
  }
  return null
}

function bodyWithoutHeadline(body: string, headline: string): string {
  const prefix = `# ${headline}`
  if (!body.startsWith(prefix)) return body
  return body.slice(prefix.length).replace(/^\n+/, "")
}

function GuideBody({
  body,
  headline,
  slug
}: {
  body: string
  headline: string
  slug: string
}) {
  const source = bodyWithoutHeadline(body, headline)
  if (
    slug !== "f1-2027-ticket-on-sale-dates" ||
    !source.includes(TICKET_SALE_TABLE)
  ) {
    return <GuideMarkdown source={source} />
  }
  const [before, after] = source.split(TICKET_SALE_TABLE)
  return (
    <>
      <GuideMarkdown source={before} />
      <F1TicketSaleTable rows={f1TicketSales2027} />
      <GuideMarkdown source={after ?? ""} />
    </>
  )
}

export const dynamicParams = false

export function generateStaticParams() {
  return listGuides().map(guide => ({ slug: guide.slug }))
}

export async function generateMetadata({
  params
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) {
    return { title: `Guide | ${brand.name}` }
  }

  const seo = pageSeo(guidePath(guide.slug))
  const canonical = absoluteUrl(guidePath(guide.slug))
  const documentTitle = `${guide.title} | ${brand.name}`
  const image = guide.heroImage
    ? guide.heroImage.startsWith("http")
      ? guide.heroImage
      : absoluteUrl(guide.heroImage)
    : DEFAULT_OG_IMAGE_URL

  return {
    title: documentTitle,
    description: guide.description,
    alternates: seo.alternates,
    ...(NEW_GUIDE_SLUGS.has(guide.slug)
      ? { robots: { index: true, follow: true } }
      : {}),
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: "article",
      url: canonical,
      locale: "en_GB",
      siteName: brand.name,
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
      authors: [guide.author],
      images: [{ url: image, alt: guide.title }]
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
      images: [image]
    }
  }
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) notFound()

  const faqJsonLd = faqJsonLdForNewGuide(guide.slug)
  const article = (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildArticleJsonLd(guide))
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildGuideBreadcrumbJsonLd(guide))
        }}
      />
      {guide.slug === "f1-2027-ticket-on-sale-dates" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(f1TicketSaleFaq)
          }}
        />
      )}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(faqJsonLd)
          }}
        />
      )}

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/guides">Guides</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{guide.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
        {guide.headline}
      </h1>
      <p className="text-muted-foreground mt-3 text-sm">
        <time dateTime={guide.publishedAt}>
          {formatGuideDate(guide.publishedAt)}
        </time>
        {guide.updatedAt !== guide.publishedAt && (
          <>
            <span aria-hidden="true"> · </span>
            <span>
              Updated{" "}
              <time dateTime={guide.updatedAt}>
                {formatGuideDate(guide.updatedAt)}
              </time>
            </span>
          </>
        )}
        <span aria-hidden="true"> · </span>
        <span>{guide.readingMinutes} min read</span>
      </p>

      <div className="mt-8">
        <GuideBody
          body={guide.body}
          headline={guide.headline}
          slug={guide.slug}
        />
      </div>

      {guide.relatedRaces.length > 0 && (
        <aside className="mt-12 border-t pt-8">
          <h2 className="text-lg font-semibold">Race pages</h2>
          <ul className="mt-4 space-y-2">
            {guide.relatedRaces.map(raceSlug => (
              <li key={raceSlug}>
                <Link href={`/races/${raceSlug}`} className="hover:underline">
                  {raceLinkLabel(raceSlug)}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  )

  if (NEW_GUIDE_SLUGS.has(guide.slug)) {
    return <main>{article}</main>
  }

  return article
}
