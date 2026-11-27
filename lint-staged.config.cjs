const path = require("path")

const buildNextLintCommand = filenames => {
  const files = filenames
    .map(file => path.relative(process.cwd(), file))
    .map(file => `--file "${file}"`)
    .join(" ")

  return `next lint --fix ${files}`
}

module.exports = {
  "{app,lib,db,components,context,types}/**/*.{ts,tsx}": [
    buildNextLintCommand,
    "prettier --write --cache"
  ]
}
