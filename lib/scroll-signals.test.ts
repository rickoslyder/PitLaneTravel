import { afterEach, describe, expect, it, vi } from "vitest"
import {
  END_OF_PAGE_MESSAGE,
  SCROLL_END_FALLBACK_MS,
  TOP_OF_PAGE_MESSAGE,
  isScrolledFromTop,
  listenForScrollEnd,
  publishLiveMessage,
  reduceScrollFlags,
  scrollPositionMessage,
  scrollProgressScale,
  scrollProgressUsesTimeline,
  shouldShowScrollTop
} from "@/lib/scroll-signals"

describe("scroll flags", () => {
  it("treats the top of the page as not scrolled", () => {
    expect(isScrolledFromTop(0)).toBe(false)
    expect(isScrolledFromTop(-4)).toBe(false)
    expect(isScrolledFromTop(1)).toBe(true)
  })

  it("shows the scroll-to-top control only after 500px", () => {
    expect(shouldShowScrollTop(500)).toBe(false)
    expect(shouldShowScrollTop(501)).toBe(true)
  })

  it("returns null when neither flag changes", () => {
    const current = { isScrolled: true, showScrollTop: false }
    expect(reduceScrollFlags(current, 120)).toBeNull()
    expect(reduceScrollFlags(current, 500)).toBeNull()
    expect(
      reduceScrollFlags({ isScrolled: false, showScrollTop: false }, 0)
    ).toBe(null)
  })

  it("returns only the flags that a later setState needs", () => {
    expect(
      reduceScrollFlags({ isScrolled: false, showScrollTop: false }, 40)
    ).toEqual({ isScrolled: true, showScrollTop: false })
    expect(
      reduceScrollFlags({ isScrolled: true, showScrollTop: false }, 501)
    ).toEqual({ isScrolled: true, showScrollTop: true })
    expect(
      reduceScrollFlags({ isScrolled: true, showScrollTop: true }, 0)
    ).toEqual({ isScrolled: false, showScrollTop: false })
  })
})

describe("scroll progress scale", () => {
  it("maps scroll offset onto 0..1", () => {
    expect(scrollProgressScale(0, 800, 1800)).toBe(0)
    expect(scrollProgressScale(500, 800, 1800)).toBe(0.5)
    expect(scrollProgressScale(1000, 800, 1800)).toBe(1)
  })

  it("clamps overscroll and a page that does not scroll", () => {
    expect(scrollProgressScale(1400, 800, 1800)).toBe(1)
    expect(scrollProgressScale(-20, 800, 1800)).toBe(0)
    expect(scrollProgressScale(0, 800, 800)).toBe(0)
    expect(scrollProgressScale(0, 800, 100)).toBe(0)
    expect(scrollProgressScale(Number.NaN, 800, 1800)).toBe(0)
  })
})

describe("scroll progress timeline", () => {
  it("uses the scroll timeline only when motion is allowed", () => {
    expect(scrollProgressUsesTimeline(true, false)).toBe(true)
    expect(scrollProgressUsesTimeline(true, true)).toBe(false)
    expect(scrollProgressUsesTimeline(false, false)).toBe(false)
  })
})

describe("scroll position announcement", () => {
  it("announces the top before the end on a short page", () => {
    expect(scrollPositionMessage(0, 800, 900)).toBe(TOP_OF_PAGE_MESSAGE)
    expect(scrollPositionMessage(0, 800, 5000)).toBe(TOP_OF_PAGE_MESSAGE)
  })

  it("announces the end within 100px and stays quiet in between", () => {
    expect(scrollPositionMessage(4100, 800, 5000)).toBe(END_OF_PAGE_MESSAGE)
    expect(scrollPositionMessage(4099, 800, 5000)).toBeNull()
    expect(scrollPositionMessage(1, 800, 5000)).toBeNull()
  })
})

