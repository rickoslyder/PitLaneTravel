import { generateKeyPairSync } from "node:crypto"
import { spawn as realSpawn, type ChildProcess } from "node:child_process"
import { verifyToken } from "@clerk/nextjs/server"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  E2E_CLERK_ADMIN_USER_ID,
  E2E_CLERK_AZP,
  E2E_CLERK_CLIENT_UAT_ENV,
  E2E_CLERK_ISSUER,
  E2E_CLERK_NONADMIN_USER_ID,
  E2E_CLERK_SESSION_ADMIN_ENV,
  E2E_CLERK_SESSION_NONADMIN_ENV,
  applyChildExit,
  buildChildEnv,
  createEphemeralClerkE2EAuth,
  parseProductionE2ECommand,
  spawnProductionE2ECommand
} from "./run-clerk-e2e-auth"

const SYNTHETIC_SECRET = ["sk_", "live", "_", "ci_invalid_synthetic_not_production"].join(
  ""
)
const PUBLISHABLE_KEY = "pk_live_Y2kuaW52YWxpZCQ="

function decodePayload(token: string): Record<string, unknown> {
  const parts = token.split(".")
  expect(parts.length, "session token should be a JWT").toBe(3)
  return JSON.parse(Buffer.from(parts[1]!, "base64url").toString("utf8"))
}

function cookieHeader(session: string, clientUat: number): string {
  return `__session=${session}; __client_uat=${clientUat}`
}

describe("createEphemeralClerkE2EAuth", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns distinct production-shaped admin and non-admin sessions and a public-only key", () => {
    const auth = createEphemeralClerkE2EAuth()
    const admin = decodePayload(auth.adminSession)
    const nonAdmin = decodePayload(auth.nonAdminSession)

    expect(auth.publicKey).toMatch(/-----BEGIN PUBLIC KEY-----/)
    expect(auth.publicKey).toMatch(/-----END PUBLIC KEY-----/)
    expect(auth.publicKey).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)
    expect(auth).not.toHaveProperty("privateKey")
    expect(JSON.stringify(auth)).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)

    expect(admin.sub).toBe(E2E_CLERK_ADMIN_USER_ID)
    expect(nonAdmin.sub).toBe(E2E_CLERK_NONADMIN_USER_ID)
    expect(admin.sid).not.toBe(nonAdmin.sid)
    expect(auth.adminSession).not.toBe(auth.nonAdminSession)

    for (const payload of [admin, nonAdmin]) {
      expect(payload.azp).toBe(E2E_CLERK_AZP)
      expect(payload.iss).toBe(E2E_CLERK_ISSUER)
      expect(payload.v).toBe(2)
      expect(payload.fva).toEqual([0, -1])
      expect(typeof payload.iat).toBe("number")
      expect(typeof payload.exp).toBe("number")
      expect(typeof payload.nbf).toBe("number")
      expect(payload.exp as number).toBeGreaterThan(payload.iat as number)
      expect(payload.nbf as number).toBeLessThanOrEqual(payload.iat as number)
      expect(auth.clientUat).toBe(payload.iat)
    }
  })

  it("does not print tokens or key material", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const info = vi.spyOn(console, "info").mockImplementation(() => {})
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {})

    const auth = createEphemeralClerkE2EAuth()
    buildChildEnv(process.env, auth)

    const printed = [...log.mock.calls, ...info.mock.calls, ...warn.mock.calls, ...error.mock.calls, ...debug.mock.calls]
      .flat()
      .map(String)
      .join(" ")

    expect(printed).toBe("")
    expect(printed).not.toContain("BEGIN PUBLIC KEY")
    expect(printed).not.toContain("BEGIN PRIVATE KEY")
    expect(printed).not.toContain(auth.adminSession)
    expect(printed).not.toContain(auth.nonAdminSession)
  })
})

describe("Clerk authenticateRequest accepts both ephemeral sessions", () => {
  it("signs both users in when jwtKey matches and both cookies are present", async () => {
    vi.resetModules()
    const auth = createEphemeralClerkE2EAuth()
    const { createClerkClient: freshCreateClerkClient } = await import(
      "@clerk/nextjs/server"
    )
    const client = freshCreateClerkClient({
      publishableKey: PUBLISHABLE_KEY,
      secretKey: SYNTHETIC_SECRET,
      jwtKey: auth.publicKey
    })

    const adminState = await client.authenticateRequest(
      new Request("http://localhost:3100/admin/coverage", {
        headers: {
          cookie: cookieHeader(auth.adminSession, auth.clientUat),
          accept: "application/json"
        }
      })
    )
    const nonAdminState = await client.authenticateRequest(
      new Request("http://localhost:3100/admin/coverage", {
        headers: {
          cookie: cookieHeader(auth.nonAdminSession, auth.clientUat),
          accept: "application/json"
        }
      })
    )

    expect(adminState.isSignedIn, "admin cookie pair should authenticate").toBe(
      true
    )
    expect(nonAdminState.isSignedIn, "non-admin cookie pair should authenticate").toBe(
      true
    )
    expect(adminState.toAuth()?.userId, "admin user").toBe(E2E_CLERK_ADMIN_USER_ID)
    expect(nonAdminState.toAuth()?.userId, "non-admin user").toBe(
      E2E_CLERK_NONADMIN_USER_ID
    )
  })

  it("fails closed for an unrelated public key", async () => {
    const auth = createEphemeralClerkE2EAuth()
    const unrelated = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" }
    })

    await expect(
      verifyToken(auth.adminSession, { jwtKey: unrelated.publicKey })
    ).rejects.toThrow(/invalid|signature|verif/i)
    await expect(
      verifyToken(auth.nonAdminSession, { jwtKey: unrelated.publicKey })
    ).rejects.toThrow(/invalid|signature|verif/i)
  })
})

