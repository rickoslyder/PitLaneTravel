import { describe, expect, it } from "vitest"
import {
  ANALYTICS_SCHEMA_VERSION,
  sanitizeAnalyticsEvent
} from "./events"

describe("typed analytics event sanitizer", () => {
  it("injects schema_version 1 and ignores caller overrides on known events", () => {
    const page = sanitizeAnalyticsEvent({
      event: "page viewed",
      pathname: "/races",
      schema_version: 99
    })
    const hero = sanitizeAnalyticsEvent({
      event: "hero calendar CTA clicked",
      schema_version: 0
    })

    expect(page).toEqual({
      ok: true,
      event: "page viewed",
      properties: {
        route: "/races",
        schema_version: ANALYTICS_SCHEMA_VERSION
      }
    })
    expect(hero).toEqual({
      ok: true,
      event: "hero calendar CTA clicked",
      properties: { schema_version: ANALYTICS_SCHEMA_VERSION }
    })
    expect(ANALYTICS_SCHEMA_VERSION).toBe(1)
    expect(page.ok && page.properties.schema_version).toBe(1)
    expect(hero.ok && hero.properties.schema_version).toBe(1)
  })

  it("rejects unknown event names without echoing rejected values", () => {
    const result = sanitizeAnalyticsEvent({
      event: "purchase completed",
      email: "leak@example.com"
    })

    expect(result).toEqual({ ok: false, reason: "invalid-event" })
    expect(JSON.stringify(result)).not.toMatch(/purchase completed/)
    expect(JSON.stringify(result)).not.toMatch(/leak@example.com/)
    expect(JSON.stringify(result)).not.toMatch(/email/)
  })

  it("classifies known routes and collapses dynamic, query, hash, and unknown paths", () => {
    const cases: Array<[string, string]> = [
      ["/", "/"],
      ["/races", "/races"],
      ["/races/", "/races"],
      ["/races/monaco", "/races/:slug"],
      ["/races/monaco-gp?ref=hero#tickets", "/races/:slug"],
      ["/series/f1", "/series/:slug"],
      ["/trips", "/trips"],
      ["/trips/550e8400-e29b-41d4-a716-446655440000", "/trips/:id"],
      ["/flights", "/flights"],
      ["/packages", "/packages"],
      ["/admin/users", "other"],
      ["/not-a-real-page", "other"]
    ]

    for (const [pathname, route] of cases) {
      const result = sanitizeAnalyticsEvent({
        event: "page viewed",
        pathname
      })
      expect(result, pathname).toEqual({
        ok: true,
        event: "page viewed",
        properties: {
          route,
          schema_version: 1
        }
      })
      expect(JSON.stringify(result)).not.toContain("monaco")
      expect(JSON.stringify(result)).not.toContain("550e8400")
      expect(JSON.stringify(result)).not.toContain("ref=hero")
      expect(JSON.stringify(result)).not.toContain("tickets")
      expect(JSON.stringify(result)).not.toContain("not-a-real-page")
      expect(JSON.stringify(result)).not.toContain("admin/users")
    }
  })

  it("strips unknown keys and recursive PII aliases instead of spreading caller input", () => {
    const result = sanitizeAnalyticsEvent({
      event: "page viewed",
      pathname: "/trips/opaque-trip-id",
      email: "passenger@example.com",
      "e-mail": "alt@example.com",
      email_address: "addr@example.com",
      phone: "+15555550100",
      phone_number: "555",
      mobile: "555",
      first_name: "Ada",
      last_name: "Lovelace",
      full_name: "Ada Lovelace",
      name: "Ada",
      dob: "1815-12-10",
      date_of_birth: "1815-12-10",
      born_on: "1815-12-10",
      address: "1 Example St",
      city: "London",
      postcode: "SW1A 1AA",
      zip: "94102",
      gender: "female",
      title: "Ms",
      passenger: { email: "nested@example.com" },
      passengers: [{ first_name: "Ada" }],
      passenger_data: { notes: "window seat" },
      notes: "window seat",
      note: "note",
      comment: "comment",
      message: "message",
      external_id: "user_123",
      user_id: "user_123",
      clerk_id: "user_123",
      token: "tok_live",
      secret: "shh",
      arbitrary: "free form",
      schema_version: 7
    })

    expect(result).toEqual({
      ok: true,
      event: "page viewed",
      properties: {
        route: "/trips/:id",
        schema_version: 1
      }
    })
    const serialized = JSON.stringify(result)
    expect(serialized).not.toMatch(/passenger@example|Ada|Lovelace|1815|Example St|London|SW1A|94102|female|window seat|user_123|tok_live|opaque-trip-id|free form/i)
  })

  it("strips unexpected properties on hero clicks and never copies prototype keys", () => {
    const input = JSON.parse(
      '{"event":"hero calendar CTA clicked","notes":"do not leak","__proto__":{"polluted":true},"constructor":{"prototype":{"hacked":true}}}'
    ) as Record<string, unknown>
    Object.defineProperty(input, "prototype", {
      value: { leaked: true },
      enumerable: true
    })

    const result = sanitizeAnalyticsEvent(input)
    expect(result).toEqual({
      ok: true,
      event: "hero calendar CTA clicked",
      properties: { schema_version: 1 }
    })
    expect(JSON.stringify(result)).not.toMatch(/do not leak|polluted|hacked|leaked/)
    expect(Object.getPrototypeOf(result.ok ? result.properties : {})).toBe(
      Object.prototype
    )
    expect(
      Object.prototype.hasOwnProperty.call(
        result.ok ? result.properties : {},
        "polluted"
      )
    ).toBe(false)
  })

  it("rejects non-objects, arrays, invalid pathnames, and overlong values without leaking them", () => {
    const overlong = `/${"a".repeat(3000)}`
    const cases: unknown[] = [
      null,
      undefined,
      "page viewed",
      ["page viewed"],
      () => undefined,
      { event: "page viewed", pathname: { email: "obj@example.com" } },
      { event: "page viewed", pathname: ["/races"] },
      { event: "page viewed", pathname: 12 },
      { event: "page viewed", pathname: Number.POSITIVE_INFINITY },
      { event: "page viewed" },
      { event: "page viewed", pathname: overlong }
    ]

    for (const input of cases) {
      const result = sanitizeAnalyticsEvent(input)
      expect(result, JSON.stringify(input)).toEqual({
        ok: false,
        reason: "invalid-event"
      })
      const serialized = JSON.stringify(result)
      expect(serialized).not.toContain("obj@example.com")
      expect(serialized).not.toContain(overlong)
      expect(serialized).not.toContain("page viewed")
    }
  })

  it("strips extra function and symbol keys on known events rather than rejecting them", () => {
    const input: Record<string, unknown> = {
      event: "hero calendar CTA clicked",
      notes: () => "nope"
    }
    const symbolKey = Symbol("secret")
    Object.defineProperty(input, symbolKey, {
      value: "symbol-leak",
      enumerable: true
    })

    const result = sanitizeAnalyticsEvent(input)
    expect(result).toEqual({
      ok: true,
      event: "hero calendar CTA clicked",
      properties: { schema_version: 1 }
    })
    expect(JSON.stringify(result)).not.toContain("nope")
    expect(JSON.stringify(result)).not.toContain("symbol-leak")
  })

  it("accepts every name-only product event and injects schema_version 1", () => {
    const nameOnly = [
      "hero calendar CTA clicked",
      "hero compare CTA clicked",
      "race viewed",
      "trip created",
      "trip viewed",
      "flight offer selected",
      "flight checkout begun",
      "flight payment info submitted",
      "flight purchase completed"
    ] as const

    for (const event of nameOnly) {
      const result = sanitizeAnalyticsEvent({
        event,
        email: "leak@example.com",
        notes: "window seat",
        schema_version: 99
      })
      expect(result, event).toEqual({
        ok: true,
        event,
        properties: { schema_version: 1 }
      })
      expect(JSON.stringify(result)).not.toMatch(/leak@example.com|window seat/)
    }
  })
})
