import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

describe("resend lazy RESEND_API_KEY boundary", () => {
  const originalResendApiKey = process.env.RESEND_API_KEY

  beforeEach(() => {
    vi.resetModules()
    delete process.env.RESEND_API_KEY
  })

  afterEach(() => {
    if (originalResendApiKey === undefined) {
      delete process.env.RESEND_API_KEY
    } else {
      process.env.RESEND_API_KEY = originalResendApiKey
    }
  })

  it("imports without throwing when RESEND_API_KEY is absent", async () => {
    const Resend = vi.fn()
    vi.doMock("resend", () => ({ Resend }))
    await expect(import("./resend")).resolves.toHaveProperty("resend")
    expect(Resend).not.toHaveBeenCalled()
  })

  it("fails closed on first emails/send boundary when RESEND_API_KEY is absent, before constructing Resend", async () => {
    const send = vi.fn()
    const Resend = vi.fn(() => ({ emails: { send } }))
    vi.doMock("resend", () => ({ Resend }))
    const { MissingServerEnvError } = await import("@/config/server-env")
    const { resend } = await import("./resend")
    try {
      void resend.emails.send
      throw new Error("expected MissingServerEnvError")
    } catch (error) {
      expect(error).toBeInstanceOf(MissingServerEnvError)
      expect((error as { key: string }).key).toBe("RESEND_API_KEY")
      expect((error as Error).message).toBe("RESEND_API_KEY is required")
      expect(String(error)).not.toMatch(/re_/i)
    }
    expect(Resend).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  it("fails closed on first emails/send boundary when RESEND_API_KEY is blank, before constructing Resend", async () => {
    process.env.RESEND_API_KEY = "   "
    const send = vi.fn()
    const Resend = vi.fn(() => ({ emails: { send } }))
    vi.doMock("resend", () => ({ Resend }))
    const { MissingServerEnvError } = await import("@/config/server-env")
    const { resend } = await import("./resend")
    try {
      void resend.emails
      throw new Error("expected MissingServerEnvError")
    } catch (error) {
      expect(error).toBeInstanceOf(MissingServerEnvError)
      expect((error as { key: string }).key).toBe("RESEND_API_KEY")
      expect((error as Error).message).toBe("RESEND_API_KEY is required")
    }
    expect(Resend).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  it("lazily constructs the mocked Resend client and preserves resend.emails.send", async () => {
    const key = "re_configured_test_key"
    process.env.RESEND_API_KEY = key
    const send = vi.fn(async (..._args: unknown[]) => ({ id: "email_1" }))
    const Resend = vi.fn((..._args: unknown[]) => ({ emails: { send } }))
    vi.doMock("resend", () => ({ Resend }))
    const { resend } = await import("./resend")
    expect(Resend).not.toHaveBeenCalled()
    const payload = {
      from: "alerts@example.invalid",
      to: "user@example.invalid",
      subject: "waitlist",
      html: "<p>ok</p>"
    }
    await expect(resend.emails.send(payload)).resolves.toEqual({ id: "email_1" })
    expect(Resend).toHaveBeenCalledTimes(1)
    expect(Resend.mock.calls[0]?.[0]).toBe(key)
    expect(send).toHaveBeenCalledTimes(1)
    expect(send.mock.calls[0]?.[0]).toEqual(payload)
  })
})
