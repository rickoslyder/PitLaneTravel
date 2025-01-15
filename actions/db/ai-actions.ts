"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { ActionState } from "@/types"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateTicketDescriptionAction(
  title: string,
  raceName: string,
  existingDescription: string
): Promise<ActionState<string>> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 1,
        maxOutputTokens: 500,
      },
    })

    const prompt = `Generate a short 250 character description of the "${title}" ticket for the ${raceName}. It will be displayed on my website in the Tickets section of this race's page. The ticket title will be displayed above it, and the price below it, so don't mention either in your description. Respond in a form that can be immediately used in the site without any modification.

This is information from the ticket supplier, but it's not formatted well - you can draw from this if needed:

"${existingDescription}"`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return {
      isSuccess: true,
      message: "Description generated successfully",
      data: text
    }
  } catch (error) {
    console.error("Error generating description:", error)
    return { isSuccess: false, message: "Failed to generate description" }
  }
} 