"use client"

import { useEffect, useRef } from "react"
import {
  scrollProgressScale,
  scrollProgressUsesTimeline
} from "@/lib/scroll-signals"

const PROGRESS_KEYFRAMES_ID = "pitlane-scroll-progress-keyframes"

function ensureProgressKeyframes() {
  if (document.getElementById(PROGRESS_KEYFRAMES_ID)) return
  const style = document.createElement("style")
  style.id = PROGRESS_KEYFRAMES_ID
  style.textContent =
    "@keyframes pitlane-scroll-progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}"
  document.head.appendChild(style)
}

export function ProgressIndicator() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    ensureProgressKeyframes()
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    let frame = 0
    let scriptListening = false

    const writeScale = () => {
      frame = 0
      const scale = scrollProgressScale(
        window.scrollY,
        window.innerHeight,
        document.documentElement.scrollHeight
      )
      bar.style.transform = `scaleX(${scale})`
    }

    const onScrollOrResize = () => {
      if (frame) return
      frame = window.requestAnimationFrame(writeScale)
    }

    const stopScript = () => {
      if (frame) {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
      if (!scriptListening) return
      window.removeEventListener("scroll", onScrollOrResize)
      window.removeEventListener("resize", onScrollOrResize)
      scriptListening = false
    }

    const apply = () => {
      const useTimeline = scrollProgressUsesTimeline(
        CSS.supports("animation-timeline", "scroll(root)"),
        motionQuery.matches
      )

      if (useTimeline) {
        stopScript()
        bar.style.removeProperty("transform")
        bar.style.setProperty("transform-origin", "left center")
        bar.style.setProperty("animation-name", "pitlane-scroll-progress")
        bar.style.setProperty("animation-duration", "auto")
        bar.style.setProperty("animation-timing-function", "linear")
        bar.style.setProperty("animation-timeline", "scroll(root)")
        bar.dataset.scrollProgressMode = "timeline"
        return
      }

      bar.style.removeProperty("animation-name")
      bar.style.removeProperty("animation-duration")
      bar.style.removeProperty("animation-timing-function")
      bar.style.removeProperty("animation-timeline")
      bar.style.setProperty("transform-origin", "left center")
      bar.dataset.scrollProgressMode = "script"
      writeScale()
      if (scriptListening) return
      window.addEventListener("scroll", onScrollOrResize, { passive: true })
      window.addEventListener("resize", onScrollOrResize, { passive: true })
      scriptListening = true
    }

    apply()
    motionQuery.addEventListener("change", apply)
    return () => {
      motionQuery.removeEventListener("change", apply)
      stopScript()
    }
  }, [])

  return (
    <div
      className="bg-muted fixed inset-x-0 top-0 z-[100] h-0.5"
      data-scroll-progress=""
    >
      <div
        ref={barRef}
        data-scroll-progress-bar=""
        className="bg-primary size-full origin-left scale-x-0"
      />
    </div>
  )
}
