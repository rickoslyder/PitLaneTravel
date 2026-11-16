/*
<ai_context>
Tailwind build for styles/prose.css only.

The typography plugin emits a component ruleset for every prose modifier
that appears in source. Keeping it on the global config added that ruleset
to every page, including routes that never render markdown. This config
feeds the extractor only tokens that contain "prose", so the sheet is the
prose rules plus the prose-* variant utilities, not a second copy of the
utility sheet.
</ai_context>
*/

import type { Config } from "tailwindcss"
import base from "./tailwind.config"

const config = {
  darkMode: base.darkMode,
  theme: base.theme,
  content: {
    files: [
      "./pages/**/*.{ts,tsx}",
      "./components/**/*.{ts,tsx}",
      "./app/**/*.{ts,tsx}"
    ],
    transform: {
      DEFAULT(content: string) {
        return (content.match(/[^\s"'`]*prose[^\s"'`]*/g) || []).join("\n")
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
} satisfies Config

export default config
