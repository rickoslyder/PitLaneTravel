import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

/**
 * Strings that must never appear in public copy. The patterns live here, not
 * in the scanned trees, so the guard can name them without failing itself.
 */
export const FORBIDDEN_PUBLIC_COPY: ReadonlyArray<{
  label: string
  pattern: RegExp
}> = [
  { label: "/workspace", pattern: /\/workspace/ },
  { label: "/home/box", pattern: /\/home\/box/ },
  { label: "/cursor/stores", pattern: /\/cursor\/stores/ },
  { label: "Scout", pattern: /\bScout\b/ },
  { label: "Grawk, Grok or Writer", pattern: /\b(?:Grawk|Grok|Writer)\b/ },
  { label: "AD fact-id", pattern: /\bAD\d{1,3}\b/ },
  { label: "sand-subagent", pattern: /sand-subagent/ },
  { label: "bc-id", pattern: /\bbc-[0-9a-f]{8}/ },
  { label: "englead-", pattern: /englead-/ },
  { label: "fact-check", pattern: /fact-check/ },
  { label: "Engineering Lead", pattern: /Engineering Lead/ }
]

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".mdx",
  ".html",
  ".txt"
])

/** This module defines the denylist. It is not public copy. */
export const HYGIENE_DENYLIST_MODULE = "lib/public-content-hygiene.ts"

const RENDERED_COPY_TREES = [
  "content",
  "data",
  "app",
  "components",
  "config",
  "public"
] as const

const EXTRA_RENDERED_MODULES = [
  "lib/site-metadata.ts",
  "lib/sitemap-routes.ts"
] as const

export type PublicCopyLeak = {
  file: string
  line: number
  label: string
  excerpt: string
}

function isTestFile(name: string): boolean {
  return /\.(test|spec)\.[cm]?[jt]sx?$/.test(name)
}

function toPosix(value: string): string {
  return value.split(path.sep).join("/")
}

function walkCopyTree(root: string, relativeDir: string, files: string[]) {
  const absolute = path.join(root, relativeDir)
  let entries
  try {
    entries = readdirSync(absolute, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next") continue
    const relative = toPosix(path.join(relativeDir, entry.name))
    if (entry.isDirectory()) {
      walkCopyTree(root, relative, files)
      continue
    }
    if (!TEXT_EXTENSIONS.has(path.extname(entry.name))) continue
    if (isTestFile(entry.name)) continue
    if (relative === HYGIENE_DENYLIST_MODULE) continue
    files.push(relative)
  }
}

function addGuidesModules(root: string, files: string[]) {
  const libDir = path.join(root, "lib")
  for (const entry of readdirSync(libDir, { withFileTypes: true })) {
    if (!entry.name.startsWith("guides")) continue
    if (isTestFile(entry.name)) continue
    const relative = `lib/${entry.name}`
    const absolute = path.join(libDir, entry.name)
    if (entry.isDirectory()) {
      walkCopyTree(root, relative, files)
      continue
    }
    if (!statSync(absolute).isFile()) continue
    if (!TEXT_EXTENSIONS.has(path.extname(entry.name))) continue
    if (relative === HYGIENE_DENYLIST_MODULE) continue
    files.push(relative)
  }
}

/** Source files whose text can be rendered on a public page. */
export function publicCopyFiles(root = process.cwd()): string[] {
  const files: string[] = []
  for (const tree of RENDERED_COPY_TREES) {
    walkCopyTree(root, tree, files)
  }
  addGuidesModules(root, files)
  for (const extra of EXTRA_RENDERED_MODULES) {
    const absolute = path.join(root, extra)
    try {
      if (statSync(absolute).isFile()) files.push(extra)
    } catch {
      // Optional module. A missing file is not a leak.
    }
  }
  return [...new Set(files)].sort()
}

export function leaksInText(file: string, text: string): PublicCopyLeak[] {
  const leaks: PublicCopyLeak[] = []
  const lines = text.split(/\r?\n/)
  lines.forEach((line, index) => {
    for (const rule of FORBIDDEN_PUBLIC_COPY) {
      rule.pattern.lastIndex = 0
      if (!rule.pattern.test(line)) continue
      leaks.push({
        file,
        line: index + 1,
        label: rule.label,
        excerpt: line.trim().slice(0, 180)
      })
    }
  })
  return leaks
}

export function findPublicCopyLeaks(root = process.cwd()): PublicCopyLeak[] {
  const leaks: PublicCopyLeak[] = []
  for (const file of publicCopyFiles(root)) {
    const text = readFileSync(path.join(root, file), "utf8")
    leaks.push(...leaksInText(file, text))
  }
  return leaks
}

export function formatPublicCopyLeak(leak: PublicCopyLeak): string {
  return `${leak.file}:${leak.line}: ${leak.label}: ${leak.excerpt}`
}
