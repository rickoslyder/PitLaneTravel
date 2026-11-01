import { createElement } from "react"

/**
 * Always-visible affiliate marker. Colors are chosen for 7:1 contrast on the
 * card surface: #575757 on white, #9C9C9C on the dark card (#0A0A0A).
 */
export const affiliateAdColors = {
  light: "#575757",
  dark: "#9C9C9C",
  lightBackground: "#FFFFFF",
  darkBackground: "#0A0A0A"
} as const

export function AffiliateAdTag({ id }: { id?: string }) {
  return createElement(
    "span",
    {
      id,
      className:
        "shrink-0 text-xs font-medium leading-none text-[#575757] dark:text-[#9C9C9C]"
    },
    "Ad",
    createElement("span", { className: "sr-only" }, " (affiliate link)")
  )
}
