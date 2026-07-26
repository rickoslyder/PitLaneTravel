import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { DEFAULT_SYSTEM_PROMPT } from "@/prompts/trip-planner"
import { auth } from "@clerk/nextjs/server"
import rateLimit from "@/lib/rate-limit"

// Edge runtime can't reach the DB-backed helpers in lib/auth, so authenticate
// directly against Clerk here and rate-limit per user to prevent wallet abuse.
export const runtime = "edge"

const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 })
const MAX_MESSAGES_PER_MINUTE = 20

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return new Response("Authentication required", { status: 401 })
  }

  try {
    await limiter.check(MAX_MESSAGES_PER_MINUTE, userId)
  } catch {
    return new Response("Rate limit exceeded. Please slow down.", {
      status: 429
    })
  }

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
