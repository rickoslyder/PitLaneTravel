import { LRUCache } from "lru-cache"

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

type TokenState = {
  count: number
  windowStart: number
}

export default function rateLimit(options?: Options) {
  const interval = options?.interval || 60000
  const tokenCache = new LRUCache<string, TokenState>({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: interval
  })

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const now = Date.now()
        const state = tokenCache.get(token)

        if (!state || now - state.windowStart >= interval) {
          if (limit <= 0) {
            reject(new Error("Rate limit exceeded"))
            return
          }
          tokenCache.set(token, { count: 1, windowStart: now })
          resolve()
          return
        }

        if (state.count >= limit) {
          reject(new Error("Rate limit exceeded"))
          return
        }

        state.count += 1
        tokenCache.set(token, state)
        resolve()
      })
  }
}
