import { afterEach, describe, expect, it, vi } from "vitest"
import { fetchCurrencyDocument } from "./currency-rates"

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
  vi.restoreAllMocks()
})

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  })
}

describe("fetchCurrencyDocument", () => {
  it("returns the primary document without calling the fallback", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      expect(url).toContain("cdn.jsdelivr.net")
      return jsonResponse({ usd: { eur: 0.92 } })
    })
    globalThis.fetch = fetchMock as typeof fetch

    await expect(fetchCurrencyDocument("USD")).resolves.toEqual({
      usd: { eur: 0.92 }
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("uses the fallback when the primary response is not ok", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (String(url).includes("cdn.jsdelivr.net")) return jsonResponse({}, 404)
      return jsonResponse({ eur: { usd: 1.08 } })
    })
    globalThis.fetch = fetchMock as typeof fetch

    await expect(fetchCurrencyDocument("EUR")).resolves.toEqual({
      eur: { usd: 1.08 }
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain(
      "currency-api.pages.dev"
    )
  })

  it("uses the fallback when the primary request throws", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (String(url).includes("cdn.jsdelivr.net")) {
        throw new Error("network down")
      }
      return jsonResponse({ gbp: { usd: 1.3 } })
    })
    globalThis.fetch = fetchMock as typeof fetch

    await expect(fetchCurrencyDocument("GBP")).resolves.toEqual({
      gbp: { usd: 1.3 }
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("throws when both endpoints fail", async () => {
    globalThis.fetch = vi.fn(async () => jsonResponse({}, 503)) as typeof fetch

    await expect(fetchCurrencyDocument("AUD")).rejects.toThrow(
      "Failed to fetch rates for AUD"
    )
  })
})