describe("live message publish", () => {
  it("writes a changed message and skips an identical one", () => {
    let writes = 0
    let text = ""
    const node = {
      get textContent() {
        return text
      },
      set textContent(value: string | null) {
        writes += 1
        text = value ?? ""
      }
    }

    expect(publishLiveMessage(node, null, TOP_OF_PAGE_MESSAGE)).toBe(
      TOP_OF_PAGE_MESSAGE
    )
    expect(text).toBe(TOP_OF_PAGE_MESSAGE)
    expect(writes).toBe(1)

    expect(
      publishLiveMessage(node, TOP_OF_PAGE_MESSAGE, TOP_OF_PAGE_MESSAGE)
    ).toBe(TOP_OF_PAGE_MESSAGE)
    expect(writes).toBe(1)

    expect(
      publishLiveMessage(node, TOP_OF_PAGE_MESSAGE, END_OF_PAGE_MESSAGE)
    ).toBe(END_OF_PAGE_MESSAGE)
    expect(text).toBe(END_OF_PAGE_MESSAGE)
    expect(writes).toBe(2)
  })

  it("does not read layout", () => {
    const node = new Proxy(
      { textContent: "" },
      {
        get(target, prop, receiver) {
          if (prop === "offsetWidth" || prop === "offsetHeight") {
            throw new Error("forced layout")
          }
          return Reflect.get(target, prop, receiver)
        }
      }
    )

    expect(() =>
      publishLiveMessage(node, null, "Switched to Travel tab")
    ).not.toThrow()
    expect(node.textContent).toBe("Switched to Travel tab")
  })
})

describe("scrollend listener", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function instrument(target: EventTarget) {
    const calls: Array<{ type: string; options?: unknown }> = []
    const add = target.addEventListener.bind(target)
    target.addEventListener = ((
      type: string,
      listener: EventListener,
      options?: AddEventListenerOptions | boolean
    ) => {
      calls.push({ type, options })
      add(type, listener, options)
    }) as typeof target.addEventListener
    return calls
  }

  it("uses the native scrollend event when the host supports it", () => {
    vi.useFakeTimers()
    const target = new EventTarget()
    const calls = instrument(target)
    const onScrollEnd = vi.fn()
    const stop = listenForScrollEnd(target, onScrollEnd, { onscrollend: null })

    target.dispatchEvent(new Event("scroll"))
    vi.advanceTimersByTime(SCROLL_END_FALLBACK_MS)
    expect(onScrollEnd).not.toHaveBeenCalled()

    target.dispatchEvent(new Event("scrollend"))
    expect(onScrollEnd).toHaveBeenCalledTimes(1)
    expect(calls.map(call => call.type)).toEqual(["scrollend"])

    stop()
    target.dispatchEvent(new Event("scrollend"))
    expect(onScrollEnd).toHaveBeenCalledTimes(1)
  })

  it("debounces a synthetic scrollend when onscrollend is missing", () => {
    vi.useFakeTimers()
    const target = new EventTarget()
    const calls = instrument(target)
    const onScrollEnd = vi.fn()
    const stop = listenForScrollEnd(target, onScrollEnd, {})

    target.dispatchEvent(new Event("scroll"))
    vi.advanceTimersByTime(SCROLL_END_FALLBACK_MS - 1)
    expect(onScrollEnd).not.toHaveBeenCalled()

    target.dispatchEvent(new Event("scroll"))
    vi.advanceTimersByTime(SCROLL_END_FALLBACK_MS - 1)
    expect(onScrollEnd).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onScrollEnd).toHaveBeenCalledTimes(1)

    const scrollCall = calls.find(call => call.type === "scroll")
    expect(scrollCall?.options).toEqual({ passive: true })

    stop()
    target.dispatchEvent(new Event("scroll"))
    vi.advanceTimersByTime(SCROLL_END_FALLBACK_MS)
    expect(onScrollEnd).toHaveBeenCalledTimes(1)
  })

  it("cancels a pending fallback when the listener is removed", () => {
    vi.useFakeTimers()
    const target = new EventTarget()
    const onScrollEnd = vi.fn()
    const stop = listenForScrollEnd(target, onScrollEnd, {})

    target.dispatchEvent(new Event("scroll"))
    stop()
    vi.advanceTimersByTime(SCROLL_END_FALLBACK_MS)
    expect(onScrollEnd).not.toHaveBeenCalled()
  })
})
