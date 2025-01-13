"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "How does PitLane Travel simplify F1 trip planning?",
    answer:
      "PitLane Travel provides comprehensive circuit guides, smart flight search tools, and tailored travel recommendations, all in one place. This saves you time and reduces the stress of coordinating various aspects of your F1 trip."
  },
  {
    question:
      "Can I get information about specific grandstands and viewing areas?",
    answer:
      "We offer detailed information about grandstands and viewing areas for each circuit, including photos, pros and cons, and user reviews to help you make the best choice for your viewing experience."
  },
  {
    question: "Does PitLane Travel offer package deals for F1 races?",
    answer:
      "While we don't directly sell package deals, we provide recommendations and links to trusted partners who offer various F1 packages. Our platform helps you compare options and find the best deal for your budget and preferences."
  },
  {
    question: "How up-to-date is the information on PitLane Travel?",
    answer:
      "We constantly update our information to ensure accuracy. Our team of F1 enthusiasts and travel experts regularly review and refresh our content, especially as race weekends approach."
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
            Find answers to common questions about planning your F1 race
            weekend.
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
