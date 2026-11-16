/*
<ai_context>
Configures PostCSS for the app.
</ai_context>
*/

import tailwindcss from "tailwindcss"
import cascadeLayers from "./config/cascade-layers.mjs"

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [tailwindcss(), cascadeLayers()]
}

export default config
