"use server"

import { resend } from "@/lib/resend"
import { ActionState } from "@/types"
import { z } from "zod"
import ContactFormEmail from "@/emails/contact-form-email"
import ConfirmationEmail from "@/emails/confirmation-email"
import rateLimit from "@/lib/rate-limit"
import { headers } from "next/headers"
import { auth } from "@clerk/nextjs/server"
import { CONTACT_REASONS, ContactReason, getContactReasonDisplay } from "@/lib/contact-reasons"

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
})

// Enhanced validation schema with additional security measures
const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .regex(/^[a-zA-Z\s-']+$/, "Name contains invalid characters"),
  email: z
    .string()
    .email("Invalid email address")
    .max(100, "Email is too long")
    .toLowerCase(),
  contactReason: z
    .string()
    .min(1, "Please select a topic")
    .refine(
      (val): val is ContactReason => Object.keys(CONTACT_REASONS).includes(val),
      "Invalid topic selected"
    ),
  customSubject: z
    .string()
    .max(100, "Subject is too long")
    .optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message is too long")
    .trim()
}).refine(
  (data) => {
    // Require customSubject when contactReason is "other"
    if (data.contactReason === "other") {
      return !!data.customSubject && data.customSubject.length >= 2
    }
    return true
  },
  {
    message: "Please specify your topic",
    path: ["customSubject"]
  }
)

export type ContactFormData = z.infer<typeof contactSchema>

export async function submitContactFormAction(
  formData: ContactFormData
): Promise<ActionState<void>> {
  try {
    console.log("Starting contact form submission...")
    
    // Get IP for rate limiting
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1"
    console.log("IP for rate limiting:", ip)

    // Check rate limit (5 requests per minute per IP)
    try {
      await limiter.check(5, ip)
      console.log("Rate limit check passed")
    } catch {
      console.log("Rate limit exceeded for IP:", ip)
      return {
        isSuccess: false,
        message: "Too many requests. Please try again in a minute."
      }
    }

    // Get user session if available
    const session = auth()
    console.log("Auth session retrieved")

    // Validate the form data
    console.log("Validating form data:", formData)
    const validatedData = contactSchema.parse(formData)
    console.log("Form data validated successfully")

    // Get the display value for the contact reason
    const contactReasonDisplay = formData.contactReason === "other"
      ? formData.customSubject!
      : getContactReasonDisplay(formData.contactReason)

    // Basic spam check
    if (
      validatedData.message.toLowerCase().includes("http") ||
      validatedData.message.toLowerCase().includes("www")
    ) {
      console.log("Spam check failed - links detected in message")
      return {
        isSuccess: false,
        message: "Links are not allowed in messages"
      }
    }

    try {
      console.log("Attempting to send notification email to support...")
      // Send notification email to support
      const supportEmailResult = await resend.emails.send({
        from: "PitLane Travel <no-reply@notifications.pitlanetravel.com>",
        to: "support@pitlanetravel.com",
        subject: `New Contact Form: ${contactReasonDisplay}`,
        react: ContactFormEmail({
          ...validatedData,
          contactReasonDisplay
        })
      })
      console.log("Support email result:", supportEmailResult)

      console.log("Attempting to send confirmation email to user...")
      // Send confirmation email to user
      const userEmailResult = await resend.emails.send({
        from: "PitLane Travel <no-reply@notifications.pitlanetravel.com>",
        to: validatedData.email,
        subject: "We've received your message",
        react: ConfirmationEmail({
          name: validatedData.name,
          contactReasonDisplay
        })
      })
      console.log("User confirmation email result:", userEmailResult)

      // Check for email sending errors
      if (supportEmailResult.error || userEmailResult.error) {
        console.error("Email sending errors:", {
          support: supportEmailResult.error,
          user: userEmailResult.error
        })
        return {
          isSuccess: false,
          message: "Failed to send emails. Our team has been notified."
        }
      }
    } catch (error) {
      console.error("Error sending emails:", error)
      if (error instanceof Error) {
        console.error("Error details:", error.message)
        return {
          isSuccess: false,
          message: `Failed to send emails: ${error.message}`
        }
      }
      return {
        isSuccess: false,
        message: "Failed to send emails. Please try again later."
      }
    }

    console.log("Contact form submission completed successfully")
    return {
      isSuccess: true,
      message: "Thank you for your message. We'll get back to you soon.",
      data: undefined
    }
  } catch (error) {
    console.error("Error submitting contact form:", error)
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors[0].message
      console.error("Validation error:", errorMessage)
      return {
        isSuccess: false,
        message: errorMessage
      }
    }
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      return {
        isSuccess: false,
        message: `Failed to submit form: ${error.message}`
      }
    }
    return {
      isSuccess: false,
      message: "Failed to submit form. Please try again."
    }
  }
} 