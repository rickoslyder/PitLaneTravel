const fs = require("node:fs")
const path = require("node:path")

function stylesheetHref(assetName) {
  const normalized = assetName.replace(/\\/g, "/").replace(/^\/+/, "")
  const relative = normalized.startsWith("_next/")
    ? normalized.slice("_next/".length)
    : normalized
  return "/_next/" + relative
}

function fallbackFace(css) {
  const faces = css.match(/@font-face\s*\{[^}]*\}/g) || []
  return faces.filter(face => /fallback/i.test(face)).join("")
}

/**
 * @param {{ name: string, css: string }[]} assets
 * @returns {{ hrefs: string[], fallbackFontCss: string }}
 */
function isPublicSheet(css) {
  return (
    css.includes("--tw-border-spacing-x") &&
    css.includes("[data-races-listing-hero]")
  )
}

function manifestFromAssets(assets) {
  const hrefs = []
  let fallbackFontCss = ""
  for (const asset of assets) {
    if (!asset.name.endsWith(".css")) continue
    const isTailwind = isPublicSheet(asset.css)
    if (isTailwind) hrefs.push(stylesheetHref(asset.name))
    if (
      !isTailwind &&
      asset.css.includes("@font-face") &&
      /Inter Fallback/.test(asset.css)
    ) {
      fallbackFontCss = fallbackFace(asset.css)
    }
  }
  return { hrefs, fallbackFontCss }
}

function cssAssetsOnDisk(dir) {
  const assets = []
  if (!fs.existsSync(dir)) return assets
  for (const entry of fs.readdirSync(dir)) {
    if (!entry.endsWith(".css")) continue
    const full = path.join(dir, entry)
    assets.push({
      name: "static/css/" + entry,
      css: fs.readFileSync(full, "utf8")
    })
  }
  return assets
}

const MANIFEST_TOKEN = "__RACES_STYLESHEET_MANIFEST__"

function javascriptFiles(dir, found) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) javascriptFiles(full, found)
    else if (entry.name.endsWith(".js")) found.push(full)
  }
}

/**
 * The public CSS hash does not exist until the client compilation finishes,
 * and Vercel does not ship `.next/static` inside the server function. Splice
 * the href into the already-emitted server bundles so the page can render the
 * link without reading the filesystem.
 */
function embedRacesStylesheetManifest() {
  const manifest = manifestFromAssets(
    cssAssetsOnDisk(path.join(process.cwd(), ".next", "static", "css"))
  )
  if (manifest.hrefs.length === 0) {
    return { replaced: 0, hrefs: [] }
  }
  const needle = JSON.stringify(MANIFEST_TOKEN)
  const replacement = JSON.stringify(JSON.stringify(manifest))
  const files = []
  javascriptFiles(path.join(process.cwd(), ".next", "server"), files)
  let replaced = 0
  let tokenRemaining = 0
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8")
    if (!source.includes(MANIFEST_TOKEN)) continue
    if (!source.includes(needle)) {
      throw new Error(
        `Races stylesheet token in ${file} is not a JSON string literal`
      )
    }
    const next = source.split(needle).join(replacement)
    fs.writeFileSync(file, next)
    replaced += 1
    if (next.includes(MANIFEST_TOKEN)) tokenRemaining += 1
  }
  return { replaced, hrefs: manifest.hrefs, tokenRemaining }
}

class RacesStylesheetManifestPlugin {
  apply(compiler) {
    // Server and edge workers finish before the client compiler writes CSS.
    // Patch the server bundles from the client compilation, after those files
    // and the hashed sheet are both on disk.
    if (compiler.name !== "client") return
    if (compiler.options.mode !== "production") return
    compiler.hooks.done.tap("RacesStylesheetManifestPlugin", stats => {
      if (stats.hasErrors()) return
      // Best effort. Next rewrites these bundles again while collecting
      // traces; next.config repeats the embed on the main process before exit.
      embedRacesStylesheetManifest()
    })
  }
}

module.exports = {
  RacesStylesheetManifestPlugin,
  manifestFromAssets,
  embedRacesStylesheetManifest,
  MANIFEST_TOKEN
}
