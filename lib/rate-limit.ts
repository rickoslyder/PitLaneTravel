import { LRUCache } from "lru-cache"

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

type TokenUsage = {
  count: number
  windowStart: number
}

export default function rateLimit(options?: Options) {
  const interval = options?.interval || 60000
  const tokenCache = new LRUCache<string, TokenUsage>({
    max: options?.uniqueTokenPerInterval || 500
  })

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const now = Date.now()
        const cached = tokenCache.get(token)
        const usage =
          cached && now - cached.windowStart < interval
            ? cached
            : { count: 0, windowStart: now }
        usage.count += 1

        const isRateLimited = usage.count > limit
        tokenCache.set(token, usage)

        isRateLimited ? reject(new Error("Rate limit exceeded")) : resolve()
      })
  }
}
