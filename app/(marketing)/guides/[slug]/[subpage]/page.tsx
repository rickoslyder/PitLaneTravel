import { RaceHubSubpageView } from "@/components/guides/race-hub-subpage-view"
import { brand } from "@/config/brand"
import { absoluteUrl, getGuide } from "@/lib/guides"
import {
  GA_VS_GRANDSTAND_SLUG,
  getRaceHubSubpage,
  isSubpageVisible,
  publishedGuideHref,
  publishedSiblingSubpages,
  raceHubSubpagePath,
  raceHubSubpageRegistry,
  subpagesForBuild
} from "@/lib/race-hub-subpages"
import { DEFAULT_OG_IMAGE_URL, pageSeo } from "@/lib/site-metadata"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

interface RaceHubSubpageProps {
  params: Promise<{ slug: string; subpage: string }>
}

/**
 * Unpublished sub-pages are omitted here when VERCEL_ENV is "production",
 * so the live build has no route for them (dynamicParams is false). Preview
 * and local builds include them. Open /guides/<hubSlug>/<slug> on a preview
 * deployment to review a draft. The sitemap and hub links stay published-only.
 */
export const dynamicParams = false

export function generateStaticParams() {
  return subpagesForBuild(raceHubSubpageRegistry).map(page => ({
    slug: page.hubSlug,
    subpage: page.slug
  }))
}

export async function generateMetadata({
  params
}: RaceHubSubpageProps): Promise<Metadata> {
  const { slug, subpage } = await params
  const page = getRaceHubSubpage(slug, subpage)
  if (!page || !isSubpageVisible(page)) {
    return { title: `Guide | ${brand.name}` }
  }

  const pathname = raceHubSubpagePath(page.hubSlug, page.slug)
  const seo = pageSeo(pathname)
  const canonical = absoluteUrl(pathname)
  return {
    title: `${page.title} | ${brand.name}`,
    description: page.description,
    alternates: seo.alternates,
    robots: page.published
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title: page.title,
      description: page.description,
      type: "article",
      url: canonical,
      locale: "en_GB",
      siteName: brand.name,
      publishedTime: page.publishedAt,
      modifiedTime: page.updatedAt,
      images: [{ url: DEFAULT_OG_IMAGE_URL, alt: page.title }]
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [DEFAULT_OG_IMAGE_URL]
    }
  }
}

export default async function RaceHubSubpagePage({
  params
}: RaceHubSubpageProps) {
  const { slug, subpage } = await params
  const page = getRaceHubSubpage(slug, subpage)
  if (!page || !isSubpageVisible(page)) notFound()

  const hub = getGuide(page.hubSlug)
  if (!hub) notFound()

  const siblings = publishedSiblingSubpages(page).map(other => ({
    href: raceHubSubpagePath(other.hubSlug, other.slug),
    label: other.breadcrumbLabel
  }))

  return (
    <RaceHubSubpageView
      page={page}
      siblings={siblings}
      gaVsGrandstandHref={publishedGuideHref(GA_VS_GRANDSTAND_SLUG)}
    />
  )
}
