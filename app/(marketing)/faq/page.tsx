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
        question: "Can I see what a grandstand is like before I buy?",
        answer:
          "Yes. Our grandstand guides show the view, the shade and what each stand looks onto, plus what fans who sat there said."
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
        question: "Is my ticket real?",
        answer:
          "Buy from the official seller or an authorised agent. Resale tickets can be cancelled or swapped, so check who's selling before you pay."
      },
      {
        question: "What if the race is moved or cancelled?",
        answer:
          "Race dates follow the official calendar for each series. If a race moves or is cancelled, your ticket or package terms decide the refund, so check them before you pay."
      },
      {
        question: "How do I contact someone?",
        answer:
          "Use the contact form and tell us which race you're asking about."
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
          Common questions before a race weekend.
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
