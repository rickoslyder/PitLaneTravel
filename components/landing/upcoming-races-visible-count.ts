export const UPCOMING_RACES_SSR_VISIBLE_COUNT = 4

export function upcomingRacesVisibleCount(width: number): number {
  if (width >= 1536) return 4
  if (width >= 1024) return 3
  if (width >= 768) return 4
  return 1
}

export function upcomingRacesNextIndex(
  currentIndex: number,
  visibleCount: number,
  length: number
): number {
  return currentIndex + visibleCount >= length
    ? 0
    : currentIndex + visibleCount
}

export function upcomingRacesPrevIndex(
  currentIndex: number,
  visibleCount: number,
  length: number
): number {
  return currentIndex - visibleCount < 0
    ? Math.max(length - visibleCount, 0)
    : currentIndex - visibleCount
}

export function upcomingRacesPrevDisabled(currentIndex: number): boolean {
  return currentIndex === 0
}

export function upcomingRacesNextDisabled(
  currentIndex: number,
  visibleCount: number,
  length: number
): boolean {
  return currentIndex + visibleCount >= length
}
