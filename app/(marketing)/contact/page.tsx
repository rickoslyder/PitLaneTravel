/*
<ai_context>
This server page returns a simple "Contact Page" component as a (marketing) route.
</ai_context>
*/

"use server"

import { Card } from "@/components/ui/card"
import { Mail, MapPin, Phone } from "lucide-react"
import { ContactForm } from "./_components/contact-form"

export default async function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <div className="mb-6 inline-block rounded-full bg-red-100 p-3 dark:bg-red-900/30">
            <Mail className="size-6 text-[#E10600]" />
          </div>
          <h1 className="mb-4 text-4xl font-bold">Contact Us</h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Have questions about planning your F1 race weekend? Our team is here
            to help.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="mb-6 text-2xl font-semibold">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
                    <Mail className="size-5 text-[#E10600]" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <a
                      href="mailto:support@pitlanetravel.com"
                      className="text-muted-foreground transition-colors hover:text-[#E10600]"
                    >
                      support@pitlanetravel.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                <h3 className="mb-2 font-medium">Response Time</h3>
                <p className="text-muted-foreground text-sm">
                  We typically respond within 24 hours during business days.
                  During race weekends, we offer extended support hours.
                </p>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </div>
    </div>
  )
}
