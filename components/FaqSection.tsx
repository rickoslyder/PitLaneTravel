"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "Which championships does PitLane Travel cover?",
    answer:
      "The public catalogue is Formula 1, Formula E, MotoGP, IndyCar and WEC. Depth varies: some races have circuit pages, others are calendar-only."
  },
  {
    question: "Can I get information about specific grandstands and viewing areas?",
    answer:
      "Race and circuit pages include grandstand notes where coverage exists. If a viewing area is not documented, that gap is left unknown."
  },
  {
    question: "Does PitLane Travel offer package deals for races?",
    answer:
      "PitLane Travel does not currently sell race-weekend packages. It is a decision layer for self-directed travellers, not a package principal or travel agency."
  },
  {
    question: "Do you book flights or verify hotels?",
    answer:
      "Flight search is a planning affordance with an external provider handoff. PitLane does not book, sell, or issue flights. Hotel links open a generic Booking.com city search. Confirm distance and terms on the provider."
  }
]

export default function FaqSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      toggleFaq(index)
    }
  }

  return (
    <section
      className="mt-20 bg-gradient-to-b from-gray-50 to-white py-20 dark:from-gray-800 dark:to-gray-900"
      aria-labelledby="faq-title"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 id="faq-title" className="mb-4 text-center text-4xl font-bold">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-center text-lg">
            Answers about the five-series catalogue and planning tools.
          </p>
          <div className="mx-auto max-w-4xl space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-border overflow-hidden rounded-lg border"
              >
                <div
                  className="bg-card hover:bg-accent flex w-full cursor-pointer items-center justify-between p-4 text-left focus:outline-none focus:ring-2 focus:ring-[#E10600]"
                  onClick={() => toggleFaq(index)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={activeIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="font-semibold">{faq.question}</span>
                  <ChevronDown
                    className={`transition-transform duration-200${
                      activeIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
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
  )
}
