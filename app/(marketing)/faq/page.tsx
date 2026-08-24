"use server"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"

const faqs = [
  {
    category: "Coverage",
    questions: [
      {
        question: "Which championships does PitLane Travel cover?",
        answer:
          "The public catalogue is Formula 1, Formula E, MotoGP, IndyCar and WEC. Every supported event stays discoverable. Depth varies: some races have circuit pages, others are calendar-only."
      },
      {
        question: "Do you cover every circuit or series worldwide?",
        answer:
          "No. Coverage is those five series only. A race without a guide is still listed; missing logistics or viewing notes stay unknown."
      },
      {
        question: "Can I get information about specific grandstands?",
        answer:
          "Race and circuit pages include grandstand notes where coverage exists. If a viewing area is not documented, that gap is left unknown."
      }
    ]
  },
  {
    category: "Planning tools",
    questions: [
      {
        question: "What can I actually use on the site?",
        answer:
          "The race calendar, race and circuit pages where they exist, the compare tool, and labelled external search handoffs for flights and hotels."
      },
      {
        question: "Does PitLane Travel sell tickets?",
        answer:
          "PitLane is not a ticket seller or travel agency. Any ticket inventory, if present, is labelled as such. There is no digital ticket-delivery product here."
      },
      {
        question: "How do I contact someone?",
        answer:
          "Use the contact form. There is no claimed support desk or race-weekend hotline."
      }
    ]
  },
  {
    category: "Flights, hotels and packages",
    questions: [
      {
        question: "Does PitLane Travel offer package deals for races?",
        answer:
          "PitLane Travel does not currently sell race-weekend packages. It is a decision layer for self-directed travellers, not a package principal."
      },
      {
        question: "Do you book flights?",
        answer:
          "Flight search is a planning affordance with an external provider handoff. PitLane does not book, sell, or issue flights."
      },
      {
        question: "Are hotels verified or nearby the circuit?",
        answer:
          "Hotel links open a generic Booking.com city search using the circuit's city and country. Stays are not verified, ranked, or partnered. Confirm distance and terms on the provider."
      }
    ]
  }
]

export default async function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Limits and live routes for planning a self-directed race weekend
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
