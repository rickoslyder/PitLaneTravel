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
  buildGuidesIndexBreadcrumbJsonLd,
  formatGuideDate,
  guidePath,
  listGuides,
  serializeJsonLd
} from "@/lib/guides"
import type { Metadata } from "next"
import Link from "next/link"

const title = `Guides | ${brand.name}`
const description = `Decision guides for choosing a motorsport trip. Each article names the sources its dates were checked against. ${brand.name} does not sell tickets or packages.`

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: absoluteUrl("/guides")
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: absoluteUrl("/guides"),
    locale: "en_GB",
    siteName: brand.name
  },
  twitter: {
    card: "summary",
    title,
    description
  }
}

export default function GuidesIndexPage() {
  const guides = listGuides()

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildGuidesIndexBreadcrumbJsonLd())
        }}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Guides</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mt-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Guides
        </h1>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          {description}
        </p>
      </header>

      <div className="mt-10 divide-y">
        {guides.map(guide => (
          <article key={guide.slug} className="py-8 first:pt-0">
            <h2 className="text-xl font-semibold tracking-tight">
              <Link href={guidePath(guide.slug)} className="hover:underline">
                {guide.title}
              </Link>
            </h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              {guide.description}
            </p>
            <p className="text-muted-foreground mt-3 text-sm">
              <time dateTime={guide.publishedAt}>
                {formatGuideDate(guide.publishedAt)}
              </time>
              <span aria-hidden="true"> · </span>
              <span>{guide.readingMinutes} min read</span>
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}
