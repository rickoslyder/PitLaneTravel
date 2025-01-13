'use server'

import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
})

export async function subscribeToNewsletter(prevState: any, formData: FormData) {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1000))

  const email = formData.get('email')
  
  const result = schema.safeParse({ email })
  
  if (!result.success) {
    return { success: false, message: "Please enter a valid email address", validating: false }
  }

  try {
    // Here you would typically send the email to your newsletter service
    // For demonstration purposes, we'll just simulate a successful subscription
    console.log('Subscribed email:', email)
    
    return { success: true, message: "Thank you for subscribing! Check your email for confirmation.", validating: false }
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    return { success: false, message: "An error occurred. Please try again later.", validating: false }
  }
}

