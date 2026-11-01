/*
 * Replaces the Progressier worker previously registered at this URL
 * (scope: /). Browsers that already installed it update to this script,
 * which drops the registration. No fetch handler, so it does not cache
 * or intercept navigation. Clients are not force-reloaded: a reload loop
 * would start if a cached document still contained the old script tag.
 */
self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter(key => /progressier/i.test(key))
          .map(key => caches.delete(key))
      )
      await self.registration.unregister()
    })()
  )
})
