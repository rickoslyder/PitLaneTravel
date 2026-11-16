import type { ReactNode } from "react"
import { HeroPhoto } from "@/components/landing/hero-photo"

/**
 * Server frame for the home hero. The LCP photograph lives here, outside
 * the client overlay, so it can paint without waiting for hydration.
 */
export function HeroFrame({ children }: { children: ReactNode }) {
  return (
    <section className="relative flex min-h-[95vh] items-start justify-center overflow-hidden sm:items-center">
      <div className="absolute inset-0">
        <HeroPhoto />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      </div>
      <div className="container relative z-10 mx-auto px-4">{children}</div>
    </section>
  )
}
