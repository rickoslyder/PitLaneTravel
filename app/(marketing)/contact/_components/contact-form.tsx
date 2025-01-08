"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useState, useRef } from "react"
import { submitContactFormAction } from "@/actions/contact-actions"
import { toast } from "sonner"
import { CONTACT_REASONS, ContactReason } from "@/lib/contact-reasons"

export function ContactForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedReason, setSelectedReason] = useState<string>("")
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const data = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        contactReason: formData.get("contactReason") as ContactReason,
        customSubject: formData.get("customSubject") as string,
        message: formData.get("message") as string
      }

      console.log("Submitting form data:", data)
      const result = await submitContactFormAction(data)
      console.log("Form submission result:", result)

      if (result.isSuccess) {
        toast.success(result.message, {
          duration: 5000,
          description: "We'll get back to you via email soon."
        })
        formRef.current?.reset()
        setSelectedReason("")
      } else {
        toast.error(result.message, {
          duration: 5000,
          description: "Please check your input and try again."
        })
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error("Something went wrong", {
        duration: 5000,
        description:
          error instanceof Error ? error.message : "Please try again later."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Your name"
              required
              minLength={2}
              className="focus-visible:ring-[#E10600]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              className="focus-visible:ring-[#E10600]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactReason">What can we help you with?</Label>
            <select
              id="contactReason"
              name="contactReason"
              className="bg-background w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E10600]"
              required
              disabled={isLoading}
              value={selectedReason}
              onChange={e => setSelectedReason(e.target.value)}
            >
              <option value="">Select a topic...</option>
              {Object.entries(CONTACT_REASONS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {selectedReason === "other" && (
            <div className="space-y-2">
              <Label htmlFor="customSubject">Please specify your topic</Label>
              <Input
                id="customSubject"
                name="customSubject"
                placeholder="Enter your specific topic"
                required
                minLength={2}
                maxLength={100}
                className="focus-visible:ring-[#E10600]"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="How can we help you?"
              required
              minLength={10}
              rows={5}
              className="focus-visible:ring-[#E10600]"
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#E10600] transition-all duration-200 hover:bg-[#FF0800]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          By submitting this form, you agree to our{" "}
          <a href="/privacy" className="text-[#E10600] hover:underline">
            Privacy Policy
          </a>
        </p>
      </form>
    </Card>
  )
}
