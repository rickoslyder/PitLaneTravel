import { generateKeyPairSync, createSign } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createClerkClient, verifyToken } from "@clerk/nextjs/server"
import { clerkMiddlewareNetworklessOptions } from "./clerk-middleware-options"

const ESCAPED_PUBLIC_KEY =
  "-----BEGIN PUBLIC KEY-----\\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAciExampleModulusOnly\\n-----END PUBLIC KEY-----"

const MULTILINE_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAciExampleModulusOnly
-----END PUBLIC KEY-----`

function signRs256(
  privatePem: string,
  payload: Record<string, unknown>,
  kid = "unrelated"
): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT", kid })
  ).toString("base64url")
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signer = createSign("RSA-SHA256")
  signer.update(`${header}.${body}`)
  return `${header}.${body}.${signer.sign(privatePem).toString("base64url")}`
}

describe("clerkMiddlewareNetworklessOptions", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("omits jwtKey when the env value is absent or blank", () => {
    expect(clerkMiddlewareNetworklessOptions({})).toEqual({})
    expect(
      clerkMiddlewareNetworklessOptions({ CLERK_JWT_KEY: undefined })
    ).toEqual({})
    expect(clerkMiddlewareNetworklessOptions({ CLERK_JWT_KEY: "" })).toEqual({})
    expect(clerkMiddlewareNetworklessOptions({ CLERK_JWT_KEY: "   " })).toEqual(
      {}
    )
    expect(Object.hasOwn(clerkMiddlewareNetworklessOptions({}), "jwtKey")).toBe(
      false
    )
  })

  it("turns a single-line escaped-newline public key into exact multiline jwtKey", () => {
    expect(
      clerkMiddlewareNetworklessOptions({ CLERK_JWT_KEY: ESCAPED_PUBLIC_KEY })
    ).toEqual({ jwtKey: MULTILINE_PUBLIC_KEY })
  })

  it("keeps an already multiline public key multiline", () => {
    expect(
      clerkMiddlewareNetworklessOptions({ CLERK_JWT_KEY: MULTILINE_PUBLIC_KEY })
    ).toEqual({ jwtKey: MULTILINE_PUBLIC_KEY })
  })

  it("does not log the key or option object", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const info = vi.spyOn(console, "info").mockImplementation(() => {})
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {})

    clerkMiddlewareNetworklessOptions({ CLERK_JWT_KEY: ESCAPED_PUBLIC_KEY })

    const printed = [
      ...log.mock.calls,
      ...info.mock.calls,
      ...warn.mock.calls,
      ...error.mock.calls,
      ...debug.mock.calls
    ]
      .flat()
      .map(String)
      .join(" ")

    expect(printed).toBe("")
    expect(printed).not.toContain("BEGIN PUBLIC KEY")
    expect(printed).not.toContain("jwtKey")
  })

  it("does not branch on CI, NODE_ENV, or PLAYWRIGHT", () => {
    const source = readFileSync(
      path.join(process.cwd(), "lib/clerk-middleware-options.ts"),
      "utf8"
    )
    expect(source).not.toMatch(/NODE_ENV|VERCEL_ENV|\bCI\b|PLAYWRIGHT/)
    expect(
      clerkMiddlewareNetworklessOptions({
        NODE_ENV: "test",
        CI: "true",
        PLAYWRIGHT: "1"
      })
    ).toEqual({})
    expect(
      clerkMiddlewareNetworklessOptions({
        NODE_ENV: "test",
        CI: "true",
        PLAYWRIGHT: "1",
        CLERK_JWT_KEY: ESCAPED_PUBLIC_KEY
      })
    ).toEqual({ jwtKey: MULTILINE_PUBLIC_KEY })
  })

  it("keeps middleware exported through clerkMiddleware with auth() and official options", () => {
    const middlewareSource = readFileSync(
      path.join(process.cwd(), "middleware.ts"),
      "utf8"
    )
    expect(middlewareSource).toMatch(
      /import\s*\{\s*clerkMiddleware[\s\S]*\}\s*from\s*["']@clerk\/nextjs\/server["']/
    )
    expect(middlewareSource).toMatch(/export default clerkMiddleware\s*\(/)
    expect(middlewareSource).toMatch(/await auth\(\)/)
    expect(middlewareSource).toMatch(/isProtectedRoute\(req\)/)
    expect(middlewareSource).toMatch(
      /export default clerkMiddleware\s*\([\s\S]*clerkMiddlewareNetworklessOptions\s*\(\s*\)/
    )
    expect(middlewareSource).not.toMatch(/process\.env\.(NODE_ENV|VERCEL_ENV)/)
    expect(middlewareSource).not.toMatch(/process\.env\.CI\b/)
    expect(middlewareSource).not.toMatch(/PLAYWRIGHT/)
  })
})

describe("Clerk networkless verification stays cryptographic and fail-closed", () => {
  it("treats anonymous requests as signed-out when jwtKey is present", async () => {
    const { publicKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" }
    })

    const secretKey = ["sk_", "live", "_", "ci_invalid_synthetic_not_production"].join(
      ""
    )

    const client = createClerkClient({
      publishableKey: "pk_live_Y2kuaW52YWxpZCQ=",
      secretKey,
      jwtKey: publicKey
    })

    const state = await client.authenticateRequest(
      new Request("http://localhost:3100/trips", {
        headers: { accept: "application/json" }
      })
    )

    expect(state.isSignedIn).toBe(false)
    expect(state.toAuth()?.userId ?? null).toBeNull()
  })

  it("rejects a token signed by an unrelated private key", async () => {
    const matching = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" }
    })
    const unrelated = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" }
    })

    const now = Math.floor(Date.now() / 1000)
    const token = signRs256(unrelated.privateKey, {
      azp: "http://localhost:3100",
      exp: now + 60,
      iat: now,
      iss: "https://ci.invalid",
      nbf: now - 10,
      sid: "sess_unrelated",
      sub: "user_unrelated"
    })

    await expect(
      verifyToken(token, { jwtKey: matching.publicKey })
    ).rejects.toThrow(/invalid|signature|verif/i)
  })
})

describe("synthetic CI jwt public key is public-only", () => {
  const root = process.cwd()

  it("labels the test example key as public/non-secret and omits private bytes", () => {
    const example = readFileSync(path.join(root, ".env.test.example"), "utf8")
    expect(example).toMatch(/CLERK_JWT_KEY=/)
    expect(example).toMatch(/BEGIN PUBLIC KEY/)
    expect(example).toMatch(/public/i)
    expect(example).toMatch(/non-secret|not a secret|non-production/i)
    expect(example).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)
    expect(example).not.toMatch(/CLERK_JWT_KEY=[\s\S]*PRIVATE/)
  })

  it("puts the public key in CI env without secret context or private bytes", () => {
    const ci = readFileSync(
      path.join(root, ".github/workflows/ci.yml"),
      "utf8"
    )
    expect(ci).toMatch(/permissions:\s*\n\s*contents:\s*read/)
    expect(ci).not.toMatch(/\$\{\{\s*secrets\./)
    expect(ci).toMatch(/CLERK_JWT_KEY:/)
    expect(ci).toMatch(/BEGIN PUBLIC KEY/)
    expect(ci).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)
  })

  it("does not embed the synthetic key in production .env.example", () => {
    const example = readFileSync(path.join(root, ".env.example"), "utf8")
    expect(example).not.toMatch(/BEGIN PUBLIC KEY/)
    expect(example).not.toMatch(/CLERK_JWT_KEY=/)
  })

  it("does not restore the quarantined rewrite intern", () => {
    expect(
      existsSync(path.join(root, "lib/intern-same-origin-middleware-rewrite.ts"))
    ).toBe(false)
  })
})
