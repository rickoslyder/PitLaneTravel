/*
<ai_context>
Tiny level-gated logger. Prefer this over bare console.* so that debug/info noise
(and anything that might contain user data) is silenced in production. Errors always log.

Set LOG_LEVEL=debug|info|warn|error (default: "warn" in production, "debug" otherwise).
</ai_context>
*/

type Level = "debug" | "info" | "warn" | "error"

const order: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 }

function currentLevel(): Level {
  const env = process.env.LOG_LEVEL as Level | undefined
  if (env && env in order) return env
  return process.env.NODE_ENV === "production" ? "warn" : "debug"
}

function enabled(level: Level): boolean {
  return order[level] >= order[currentLevel()]
}

export const log = {
  debug: (...args: unknown[]) => enabled("debug") && console.debug(...args),
  info: (...args: unknown[]) => enabled("info") && console.info(...args),
  warn: (...args: unknown[]) => enabled("warn") && console.warn(...args),
  error: (...args: unknown[]) => console.error(...args)
}
