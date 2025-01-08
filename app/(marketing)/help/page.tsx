"use server"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Book,
  Calendar,
  Contact,
  FileQuestion,
  HelpCircle,
  Info,
  LifeBuoy,
  MapPin,
  MessageCircle,
  ScrollText,
  Search,
  Ticket
} from "lucide-react"
import Link from "next/link"

interface GuideProps {
  title: string
  description: string
  href: string
  icon: React.ReactNode
}

const guides: GuideProps[] = [
  {
    title: "Finding the Right Race",
    description:
      "Compare circuits, dates, and locations to choose your perfect F1 weekend.",
    href: "/races",
    icon: <Calendar className="size-5 text-[#E10600]" />
  },
  {
    title: "Understanding Tickets",
    description:
      "Learn about different ticket types, grandstands, and viewing options.",
    href: "/faq#tickets",
    icon: <Ticket className="size-5 text-[#E10600]" />
  },
  {
    title: "Planning Your Trip",
    description:
      "Tips for accommodation, transportation, and creating your itinerary.",
    href: "/faq#planning",
    icon: <MapPin className="size-5 text-[#E10600]" />
  }
]

const resources: GuideProps[] = [
  {
    title: "FAQs",
    description:
      "Find answers to commonly asked questions about F1 travel planning.",
    href: "/faq",
    icon: <FileQuestion className="size-5 text-[#E10600]" />
  },
  {
    title: "Contact Support",
    description: "Get in touch with our team for platform-related assistance.",
    href: "/contact",
    icon: <MessageCircle className="size-5 text-[#E10600]" />
  },
  {
    title: "About Us",
    description:
      "Learn about our platform and how we help plan F1 experiences.",
    href: "/about",
    icon: <Info className="size-5 text-[#E10600]" />
  }
]

const policies: GuideProps[] = [
  {
    title: "Terms of Service",
    description: "Understand our platform terms and conditions.",
    href: "/terms",
    icon: <ScrollText className="size-5 text-[#E10600]" />
  },
  {
    title: "Privacy Policy",
    description: "Learn how we handle and protect your information.",
    href: "/privacy",
    icon: <Book className="size-5 text-[#E10600]" />
  },
  {
    title: "Cancellation Policy",
    description: "Information about cancellations and provider policies.",
    href: "/cancellation",
    icon: <HelpCircle className="size-5 text-[#E10600]" />
  }
]

function GuideCard({ title, description, href, icon }: GuideProps) {
  return (
    <Link href={href}>
      <Card className="h-full transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

export default async function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <div className="mb-6 inline-block rounded-full bg-red-100 p-3 dark:bg-red-900/30">
          <LifeBuoy className="size-6 text-[#E10600]" />
        </div>
        <h1 className="mb-4 text-4xl font-bold">Help Center</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Find guides, FAQs, and resources to help you plan your F1 race weekend
        </p>
      </div>

      {/* Search Bar */}
      <div className="mx-auto mb-16 max-w-2xl">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search help articles..."
              className="bg-background w-full rounded-lg border px-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#E10600]"
            />
          </div>
          <Button className="bg-[#E10600] hover:bg-[#FF0800]">
            <Contact className="mr-2 size-4" />
            Contact Us
          </Button>
        </div>
      </div>

      {/* Quick Start Guides */}
      <div className="mb-16">
        <h2 className="mb-8 text-2xl font-bold">Quick Start Guides</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide, index) => (
            <GuideCard key={index} {...guide} />
          ))}
        </div>
      </div>

      {/* Help Resources */}
      <div className="mb-16">
        <h2 className="mb-8 text-2xl font-bold">Help Resources</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource, index) => (
            <GuideCard key={index} {...resource} />
          ))}
        </div>
      </div>

      {/* Policies */}
      <div className="mb-16">
        <h2 className="mb-8 text-2xl font-bold">Policies</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy, index) => (
            <GuideCard key={index} {...policy} />
          ))}
        </div>
      </div>

      {/* Still Need Help? */}
      <div className="rounded-lg bg-gradient-to-r from-gray-50 to-white p-8 text-center dark:from-gray-800 dark:to-gray-900">
        <h2 className="mb-4 text-2xl font-bold">Still Need Help?</h2>
        <p className="text-muted-foreground mx-auto mb-6 max-w-2xl">
          Can't find what you're looking for? Our support team is here to help
          with any platform-related questions.
        </p>
        <Link href="/contact">
          <Button className="bg-[#E10600] hover:bg-[#FF0800]">
            <MessageCircle className="mr-2 size-4" />
            Contact Support
          </Button>
        </Link>
      </div>
    </div>
  )
}
