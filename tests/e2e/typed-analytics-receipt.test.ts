import { afterEach, describe, expect, it, vi } from "vitest"
import {
  appDefinedCustomPropertyReview,
  isPostHogTransportEnvelopeKey,
  vendorEventsFromPayload
} from "./typed-analytics-receipt"

const pageviewHome = {
  event: "$pageview",
  properties: { schema_version: 1, route: "/" }
}
const heroCta = {
  event: "hero calendar CTA clicked",
  properties: { schema_version: 1 }
}
const pageviewRaces = {
  event: "$pageview",
  properties: { schema_version: 1, route: "/races" }
}
const optIn = {
  event: "$opt_in",
  properties: {}
}

describe("typed analytics receipt decoder", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("decodes the observed top-level batch array of event objects", () => {
    const payload = [pageviewHome, heroCta, pageviewRaces]

    expect(vendorEventsFromPayload(payload)).toEqual([
      pageviewHome,
      heroCta,
      pageviewRaces
    ])
  })

  it("decodes a single top-level event object", () => {
    expect(vendorEventsFromPayload(optIn)).toEqual([optIn])
  })

  it("decodes an object with a batch array", () => {
    expect(
      vendorEventsFromPayload({ batch: [pageviewHome, heroCta, pageviewRaces] })
    ).toEqual([pageviewHome, heroCta, pageviewRaces])
  })

  it("ignores malformed and non-object entries", () => {
    const payload = [
      null,
      undefined,
      "not-an-event",
      12,
      ["nested"],
      { properties: { schema_version: 1 } },
      { event: 1, properties: { schema_version: 1 } },
      pageviewHome,
      { event: "hero calendar CTA clicked", properties: "nope" },
      pageviewRaces
    ]

    expect(vendorEventsFromPayload(payload)).toEqual([
      pageviewHome,
      { event: "hero calendar CTA clicked", properties: {} },
      pageviewRaces
    ])
  })

  it("does not mutate the payload or log raw bodies", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const info = vi.spyOn(console, "info").mockImplementation(() => {})
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {})
    const dir = vi.spyOn(console, "dir").mockImplementation(() => {})
    const payload = [
      { event: "$pageview", properties: { schema_version: 1, route: "/" } },
      "drop-me"
    ]
    const snapshot = structuredClone(payload)

    const decoded = vendorEventsFromPayload(payload)

    expect(decoded).toEqual([
      { event: "$pageview", properties: { schema_version: 1, route: "/" } }
    ])
    expect(payload).toEqual(snapshot)
    expect(log).not.toHaveBeenCalled()
    expect(info).not.toHaveBeenCalled()
    expect(debug).not.toHaveBeenCalled()
    expect(dir).not.toHaveBeenCalled()
  })
})

