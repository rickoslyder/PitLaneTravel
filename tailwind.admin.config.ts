/*
<ai_context>
Tailwind build for styles/admin.css.

Scans app/admin and the admin-only components that the global sheet
ignores. Shared utilities that public pages also use are duplicated
here; admin pages load both sheets. Public pages do not load this one.
</ai_context>
*/

import type { Config } from "tailwindcss"
import base from "./tailwind.config"
import { adminContent } from "./config/tailwind-content"

const config = {
  ...base,
  content: adminContent
} satisfies Config

export default config
