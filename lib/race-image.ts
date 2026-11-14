/** Generic stock photo historically shown when a circuit had no picture. */
export const GENERIC_RACE_PHOTO_SRC = "/assets/placeholder.jpg"

export function isMissingRaceImage(src: string | null | undefined): boolean {
  if (typeof src !== "string") return true
  const trimmed = src.trim()
  if (!trimmed) return true
  const path = trimmed.split(/[?#]/)[0] ?? trimmed
  return (
    path === GENERIC_RACE_PHOTO_SRC || path.endsWith(GENERIC_RACE_PHOTO_SRC)
  )
}
