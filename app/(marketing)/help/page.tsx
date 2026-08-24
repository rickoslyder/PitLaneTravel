"use server"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Book,
  Calendar,
  FileQuestion,
  GitCompare,
  HelpCircle,
  Info,
  LifeBuoy,
  MapPin,
  MessageCircle,
  Plane,
  ScrollText
} from "lucide-react"
import Link from "next/link"

interface GuideProps {
  title: string
  description: string
  href: string
  icon: React.ReactNode
}

const routes: GuideProps[] = [
  {
    title: "Race calendar",
    description:
      "Compare dates and locations across Formula 1, Formula E, MotoGP, IndyCar and WEC.",
    href: "/races",
    icon: <Calendar className="size-5 text-[#E10600]" />
  },
  {
    title: "Compare races",
    description:
      "Open the compare tool. Missing travel-decision values stay unknown.",
    href: "/races/compare",
    icon: <GitCompare className="size-5 text-[#E10600]" />
  },
  {
    title: "Hotel city search",
    description:
      "Open a generic Booking.com city search. Confirm distance and terms on the provider.",
    href: "/hotels",
    icon: <MapPin className="size-5 text-[#E10600]" />
  }
]

const resources: GuideProps[] = [
  {
    title: "FAQs",
    description:
      "Coverage, planning tools, and labelled flight, hotel and package limits.",
    href: "/faq",
    icon: <FileQuestion className="size-5 text-[#E10600]" />
  },
  {
    title: "Contact",
    description: "Use the contact form for platform-related questions.",
    href: "/contact",
    icon: <MessageCircle className="size-5 text-[#E10600]" />
  },
  {
    title: "About Us",
    description:
      "What PitLane Travel is and what it does not sell or operate.",
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
          Live routes and current limits for planning a self-directed race
          weekend
        </p>
      </div>

      <div className="mx-auto mb-16 flex max-w-3xl flex-wrap justify-center gap-3">
        <Button asChild className="bg-[#E10600] hover:bg-[#FF0800]">
          <Link href="/races">
            <Calendar className="mr-2 size-4" />
            Race calendar
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/races/compare">Compare races</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/flights">
            <Plane className="mr-2 size-4" />
            Flight search
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/hotels">Hotel search</Link>
        </Button>
      </div>

      <div className="mb-16">
        <h2 className="mb-8 text-2xl font-bold">Planning routes</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {routes.map((route, index) => (
            <GuideCard key={index} {...route} />
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="mb-8 text-2xl font-bold">Site pages</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource, index) => (
            <GuideCard key={index} {...resource} />
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="mb-8 text-2xl font-bold">Policies</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy, index) => (
            <GuideCard key={index} {...policy} />
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-gradient-to-r from-gray-50 to-white p-8 text-center dark:from-gray-800 dark:to-gray-900">
        <h2 className="mb-4 text-2xl font-bold">Still have a question?</h2>
        <p className="text-muted-foreground mx-auto mb-6 max-w-2xl">
          Use the contact form for platform-related questions. There is no
          claimed support desk or race-weekend hotline.
        </p>
        <Link href="/contact">
          <Button className="bg-[#E10600] hover:bg-[#FF0800]">
            <MessageCircle className="mr-2 size-4" />
            Open contact form
          </Button>
        </Link>
      </div>
    </div>
  )
}
