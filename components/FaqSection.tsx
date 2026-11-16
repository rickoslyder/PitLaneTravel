"use client"

import { useState } from "react"
import { AnimatePresence, motion, MotionConfig } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { siteCopy } from "@/config/site-copy"
import { usePrefersReducedMotion } from "@/lib/prefers-reduced-motion"

export default function FaqSection({
  packagesLive = false
}: {
  packagesLive?: boolean
}) {
  const faqs = siteCopy(packagesLive).homeFaqs
  const [activeIndex, setActiveIndex] = useState<number | null>(0)
  const reduceMotion = usePrefersReducedMotion()

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <MotionConfig reducedMotion="user">
      <section
        className="mt-20 bg-gradient-to-b from-gray-50 to-white py-20 dark:from-gray-800 dark:to-gray-900"
        aria-labelledby="faq-title"
      >
        <div className="container mx-auto px-4">
          <motion.div
            key={reduceMotion ? "reduced" : "motion"}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.8, ease: "easeOut" }
            }
          >
            <h2 id="faq-title" className="mb-4 text-center text-4xl font-bold">
              Frequently asked questions
            </h2>
            <p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-center text-lg">
              What fans ask before a race weekend.
            </p>
            <div className="mx-auto max-w-4xl space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { delay: index * 0.1, duration: 0.8, ease: "easeOut" }
                  }
                  className="border-border overflow-hidden rounded-lg border"
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
                  <AnimatePresence initial={false}>
                    {activeIndex === index && (
                      <motion.div
                        initial={
                          reduceMotion ? false : { height: 0, opacity: 0 }
                        }
                        animate={
                          reduceMotion
                            ? { opacity: 1 }
                            : { height: "auto", opacity: 1 }
                        }
                        exit={
                          reduceMotion
                            ? { opacity: 1 }
                            : { height: 0, opacity: 0 }
                        }
                        transition={{ duration: reduceMotion ? 0 : 0.3 }}
                        id={`faq-answer-${index}`}
                      >
                        <p className="bg-background text-muted-foreground p-4">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  )
}
