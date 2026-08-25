export type ClerkNetworklessMiddlewareOptions = {
  jwtKey: string
}

function clerkJwtKeyFromEnv(
  env: Record<string, string | undefined>
): string | undefined {
  const raw = env.CLERK_JWT_KEY
  if (raw == null) {
    return undefined
  }

  const trimmed = raw.trim()
  if (!trimmed) {
    return undefined
  }

  if (trimmed.includes("\n")) {
    return trimmed
  }

  return trimmed.replaceAll("\\n", "\n")
}

export function clerkMiddlewareNetworklessOptions(
  env: Record<string, string | undefined> = process.env
): ClerkNetworklessMiddlewareOptions | Record<string, never> {
  const jwtKey = clerkJwtKeyFromEnv(env)
  if (!jwtKey) {
    return {}
  }

  return { jwtKey }
}
