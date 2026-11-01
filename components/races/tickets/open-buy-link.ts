type MaskedUrlResult = { isSuccess: boolean; data?: string }

/**
 * Resolve the seller URL for a click. The masked redirect is preferred.
 * A failed or throwing lookup keeps the stored seller URL. Nothing here
 * writes a row; the caller performs that only from a click.
 */
export async function maskedBuyUrl(
  fallbackUrl: string,
  generate: () => Promise<MaskedUrlResult>
): Promise<string> {
  try {
    const result = await generate()
    if (result.isSuccess && result.data) return result.data
  } catch {
    // The stored seller URL is still a valid destination.
  }
  return fallbackUrl
}

/** Open a resolved URL in a new tab. Do not use the return value: noopener makes it null. */
export function openUrlInNewTab(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer")
}
