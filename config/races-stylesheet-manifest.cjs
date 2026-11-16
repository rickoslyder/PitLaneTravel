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
function manifestFromAssets(assets) {
  const hrefs = []
  let fallbackFontCss = ""
  for (const asset of assets) {
    if (!asset.name.endsWith(".css")) continue
    const isTailwind =
      asset.css.includes("--tw-border-spacing-x") &&
      asset.css.includes(".text-4xl")
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

class RacesStylesheetManifestPlugin {
  apply(compiler) {
    compiler.hooks.done.tap("RacesStylesheetManifestPlugin", () => {
      try {
        const manifest = manifestFromAssets(
          cssAssetsOnDisk(path.join(process.cwd(), ".next", "static", "css"))
        )
        if (manifest.hrefs.length === 0) return
        const out = path.join(
          process.cwd(),
          ".next",
          "races-stylesheet-manifest.json"
        )
        fs.mkdirSync(path.dirname(out), { recursive: true })
        fs.writeFileSync(out, JSON.stringify(manifest))
      } catch {
        // A missing client sheet must not fail the server compilation.
      }
    })
  }
}

module.exports = {
  RacesStylesheetManifestPlugin,
  manifestFromAssets
}
