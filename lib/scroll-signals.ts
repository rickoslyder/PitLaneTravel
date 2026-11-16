export const TOP_OF_PAGE_MESSAGE = "At the top of the page"
export const END_OF_PAGE_MESSAGE = "Nearing the end of the page"
export const SCROLL_END_FALLBACK_MS = 100

const END_OF_PAGE_THRESHOLD_PX = 100
const SCROLL_TOP_BUTTON_THRESHOLD_PX = 500

export type ScrollFlags = {
  isScrolled: boolean
  showScrollTop: boolean
}

export function isScrolledFromTop(scrollY: number): boolean {
  return scrollY > 0
}

export function shouldShowScrollTop(scrollY: number): boolean {
  return scrollY > SCROLL_TOP_BUTTON_THRESHOLD_PX
}

/** Null when neither flag changed, so callers can skip setState. */
export function reduceScrollFlags(
  current: ScrollFlags,
  scrollY: number
): ScrollFlags | null {
  const isScrolled = isScrolledFromTop(scrollY)
  const showScrollTop = shouldShowScrollTop(scrollY)
  if (
    current.isScrolled === isScrolled &&
    current.showScrollTop === showScrollTop
  ) {
    return null
  }
  return { isScrolled, showScrollTop }
}

/**
 * 0 at the top, 1 at the bottom. A page that cannot scroll stays at 0.
 * Overscroll clamps to that range.
 */
export function scrollProgressScale(
  scrollY: number,
  viewportHeight: number,
  documentHeight: number
): number {
  const maxScroll = documentHeight - viewportHeight
  if (!(maxScroll > 0)) return 0
  const ratio = scrollY / maxScroll
  if (!Number.isFinite(ratio)) return 0
  return Math.min(Math.max(ratio, 0), 1)
}

/** Scroll-driven CSS when the browser supports it and motion is allowed. */
export function scrollProgressUsesTimeline(
  supportsScrollTimeline: boolean,
  prefersReducedMotion: boolean
): boolean {
  return supportsScrollTimeline && !prefersReducedMotion
}

/**
 * Top wins when a short page is both at the top and within the end threshold.
 */
export function scrollPositionMessage(
  scrollY: number,
  viewportHeight: number,
  documentHeight: number
): string | null {
  if (scrollY === 0) return TOP_OF_PAGE_MESSAGE
  if (scrollY + viewportHeight >= documentHeight - END_OF_PAGE_THRESHOLD_PX) {
    return END_OF_PAGE_MESSAGE
  }
  return null
}

/** Writes the live region only when the message text changes. */
export function publishLiveMessage(
  node: { textContent: string | null },
  previous: string | null,
  message: string
): string | null {
  if (previous === message) return previous
  node.textContent = message
  return message
}

/**
 * Non-visual scroll work listens for scrollend. When the event is missing,
 * a 100ms idle timer dispatches it. scrollend is Baseline newly available
 * (since 2025-12-12), so the timer stays.
 */
export function listenForScrollEnd(
  target: EventTarget,
  onScrollEnd: () => void,
  host: object
): () => void {
  const handleEnd: EventListener = () => {
    onScrollEnd()
  }
  target.addEventListener("scrollend", handleEnd)

  let timer: ReturnType<typeof setTimeout> | undefined
  let handleScroll: EventListener | undefined

  if (!("onscrollend" in host)) {
    handleScroll = () => {
      if (timer !== undefined) clearTimeout(timer)
      timer = setTimeout(() => {
        target.dispatchEvent(new Event("scrollend"))
      }, SCROLL_END_FALLBACK_MS)
    }
    target.addEventListener("scroll", handleScroll, { passive: true })
  }

  return () => {
    target.removeEventListener("scrollend", handleEnd)
    if (handleScroll) {
      target.removeEventListener("scroll", handleScroll)
      if (timer !== undefined) clearTimeout(timer)
    }
  }
}
