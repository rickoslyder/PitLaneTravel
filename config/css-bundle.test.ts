import { readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import { gzipSync } from "node:zlib"
import { createRequire } from "node:module"
import { describe, expect, it } from "vitest"
import { adminOnlyModules, unreferencedModules } from "./tailwind-content"

interface CssProcessor {
  (plugins: unknown[]): {
    process: (
      css: string,
      options: { from: string }
    ) => Promise<{ css: string }>
  }
}

const require = createRequire(import.meta.url)
const postcss = require("postcss") as CssProcessor
const loadConfig = require("postcss-load-config") as (
  ctx: object,
  cwd: string
) => Promise<{
  plugins: unknown[]
}>
const cssnano = require("next/dist/compiled/cssnano-simple") as (
  options: { colormin: boolean },
  processor: CssProcessor
) => unknown

const root = path.resolve(__dirname, "..")

async function compile(cssPath: string): Promise<string> {
  const from = path.join(root, cssPath)
  const input = readFileSync(from, "utf8")
  const loaded = await loadConfig({}, root)
  const compiled = await postcss(loaded.plugins).process(input, { from })
  const minified = await postcss([
    cssnano({ colormin: false }, postcss)
  ]).process(compiled.css, { from })
  return minified.css
}

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next") continue
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (/\.(ts|tsx)$/.test(entry)) acc.push(full)
  }
  return acc
}

function isTestFile(file: string): boolean {
  return /\.(test|spec)\.(ts|tsx)$/.test(file)
}

function moduleSpecifier(contentPath: string): string {
  return `@/${contentPath.replace(/^\.\//, "").replace(/\.tsx?$/, "")}`
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1")
}

describe("css bundle split", () => {
  it("keeps the public sheet under the previous 137 KB build and moves prose and admin-only rules out", async () => {
    const globalCss = await compile("app/globals.css")
    const proseCss = await compile("styles/prose.css")
    const adminCss = await compile("styles/admin.css")

    expect(globalCss.length).toBeLessThan(100_000)
    expect(gzipSync(globalCss).length).toBeLessThan(18_000)
    expect(globalCss).not.toContain(".prose{")
    expect(globalCss).not.toContain(".caption-bottom")
    expect(globalCss).toContain(".bg-brand")
    expect(globalCss).toContain("home-rise")

    expect(proseCss.length).toBeGreaterThan(15_000)
    expect(proseCss.length).toBeLessThan(45_000)
    expect(proseCss).toContain("@layer components")
    expect(proseCss).toContain(".prose{")
    expect(proseCss).toContain(".prose-sm")
    expect(proseCss).toContain(".prose-neutral")
    expect(globalCss).toContain("@layer utilities")
    expect(proseCss).toContain("prose-invert")
    expect(proseCss).toContain("prose-h1")

    expect(adminCss).toContain(".caption-bottom")
    expect(gzipSync(globalCss).length + gzipSync(proseCss).length).toBeLessThan(
      22_479
    )
  })

  it("keeps public utilities when prose and admin are compiled on the same PostCSS instance", async () => {
    const loaded = await loadConfig({}, root)
    const processor = postcss(loaded.plugins)
    const proseFrom = path.join(root, "styles/prose.css")
    const adminFrom = path.join(root, "styles/admin.css")
    const globalFrom = path.join(root, "app/globals.css")
    await processor.process(readFileSync(proseFrom, "utf8"), {
      from: proseFrom
    })
    await processor.process(readFileSync(adminFrom, "utf8"), {
      from: adminFrom
    })
    const globalCss = (
      await processor.process(readFileSync(globalFrom, "utf8"), {
        from: globalFrom
      })
    ).css
    expect(globalCss).toContain(".bg-brand")
    expect(globalCss).toMatch(/\.fixed\s*\{/)
    expect(globalCss).toMatch(/scroll-behavior:\s*smooth/)
    expect(globalCss).not.toContain(".prose{")
    expect(globalCss).not.toContain(".caption-bottom")

    const vendor = await processor.process(
      ".mapboxgl-map{font:12px/20px sans-serif}",
      { from: path.join(root, "styles/vendor-probe.css") }
    )
    expect(vendor.css).not.toContain("@layer")
  })

  it("does not let public modules import admin-only or unreferenced style sources", () => {
    const blocked = [...adminOnlyModules, ...unreferencedModules].map(
      moduleSpecifier
    )
    const blockedFiles = new Set(
      [...adminOnlyModules, ...unreferencedModules].map(item =>
        path.join(root, item.replace(/^\.\//, ""))
      )
    )
    const offenders: string[] = []
    for (const file of walk(root)) {
      if (file.includes(`${path.sep}app${path.sep}admin${path.sep}`)) continue
      if (blockedFiles.has(file) || isTestFile(file)) continue
      if (file.endsWith(`${path.sep}config${path.sep}css-bundle.test.ts`))
        continue
      const source = readFileSync(file, "utf8")
      for (const specifier of blocked) {
        const imported = new RegExp(
          `${specifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`
        ).test(source)
        if (imported) {
          offenders.push(`${path.relative(root, file)} imports ${specifier}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })

  it("imports the prose sheet from every module that uses a prose class", () => {
    const missing: string[] = []
    for (const file of walk(root)) {
      if (isTestFile(file)) continue
      if (file.includes(`${path.sep}config${path.sep}`)) continue
      if (file.endsWith("tailwind.prose.config.ts")) continue
      const source = readFileSync(file, "utf8")
      const withoutImports = stripComments(source).replace(
        /import\s+["'][^"']+["']/g,
        ""
      )
      const usesProse = /["'`][^"'`\n]*\bprose(?:-[\w:\\[\]/.%#-]+)?\b/.test(
        withoutImports
      )
      if (usesProse && !source.includes("@/styles/prose.css")) {
        missing.push(path.relative(root, file))
      }
    }
    expect(missing).toEqual([])
  })
})
