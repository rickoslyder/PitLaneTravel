import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()

function readSource(relativePath: string): string {
  return readFileSync(path.join(root, relativePath), "utf8")
}

const publicLayouts = [
  "app/(marketing)/layout.tsx",
  "app/not-found.tsx",
  "app/packages/layout.tsx",
  "app/series/layout.tsx"
] as const

const toolLayouts = [
  "app/trips/layout.tsx",
  "app/budget/layout.tsx",
  "app/flights/layout.tsx",
  "app/hotels/layout.tsx",
  "app/transport/layout.tsx",
  "app/bookings/layout.tsx"
] as const

describe("public shell", () => {
  it("uses one header and footer on public layouts and no sidebar", () => {
    for (const relativePath of publicLayouts) {
      const source = readSource(relativePath)
      expect(source, relativePath).toContain("PublicShell")
      expect(source, relativePath).not.toContain("AppSidebar")
    }
    expect(readSource("app/races/compare/layout.tsx")).not.toContain("AppSidebar")
    const racesLayout = readSource("app/races/layout.tsx")
    expect(racesLayout).toContain("AppSidebar")
    expect(racesLayout).toContain("SidebarInset")
    expect(racesLayout).toContain("min-w-0")
    expect(readSource("components/public-shell.tsx")).toContain("overflow-x-clip")
    expect(readSource("components/public-shell.tsx")).toContain("<Header")
    expect(readSource("components/public-shell.tsx")).toContain("<SiteFooter")
  })

  it("keeps the sidebar on signed-in planning tools, including Saved and Trip Budget", () => {
    for (const relativePath of toolLayouts) {
      const source = readSource(relativePath)
      expect(source, relativePath).toContain("AppSidebar")
      expect(source, relativePath).toContain("min-w-0")
    }
    const sidebar = readSource("components/sidebar/app-sidebar.tsx")
    expect(sidebar).toContain('title: "My Trips"')
    expect(sidebar).toContain('name: "Trip Budget"')
    expect(sidebar).toContain('name: "Saved Items"')
    const header = readSource("components/header.tsx")
    expect(header).not.toContain('label: "My Trips"')
    expect(header).toContain('label="Saved Items"')
    expect(header).toContain('label="My Trips"')
    expect(header).toContain('href="/budget"')
    expect(header).toContain('href="/saved"')
  })
})
