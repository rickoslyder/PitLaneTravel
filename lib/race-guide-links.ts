/**
 * Race slugs that should show a guide link. Only the 2026 Abu Dhabi page is
 * mapped. The 2025 race page is intentionally absent.
 * The 7 Dec 2027 text swap stays in the guide markdown; this map does not
 * need to change for that swap unless the race slug changes.
 */
const RACE_SLUG_TO_GUIDE: Record<string, string> = {
  "abu-dhabi-grand-prix-2026-f1-2026": "abu-dhabi-grand-prix-travel-guide"
}

export function guideSlugForRace(
  raceSlug: string | null | undefined
): string | null {
  if (!raceSlug) return null
  return RACE_SLUG_TO_GUIDE[raceSlug] ?? null
}
