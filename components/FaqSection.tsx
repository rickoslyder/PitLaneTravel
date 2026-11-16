"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { siteCopy } from "@/config/site-copy"

export default function FaqSection({
  packagesLive = false
}: {
  packagesLive?: boolean
}) {
  const faqs = siteCopy(packagesLive).homeFaqs
  const [activeIndex, setActiveIndex] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <section
      className="mt-20 bg-gradient-to-b from-gray-50 to-white py-20 dark:from-gray-800 dark:to-gray-900"
      aria-labelledby="faq-title"
    >
      <div className="container mx-auto px-4">
        <div className="home-rise">
          <h2 id="faq-title" className="mb-4 text-center text-4xl font-bold">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-center text-lg">
            What fans ask before a race weekend.
          </p>
          <div className="mx-auto max-w-4xl space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-border home-rise overflow-hidden rounded-lg border"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <button
                  type="button"
                  className="bg-card hover:bg-accent focus:ring-ring flex w-full items-center justify-between p-4 text-left focus:outline-none focus:ring-2"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={activeIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="font-semibold">{faq.question}</span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`motion-safe:transition-transform motion-safe:duration-200 ${
                      activeIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeIndex === index && (
                  <div id={`faq-answer-${index}`} className="faq-answer-open">
                    <p className="bg-background text-muted-foreground p-4">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