describe("typed analytics envelope vs app-defined custom properties", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("treats exact token, distinct_id, title, and $-prefixed keys as envelope keys", () => {
    expect(isPostHogTransportEnvelopeKey("token")).toBe(true)
    expect(isPostHogTransportEnvelopeKey("distinct_id")).toBe(true)
    expect(isPostHogTransportEnvelopeKey("title")).toBe(true)
    expect(isPostHogTransportEnvelopeKey("$browser")).toBe(true)
    expect(isPostHogTransportEnvelopeKey("$lib")).toBe(true)
    expect(isPostHogTransportEnvelopeKey("schema_version")).toBe(false)
    expect(isPostHogTransportEnvelopeKey("route")).toBe(false)
  })

  it("does not treat near-neighbor names as vendor envelope keys", () => {
    expect(isPostHogTransportEnvelopeKey("token_hint")).toBe(false)
    expect(isPostHogTransportEnvelopeKey("distinct_id_backup")).toBe(false)
    expect(isPostHogTransportEnvelopeKey("page_title")).toBe(false)
  })

  it("passes a valid synthetic PostHog envelope and projects only approved app fields", () => {
    const event = {
      event: "$pageview",
      properties: {
        token: "<redacted>",
        distinct_id: "<redacted>",
        $browser: "Chrome",
        title: "Home",
        schema_version: 1,
        route: "/"
      }
    }

    const review = appDefinedCustomPropertyReview(event)

    expect(review.unapprovedCustomKeys).toEqual([])
    expect(review.approvedCustomProperties).toEqual({
      schema_version: 1,
      route: "/"
    })
    expect(review.privacyScanMaterial).toEqual({
      event: "$pageview",
      properties: { schema_version: 1, route: "/" }
    })
    expect(Object.keys(review.privacyScanMaterial.properties).sort()).toEqual([
      "route",
      "schema_version"
    ])
  })

  it("reports unknown custom keys such as email and notes instead of silently projecting them away", () => {
    const review = appDefinedCustomPropertyReview({
      event: "hero calendar CTA clicked",
      properties: {
        token: "<redacted>",
        schema_version: 1,
        email: "<unapproved>",
        notes: "<unapproved>"
      }
    })

    expect(review.unapprovedCustomKeys).toEqual(["email", "notes"])
    expect(review.approvedCustomProperties).toEqual({ schema_version: 1 })
    expect(review.approvedCustomProperties).not.toHaveProperty("email")
    expect(review.approvedCustomProperties).not.toHaveProperty("notes")
    expect(review.privacyScanMaterial).toEqual({
      event: "hero calendar CTA clicked",
      properties: { schema_version: 1 }
    })
  })

  it("reports near-neighbor custom keys instead of classifying them as envelope keys", () => {
    const review = appDefinedCustomPropertyReview({
      event: "$pageview",
      properties: {
        token: "<redacted>",
        distinct_id: "<redacted>",
        title: "Home",
        schema_version: 1,
        route: "/",
        token_hint: "<unapproved>",
        distinct_id_backup: "<unapproved>",
        page_title: "<unapproved>"
      }
    })

    expect(review.unapprovedCustomKeys).toEqual([
      "token_hint",
      "distinct_id_backup",
      "page_title"
    ])
    expect(review.approvedCustomProperties).toEqual({
      schema_version: 1,
      route: "/"
    })
  })

  it("uses distinct exact app key sets for $pageview and hero calendar CTA clicked", () => {
    const pageview = appDefinedCustomPropertyReview({
      event: "$pageview",
      properties: { schema_version: 1, route: "/" }
    })
    expect(pageview.unapprovedCustomKeys).toEqual([])
    expect(pageview.approvedCustomProperties).toEqual({
      schema_version: 1,
      route: "/"
    })

    const heroWithRoute = appDefinedCustomPropertyReview({
      event: "hero calendar CTA clicked",
      properties: { schema_version: 1, route: "/" }
    })
    expect(heroWithRoute.unapprovedCustomKeys).toEqual(["route"])
    expect(heroWithRoute.approvedCustomProperties).toEqual({
      schema_version: 1
    })

    const hero = appDefinedCustomPropertyReview({
      event: "hero calendar CTA clicked",
      properties: { schema_version: 1 }
    })
    expect(hero.unapprovedCustomKeys).toEqual([])
    expect(hero.approvedCustomProperties).toEqual({ schema_version: 1 })
  })

  it("does not mutate the event or log while reviewing custom properties", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const info = vi.spyOn(console, "info").mockImplementation(() => {})
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {})
    const dir = vi.spyOn(console, "dir").mockImplementation(() => {})
    const event = {
      event: "$pageview",
      properties: {
        token: "<redacted>",
        distinct_id: "<redacted>",
        $browser: "Chrome",
        title: "Home",
        schema_version: 1,
        route: "/",
        email: "<unapproved>"
      }
    }
    const snapshot = structuredClone(event)

    const review = appDefinedCustomPropertyReview(event)

    expect(event).toEqual(snapshot)
    expect(review.unapprovedCustomKeys).toEqual(["email"])
    expect(log).not.toHaveBeenCalled()
    expect(info).not.toHaveBeenCalled()
    expect(debug).not.toHaveBeenCalled()
    expect(dir).not.toHaveBeenCalled()
  })
})
