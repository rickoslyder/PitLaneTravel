"use client"

import { useLayoutEffect, useState } from "react"

/**
 * False during SSR and hydration so markup matches. The layout effect then
 * applies the real prefers-reduced-motion value before the browser paints,
 * so entrance motion does not start for people who asked for reduced motion.
 * MotionConfig reducedMotion="user" also drops transform animations.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false)

  useLayoutEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduce(query.matches)
    apply()
    query.addEventListener("change", apply)
    return () => query.removeEventListener("change", apply)
  }, [])

  return reduce
}
