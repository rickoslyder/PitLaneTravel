"use server"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"
import { brand } from "@/config/brand"
import { siteCopy } from "@/config/site-copy"
import { getPackagesAvailability } from "@/lib/packages-availability"
import { pageSeo } from "@/lib/site-metadata"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const { siteWide } = await getPackagesAvailability()
  const copy = siteCopy(siteWide)
  const title = `F1 Travel FAQ | ${brand.name}`
  const description = copy.helpFaqsDescription
  const seo = pageSeo("/faq")

  return {
    title,
    description,
    alternates: seo.alternates,
    openGraph: {
      title,
      description,
      url: seo.openGraph.url,
      images: seo.openGraph.images
    }
  }
}

export default async function FAQPage() {
  const { siteWide } = await getPackagesAvailability()
  const copy = siteCopy(siteWide)
  const faqs = [
    {
      category: "Coverage",
      questions: copy.faqCoverage
    },
    {
      category: "Planning tools",
      questions: copy.faqPlanning
    },
    {
      category: copy.faqTravelCategory,
      questions: copy.faqTravel
    }
  ]

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          {copy.faqSubtitle}
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-8">
        {faqs.map((category, index) => (
          <Card key={index} className="p-6">
            <h2 className="mb-4 text-2xl font-semibold">{category.category}</h2>
            <Accordion type="single" collapsible className="w-full">
              {category.questions.map((faq, faqIndex) => (
                <AccordionItem
                  key={faqIndex}
                  value={`item-${index}-${faqIndex}`}
                >
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        ))}
      </div>
    </div>
  )
}
