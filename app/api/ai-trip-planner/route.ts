import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { DEFAULT_SYSTEM_PROMPT } from "@/prompts/trip-planner"

export const runtime = "edge"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: [
      {
        role: "system",
        content: DEFAULT_SYSTEM_PROMPT
      },
      ...messages
    ]
  })

  return result.toDataStreamResponse()
}
