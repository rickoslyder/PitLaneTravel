/*
<ai_context>
Tailwind records each rule's layer only as metadata, then emits flat CSS.
A second stylesheet loaded later would otherwise override equal-specificity
utilities. This restores real @layer blocks so base < components < utilities
across the global sheet and the prose sheet.

Custom CSS that Tailwind did not tag stays in the utilities layer, which is
where it already sat: after the generated utilities in globals.css.

CommonJS because Next.js loads PostCSS plugins with require() and rejects
plugin instances in postcss.config.
</ai_context>
*/

const postcss = require("postcss")

function layerName(node) {
  const meta = node.raws && node.raws.tailwind
  if (!meta) return null
  // Tailwind prints responsive rules after the utilities, so a responsive
  // prose modifier beats an equal-specificity utility such as mt-8.
  // Keep that order by placing those modifiers in the utilities layer.
  if (meta.layer === "variants") {
    return meta.parentLayer === "components"
      ? "utilities"
      : meta.parentLayer || "utilities"
  }
  if (meta.parentLayer) return meta.parentLayer
  if (meta.layer && meta.layer !== "variants") return meta.layer
  return null
}

function isSkipped(node) {
  return (
    node.type === "comment" ||
    (node.type === "atrule" &&
      (node.name === "keyframes" || node.name === "layer"))
  )
}

// Rules Tailwind left untagged are the @apply block inside `@layer base`
// (they sit before the utilities) and the hand-written rules at the end of
// globals.css (they sit after). The first group has to stay in base so it
// does not override prose. The second group stays with the utilities, which
// is where it already won ties by coming last.
function assignLayers(children) {
  let seenUtilities = false
  return children.map(node => {
    const named = layerName(node)
    let layer = named
    if (!layer && !isSkipped(node)) {
      layer = seenUtilities ? "utilities" : "base"
    }
    if (named === "utilities" || node.raws?.tailwind?.layer === "variants") {
      seenUtilities = true
    }
    return layer
  })
}

function wrapContainer(container) {
  const children = []
  container.each(child => children.push(child))
  const assigned = assignLayers(children)
  let index = 0
  const groups = []
  while (index < children.length) {
    const layer = assigned[index]
    if (!layer) {
      index += 1
      continue
    }
    const nodes = [children[index]]
    let next = index + 1
    while (next < children.length && assigned[next] === layer) {
      nodes.push(children[next])
      next += 1
    }
    groups.push({ layer, nodes })
    index = next
  }
  for (const group of groups.reverse()) {
    const atRule = postcss.atRule({ name: "layer", params: group.layer })
    group.nodes[0].before(atRule)
    for (const node of group.nodes) atRule.append(node)
  }
}

function cascadeLayers() {
  return {
    postcssPlugin: "cascade-layers",
    Once(root) {
      root.prepend(
        postcss.atRule({
          name: "layer",
          params: "base, components, utilities"
        })
      )
      wrapContainer(root)
    }
  }
}

cascadeLayers.postcss = true

module.exports = cascadeLayers
