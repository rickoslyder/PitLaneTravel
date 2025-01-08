import { Resend } from "resend"

// Verify API key exists
const resendApiKey = process.env.RESEND_API_KEY
if (!resendApiKey) {
  throw new Error("Missing RESEND_API_KEY environment variable")
}

// Initialize with error handling
let resend: Resend
try {
  console.log("Initializing Resend with API key...")
  resend = new Resend(resendApiKey)
  console.log("Resend initialized successfully")
} catch (error) {
  console.error("Failed to initialize Resend:", error)
  throw error
}

export { resend }
