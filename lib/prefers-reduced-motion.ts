"use client"

import { useEffect, useState } from "react"

/**
 * False during SSR so markup matches. The client updates to the real
 * prefers-reduced-motion value after mount. MotionConfig reducedMotion="user"
 * also snaps positional and height animations on the client.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduce(query.matches)
    apply()
    query.addEventListener("change", apply)
    return () => query.removeEventListener("change", apply)
  }, [])

  return reduce
}
