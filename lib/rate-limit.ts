import { LRUCache } from "lru-cache"

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

type Usage = { count: number; windowStart: number }

export default function rateLimit(options?: Options) {
  const interval = options?.interval || 60000
  // The LRU only caps how many tokens are tracked. Window expiry is checked
  // against windowStart so that later calls cannot extend it.
  const tokenCache = new LRUCache<string, Usage>({
    max: options?.uniqueTokenPerInterval || 500
  })

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const now = Date.now()
        let usage = tokenCache.get(token)
        if (!usage || now - usage.windowStart >= interval) {
          usage = { count: 0, windowStart: now }
        }

        if (usage.count >= limit) {
          reject(new Error("Rate limit exceeded"))
          return
        }

        usage.count += 1
        tokenCache.set(token, usage)
        resolve()
      })
  }
}