describe("parseProductionE2ECommand", () => {
  it("rejects missing and malformed command arguments", () => {
    expect(() => parseProductionE2ECommand([])).toThrow(/missing|malformed/i)
    expect(() => parseProductionE2ECommand(["   "])).toThrow(/missing|malformed/i)
    expect(() => parseProductionE2ECommand(["npm", ""])).toThrow(
      /missing|malformed/i
    )
  })

  it("does not include env values in the rejection", () => {
    try {
      parseProductionE2ECommand([])
      throw new Error("expected parseProductionE2ECommand to reject")
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      expect(message).not.toMatch(/BEGIN (PUBLIC|PRIVATE) KEY/)
      expect(message).not.toMatch(/eyJ/)
      expect(message).not.toMatch(/CLERK_|PLAYWRIGHT_E2E_CLERK/)
    }
  })

  it("splits the executable from its arguments", () => {
    expect(parseProductionE2ECommand(["npm", "run", "test:e2e:base"])).toEqual({
      command: "npm",
      args: ["run", "test:e2e:base"]
    })
  })
})

describe("buildChildEnv", () => {
  it("exports public key, both sessions, and UAT without a private key", () => {
    const auth = createEphemeralClerkE2EAuth()
    const env = buildChildEnv(
      {
        PATH: "/usr/bin",
        CLERK_JWT_KEY: "stale-parent-key",
        LEAKED_PRIVATE: "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----"
      },
      auth
    )

    expect(env.CLERK_JWT_KEY).toBe(auth.publicKey)
    expect(env[E2E_CLERK_SESSION_ADMIN_ENV]).toBe(auth.adminSession)
    expect(env[E2E_CLERK_SESSION_NONADMIN_ENV]).toBe(auth.nonAdminSession)
    expect(env[E2E_CLERK_CLIENT_UAT_ENV]).toBe(String(auth.clientUat))
    expect(env.PATH).toBe("/usr/bin")
    expect(env.LEAKED_PRIVATE).toBeUndefined()

    const joined = Object.values(env)
      .filter((value): value is string => typeof value === "string")
      .join("\n")
    expect(joined).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)
  })
})

describe("spawnProductionE2ECommand", () => {
  it("spawns with shell false, inherited stdio, and no private key in child env", async () => {
    const auth = createEphemeralClerkE2EAuth()
    const child = spawnProductionE2ECommand(
      [
        "node",
        "-e",
        [
          "const values = Object.values(process.env).join('\\n');",
          "if (/BEGIN (RSA )?PRIVATE KEY/.test(values)) process.exit(2);",
          "if (!String(process.env.CLERK_JWT_KEY || '').includes('BEGIN PUBLIC KEY')) process.exit(3);",
          "if (!process.env.PLAYWRIGHT_E2E_CLERK_SESSION_ADMIN) process.exit(4);",
          "if (!process.env.PLAYWRIGHT_E2E_CLERK_SESSION_NONADMIN) process.exit(5);",
          "if (!process.env.PLAYWRIGHT_E2E_CLERK_CLIENT_UAT) process.exit(6);",
          "process.exit(0);"
        ].join("")
      ],
      { auth, env: { ...process.env, LEAKED_PRIVATE: "-----BEGIN PRIVATE KEY-----" } }
    )

    const exit = await new Promise<{ code: number | null; signal: NodeJS.Signals | null }>(
      resolve => {
        child.on("exit", (code, signal) => resolve({ code, signal }))
      }
    )

    expect(exit.signal, "child should not be signalled").toBeNull()
    expect(exit.code, "child env contract").toBe(0)
  })

  it("preserves a non-zero child exit code", async () => {
    const child = spawnProductionE2ECommand(["node", "-e", "process.exit(7)"])
    const exit = await new Promise<{ code: number | null; signal: NodeJS.Signals | null }>(
      resolve => {
        child.on("exit", (code, signal) => resolve({ code, signal }))
      }
    )
    expect(applyChildExit(exit.code, exit.signal)).toEqual({
      action: "exit",
      code: 7
    })
  })

  it("preserves child signal failure semantics", async () => {
    const child = spawnProductionE2ECommand([
      "node",
      "-e",
      "process.kill(process.pid, 'SIGTERM')"
    ])
    const exit = await new Promise<{ code: number | null; signal: NodeJS.Signals | null }>(
      resolve => {
        child.on("exit", (code, signal) => resolve({ code, signal }))
      }
    )
    expect(applyChildExit(exit.code, exit.signal)).toEqual({
      action: "signal",
      signal: "SIGTERM"
    })
  })

  it("uses shell false and inherit stdio", () => {
    let captured: { command: string; args: readonly string[]; options: object } | undefined
    const spawnImpl = ((
      command: string,
      args: readonly string[],
      options: object
    ): ChildProcess => {
      captured = { command, args, options }
      return realSpawn("node", ["-e", "process.exit(0)"], { stdio: "ignore" })
    }) as typeof realSpawn

    spawnProductionE2ECommand(["npm", "run", "test:e2e:base"], { spawnImpl })

    expect(captured?.command).toBe("npm")
    expect(captured?.args).toEqual(["run", "test:e2e:base"])
    expect(captured?.options).toMatchObject({
      shell: false,
      stdio: "inherit"
    })
    expect(JSON.stringify(captured?.options)).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)
  })

  it("does not put child env into thrown errors", () => {
    try {
      spawnProductionE2ECommand([])
      throw new Error("expected spawnProductionE2ECommand to reject")
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      expect(message).not.toMatch(/BEGIN (PUBLIC|PRIVATE) KEY/)
      expect(message).not.toMatch(/eyJ/)
      expect(message).not.toMatch(/CLERK_JWT_KEY=/)
    }
  })
})
