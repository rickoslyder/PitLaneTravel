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
    category: "Race Planning",
    questions: [
      {
        question: "How far in advance should I book my F1 race tickets?",
        answer:
          "We recommend booking F1 race tickets at least 6-8 months in advance, especially for popular races like Monaco, Silverstone, or Monza. Early booking ensures better seat selection and often better prices."
      },
      {
        question: "Which grandstand should I choose?",
        answer:
          "The best grandstand depends on your preferences. Our circuit guides provide detailed comparisons of viewing angles, covered vs. uncovered options, and price points. You can also use our grandstand comparison tool to make an informed decision."
      },
      {
        question: "Can I bring cameras or other equipment to the race?",
        answer:
          "Generally, you can bring cameras for personal use. Professional equipment may require media credentials. Each circuit has specific rules about equipment, which we detail in our race guides."
      }
    ]
  },
  {
    category: "Travel & Accommodation",
    questions: [
      {
        question: "What's the best way to get to the circuit?",
        answer:
          "Transportation options vary by circuit. We provide detailed transport guides including public transit, shuttle services, and parking information. Many circuits offer special race weekend transport services."
      },
      {
        question: "How close should I stay to the circuit?",
        answer:
          "We recommend staying within a 30-minute travel radius of the circuit. However, some cities like Monaco or Singapore offer excellent public transport, allowing you to stay further away without inconvenience."
      },
      {
        question: "When should I arrive at the circuit?",
        answer:
          "We recommend arriving at least 2-3 hours before the main race. This allows time for security checks, finding your seat, and exploring the circuit. Practice and qualifying sessions are usually less crowded."
      }
    ]
  },
  {
    category: "Trip Planning",
    questions: [
      {
        question: "How does the AI Trip Planner work?",
        answer:
          "Our AI Trip Planner uses your preferences and race details to create personalized itineraries. It suggests activities, restaurants, and local attractions while considering the race schedule and local transport options."
      },
      {
        question: "Can I share my trip plans with friends?",
        answer:
          "Yes! You can share your trip plans with other PitLane Travel users. This is especially useful for group trips, allowing everyone to view and contribute to the itinerary."
      },
      {
        question: "What happens if the race is cancelled?",
        answer:
          "In case of race cancellation, ticket refunds are typically handled by the official ticket provider. We'll assist you with the refund process and help modify any travel arrangements made through our platform."
      }
    ]
  },
  {
    category: "Platform Features",
    questions: [
      {
        question: "Is my payment information secure?",
        answer:
          "Yes, we use industry-standard encryption and secure payment processing through Stripe. We never store your full credit card details on our servers."
      },
      {
        question: "Can I access my tickets offline?",
        answer:
          "Yes, you can download your tickets and travel documents for offline access through our platform. We recommend doing this before your trip."
      },
      {
        question: "How do I contact support?",
        answer:
          "You can reach our support team through the Help Center, email, or live chat. During race weekends, we offer extended support hours to assist with any urgent queries."
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
          Find answers to common questions about planning your F1 race weekend
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
