import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.{test,spec}.ts"],
    exclude: ["node_modules", ".next", "android"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".")
    }
  }
})
