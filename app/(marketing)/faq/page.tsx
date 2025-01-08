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
        question: "What's included in a typical race weekend package?",
        answer:
          "Our race weekend packages typically include race tickets, accommodation, and optional extras like circuit transfers and exclusive events. Each package is customizable to your preferences and budget."
      },
      {
        question: "Can I attend practice and qualifying sessions?",
        answer:
          "Yes! Most F1 tickets include access to all weekend sessions (Friday practice, Saturday qualifying, and Sunday race). Some circuits also offer single-day tickets for specific sessions."
      }
    ]
  },
  {
    category: "Tickets & Access",
    questions: [
      {
        question: "How do I receive my tickets?",
        answer:
          "Most tickets are delivered digitally through our secure platform. You'll receive an email notification when your tickets are ready to download, typically 2-3 weeks before the race."
      },
      {
        question: "Can I transfer or resell my tickets?",
        answer:
          "Ticket transfer policies vary by circuit and ticket type. Contact our support team for specific guidance on your tickets. For safety and security reasons, we recommend only purchasing tickets through authorized vendors."
      },
      {
        question: "What happens if I lose my tickets?",
        answer:
          "For digital tickets, you can always re-download them from your account. For physical tickets, contact our support team immediately, and we'll help coordinate with the circuit for replacement tickets."
      },
      {
        question: "Do children need tickets?",
        answer:
          "Ticket requirements for children vary by circuit. Some venues offer free entry for young children, while others require tickets regardless of age. Check our circuit guides for specific age policies."
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
      },
      {
        question: "Do you arrange airport transfers?",
        answer:
          "Yes, we can arrange private or shared airport transfers at most race locations. This service can be added to your package during booking or arranged later through our platform."
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
    category: "Circuit Experience",
    questions: [
      {
        question: "What can I bring to the circuit?",
        answer:
          "Essential items include your tickets, ID, comfortable shoes, weather-appropriate clothing, and sun protection. Most circuits allow small bags, cameras for personal use, and sealed water bottles. Each circuit has specific rules about permitted items, which we detail in our race guides."
      },
      {
        question: "Are there food and drink options at the circuit?",
        answer:
          "Yes, all circuits offer various food and beverage options. However, prices can be high and queues long during peak times. Some circuits allow you to bring your own food and sealed non-alcoholic drinks - check our circuit guides for specific policies."
      },
      {
        question: "What happens in case of rain?",
        answer:
          "F1 races proceed in wet conditions unless deemed unsafe by race control. We recommend checking our circuit guides for covered seating options and bringing appropriate wet weather gear."
      },
      {
        question: "Can I leave and re-enter the circuit?",
        answer:
          "Re-entry policies vary by circuit. Most venues allow re-entry with a valid ticket and hand stamp/wristband, but some restrict movement during certain times. Check our circuit guides for specific re-entry policies."
      }
    ]
  },
  {
    category: "Platform & Support",
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
          "You can reach our support team through the Help Center, email at support@pitlanetravel.com, or live chat. During race weekends, we offer extended support hours to assist with any urgent queries."
      },
      {
        question: "What happens if I need to cancel my booking?",
        answer:
          "Our cancellation policy varies depending on the package and how close to the race date you cancel. We recommend reviewing our cancellation policy before booking and considering travel insurance for added protection."
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
