import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

function requestWithSvixHeaders(secretInBody = "whsec_should_not_be_echoed"): Request {
  return new Request("https://example.com/api/webhooks/clerk", {
    method: "POST",
    headers: {
      "svix-id": "msg_1",
      "svix-timestamp": "1710000000",
      "svix-signature": "v1,fake",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      type: "user.created",
      data: { id: "user_1" },
      secret: secretInBody
    })
  })
}

describe("Clerk webhook route", () => {
  const originalSecret = process.env.CLERK_WEBHOOK_SECRET

  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    delete process.env.CLERK_WEBHOOK_SECRET
  })

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.CLERK_WEBHOOK_SECRET
    } else {
      process.env.CLERK_WEBHOOK_SECRET = originalSecret
    }
  })

  it("imports without throwing when CLERK_WEBHOOK_SECRET is absent", async () => {
    await expect(import("./route")).resolves.toHaveProperty("POST")
  })

  it("returns 500 server misconfiguration when Svix headers are present but the secret is absent", async () => {
    const verify = vi.fn()
    const webhookCtor = vi.fn(function Webhook() {
      return { verify }
    })
    const select = vi.fn()
    const insert = vi.fn()
    vi.doMock("svix", () => ({ Webhook: webhookCtor }))
    vi.doMock("@/db/db", () => ({ db: { select, insert } }))
    vi.doMock("@clerk/nextjs/server", () => ({
      clerkClient: vi.fn()
    }))

    const { POST } = await import("./route")
    const res = await POST(requestWithSvixHeaders())
    expect(res.status).toBe(500)
    const body = await res.text()
    expect(body.toLowerCase()).toContain("server misconfiguration")
    expect(body).toContain("CLERK_WEBHOOK_SECRET")
    expect(body).not.toContain("whsec_should_not_be_echoed")
    expect(webhookCtor).not.toHaveBeenCalled()
    expect(verify).not.toHaveBeenCalled()
    expect(select).not.toHaveBeenCalled()
    expect(insert).not.toHaveBeenCalled()
  })

  it("returns 500 server misconfiguration when Svix headers are present but the secret is blank", async () => {
    process.env.CLERK_WEBHOOK_SECRET = "   "
    const verify = vi.fn()
    const webhookCtor = vi.fn(function Webhook() {
      return { verify }
    })
    const select = vi.fn()
    const insert = vi.fn()
    vi.doMock("svix", () => ({ Webhook: webhookCtor }))
    vi.doMock("@/db/db", () => ({ db: { select, insert } }))
    vi.doMock("@clerk/nextjs/server", () => ({
      clerkClient: vi.fn()
    }))

    const { POST } = await import("./route")
    const res = await POST(requestWithSvixHeaders())
    expect(res.status).toBe(500)
    const body = await res.text()
    expect(body.toLowerCase()).toContain("server misconfiguration")
    expect(body).toContain("CLERK_WEBHOOK_SECRET")
    expect(webhookCtor).not.toHaveBeenCalled()
    expect(verify).not.toHaveBeenCalled()
    expect(select).not.toHaveBeenCalled()
    expect(insert).not.toHaveBeenCalled()
  })

  it("returns 400 when the secret is configured and the signature is invalid", async () => {
    const configured = "whsec_configured_test"
    process.env.CLERK_WEBHOOK_SECRET = configured
    const verify = vi.fn(() => {
      throw new Error("invalid signature")
    })
    const webhookCtor = vi.fn(function Webhook() {
      return { verify }
    })
    const select = vi.fn()
    const insert = vi.fn()
    vi.doMock("svix", () => ({ Webhook: webhookCtor }))
    vi.doMock("@/db/db", () => ({ db: { select, insert } }))
    vi.doMock("@clerk/nextjs/server", () => ({
      clerkClient: vi.fn()
    }))

    const { POST } = await import("./route")
    const res = await POST(requestWithSvixHeaders())
    expect(res.status).toBe(400)
    const body = await res.text()
    expect(body).not.toContain(configured)
    expect(webhookCtor).toHaveBeenCalledWith(configured)
    expect(verify).toHaveBeenCalled()
    expect(select).not.toHaveBeenCalled()
    expect(insert).not.toHaveBeenCalled()
  })
})
