/**
 * Parse CLERK_AUTHORIZED_PARTIES into Clerk `authorizedParties`.
 * Unset, blank, or only empty entries returns undefined so callers omit the option.
 */
export function parseClerkAuthorizedParties(
  raw: string | undefined
): string[] | undefined {
  if (raw == null) return undefined

  const parties = raw
    .split(",")
    .map(entry => entry.trim())
    .filter(entry => entry.length > 0)

  if (parties.length === 0) return undefined
  return parties
}
