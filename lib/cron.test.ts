import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { verifyCronRequest } from "./cron"

function reqWith(auth?: string): Request {
  const headers = new Headers()
  if (auth !== undefined) headers.set("authorization", auth)
  return new Request("https://example.com/api/cron/x", { headers })
}

describe("verifyCronRequest", () => {
  const original = process.env.CRON_SECRET
  beforeEach(() => {
    process.env.CRON_SECRET = "s3cret"
  })
  afterEach(() => {
    process.env.CRON_SECRET = original
  })

  it("allows a request with the correct bearer token", () => {
    expect(verifyCronRequest(reqWith("Bearer s3cret"))).toBeNull()
  })

  it("rejects a request with no authorization header (401)", async () => {
    const res = verifyCronRequest(reqWith())
    expect(res?.status).toBe(401)
  })

  it("rejects a request with the wrong token (401)", async () => {
    const res = verifyCronRequest(reqWith("Bearer nope"))
    expect(res?.status).toBe(401)
  })

  it("fails closed with 503 when no secret is configured", async () => {
    delete process.env.CRON_SECRET
    const res = verifyCronRequest(reqWith("Bearer anything"))
    expect(res?.status).toBe(503)
  })
})
