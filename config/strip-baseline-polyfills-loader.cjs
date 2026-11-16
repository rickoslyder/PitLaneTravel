/*
Strips the Math.trunc / Number.isInteger polyfill baked into posthog-js's
prebuilt dist bundles. Those methods are native on the .browserslistrc floor
(Chrome 38 / Safari 9, and Chrome 34 / Safari 9). The assignment is what
Lighthouse's legacy-javascript audit signals as ~8 KiB of Math.trunc.

posthog-js is prebuilt, so the project browserslist cannot drop it.
*/

"use strict"

function baselinePolyfillPattern() {
  return /Math\.trunc\|\|\(Math\.trunc=function\(([A-Za-z_$][\w$]*)\)\{return \1<0\?Math\.ceil\(\1\):Math\.floor\(\1\)\}\),Number\.isInteger\|\|\(Number\.isInteger=function\(([A-Za-z_$][\w$]*)\)\{return [A-Za-z_$][\w$]*\(\2\)&&isFinite\(\2\)&&Math\.floor\(\2\)===\2\}\),?/g
}

function stripShippedBaselinePolyfills(source) {
  const code = Buffer.isBuffer(source) ? source.toString("utf8") : String(source)
  return code.replace(baselinePolyfillPattern(), "")
}

function stripBaselinePolyfillsLoader(source) {
  return stripShippedBaselinePolyfills(source)
}

module.exports = stripBaselinePolyfillsLoader
module.exports.stripShippedBaselinePolyfills = stripShippedBaselinePolyfills
