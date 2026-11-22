import { GuideWithFigures } from "@/components/guides/guide-with-figures"
import { RaceHubArticle } from "@/components/guides/race-hub-article"
import { PlanByFanTypeList } from "@/components/guides/plan-by-fan-type"
import { AtAGlanceTable } from "@/components/guides/at-a-glance-table"
import { GuideVideoSlot } from "@/components/guides/guide-video-slot"
import { AffiliateDisclosure } from "@/components/partners/affiliate-disclosure"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import {
  AFFILIATE_LINK_REL,
  atAGlanceRows,
  buildSubpageArticleJsonLd,
  buildSubpageBreadcrumbJsonLd,
  buildSubpageFaqJsonLd,
  type RaceHubSubpage
} from "@/lib/race-hub-subpages"
import { serializeJsonLd } from "@/lib/site-metadata"
import Link from "next/link"

export function RaceHubSubpageView({
  page,
  siblings,
  gaVsGrandstandHref = null
}: {
  page: RaceHubSubpage
  siblings: readonly { href: string; label: string }[]
  gaVsGrandstandHref?: string | null
}) {
  const partners = (page.affiliateLinks ?? []).map(link => link.partner)
  const hubHref = `/guides/${page.hubSlug}`

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildSubpageArticleJsonLd(page))
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildSubpageBreadcrumbJsonLd(page))
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildSubpageFaqJsonLd(page))
        }}
      />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/guides">Guides</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={hubHref}>{page.hubBreadcrumbLabel}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{page.breadcrumbLabel}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
        {page.headline}
      </h1>
      {page.article ? (
        <>
          <div className="mt-4">
            <GuideWithFigures
              routeKey={`${page.hubSlug}/${page.slug}`}
              source={page.article}
              renderMarkdown={(markdown, answerFirst) => (
                <RaceHubArticle
                  source={markdown}
                  markAnswerFirst={answerFirst}
                />
              )}
            />
          </div>
          {gaVsGrandstandHref && (
            <p className="mt-4">
              <Link href={gaVsGrandstandHref} className="hover:underline">
                General admission vs grandstand
              </Link>
            </p>
          )}
        </>
      ) : (
        <>
          <p className="mt-4">
            <Link href={hubHref} className="font-medium hover:underline">
              {page.hubLinkLabel}
            </Link>
          </p>
          <p data-answer-first className="mt-4 text-base leading-relaxed">
            {page.overview}
          </p>
          {partners.length > 0 && <AffiliateDisclosure partners={partners} />}
          {partners.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm">
              {(page.affiliateLinks ?? []).map(link => (
                <li key={link.href}>
                  <a href={link.href} rel={AFFILIATE_LINK_REL}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <section className="mt-10" aria-labelledby="at-a-glance-heading">
            <h2
              id="at-a-glance-heading"
              className="text-2xl font-semibold tracking-tight"
            >
              At a glance
            </h2>
            <AtAGlanceTable
              caption="At a glance: ticket, stand, transport, stay and budget"
              rows={atAGlanceRows(page)}
            />
            {gaVsGrandstandHref && (
              <p className="mt-4">
                <Link href={gaVsGrandstandHref} className="hover:underline">
                  General admission vs grandstand
                </Link>
              </p>
            )}
          </section>

          <section className="mt-10" aria-labelledby="questions-heading">
            <h2
              id="questions-heading"
              className="text-2xl font-semibold tracking-tight"
            >
              Questions
            </h2>
            <div className="mt-6 space-y-8">
              {page.questions.map(question => (
                <div key={question.question}>
                  <h3 className="text-lg font-semibold">{question.question}</h3>
                  <p className="mt-2 leading-relaxed">{question.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {(page.fanTips ?? []).length > 0 && (
            <section className="mt-10" aria-labelledby="fan-tips-heading">
              <h2
                id="fan-tips-heading"
                className="text-2xl font-semibold tracking-tight"
              >
                Fan tips
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5">
                {(page.fanTips ?? []).map(tip => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-10" aria-labelledby="video-heading">
            <h2
              id="video-heading"
              className="text-2xl font-semibold tracking-tight"
            >
              Video
            </h2>
            <div className="mt-4">
              <GuideVideoSlot />
            </div>
          </section>

          <PlanByFanTypeList links={siblings} showWhenEmpty />
        </>
      )}
    </article>
  )
}
