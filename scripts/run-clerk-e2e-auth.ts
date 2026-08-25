import { spawn, type ChildProcess, type SpawnOptions } from "node:child_process"
import { createSign, generateKeyPairSync } from "node:crypto"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"

export const E2E_CLERK_ADMIN_USER_ID = "user_plt014_admin"
export const E2E_CLERK_NONADMIN_USER_ID = "user_plt014_nonadmin"
export const E2E_CLERK_AZP = "http://localhost:3100"
export const E2E_CLERK_ISSUER = "https://ci.invalid"
export const E2E_CLERK_SESSION_ADMIN_ENV = "PLAYWRIGHT_E2E_CLERK_SESSION_ADMIN"
export const E2E_CLERK_SESSION_NONADMIN_ENV =
  "PLAYWRIGHT_E2E_CLERK_SESSION_NONADMIN"
export const E2E_CLERK_CLIENT_UAT_ENV = "PLAYWRIGHT_E2E_CLERK_CLIENT_UAT"

const TOKEN_TTL_SECONDS = 4 * 60 * 60
const PRIVATE_KEY_PEEK = /BEGIN (RSA )?PRIVATE KEY/

export type EphemeralClerkE2EAuth = {
  publicKey: string
  adminSession: string
  nonAdminSession: string
  clientUat: number
}

export type ParsedProductionE2ECommand = {
  command: string
  args: string[]
}

export type ChildExit =
  | { action: "exit"; code: number }
  | { action: "signal"; signal: NodeJS.Signals }

function signRs256(
  privateKey: string,
  payload: Record<string, unknown>
): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT" })
  ).toString("base64url")
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signer = createSign("RSA-SHA256")
  signer.update(`${header}.${body}`)
  signer.end()
  return `${header}.${body}.${signer.sign(privateKey, "base64url")}`
}

export function createEphemeralClerkE2EAuth(
  nowSeconds = Math.floor(Date.now() / 1000)
): EphemeralClerkE2EAuth {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  })

  const claims = {
    azp: E2E_CLERK_AZP,
    exp: nowSeconds + TOKEN_TTL_SECONDS,
    iat: nowSeconds,
    nbf: nowSeconds,
    iss: E2E_CLERK_ISSUER,
    v: 2,
    fva: [0, -1]
  }

  const adminSession = signRs256(privateKey, {
    ...claims,
    sid: "sess_plt014_admin",
    sub: E2E_CLERK_ADMIN_USER_ID
  })
  const nonAdminSession = signRs256(privateKey, {
    ...claims,
    sid: "sess_plt014_nonadmin",
    sub: E2E_CLERK_NONADMIN_USER_ID
  })

  return {
    publicKey,
    adminSession,
    nonAdminSession,
    clientUat: nowSeconds
  }
}

export function parseProductionE2ECommand(
  argv: string[]
): ParsedProductionE2ECommand {
  if (argv.length === 0 || argv.some(arg => typeof arg !== "string" || arg.trim() === "")) {
    throw new Error("Missing or malformed production E2E command")
  }

  const [command, ...args] = argv
  return { command, args }
}

export function buildChildEnv(
  parentEnv: NodeJS.ProcessEnv | Record<string, string | undefined>,
  auth: EphemeralClerkE2EAuth
): NodeJS.ProcessEnv {
  const env = { ...parentEnv } as NodeJS.ProcessEnv

  for (const [key, value] of Object.entries(env)) {
    if (typeof value === "string" && PRIVATE_KEY_PEEK.test(value)) {
      delete env[key]
    }
  }

  env.CLERK_JWT_KEY = auth.publicKey
  env[E2E_CLERK_SESSION_ADMIN_ENV] = auth.adminSession
  env[E2E_CLERK_SESSION_NONADMIN_ENV] = auth.nonAdminSession
  env[E2E_CLERK_CLIENT_UAT_ENV] = String(auth.clientUat)
  return env
}

export function applyChildExit(
  code: number | null,
  signal: NodeJS.Signals | null
): ChildExit {
  if (signal) {
    return { action: "signal", signal }
  }
  return { action: "exit", code: code ?? 1 }
}

export function spawnProductionE2ECommand(
  commandArgs: string[],
  options: {
    env?: NodeJS.ProcessEnv
    auth?: EphemeralClerkE2EAuth
    spawnImpl?: typeof spawn
  } = {}
): ChildProcess {
  let parsed: ParsedProductionE2ECommand
  try {
    parsed = parseProductionE2ECommand(commandArgs)
  } catch {
    throw new Error("Missing or malformed production E2E command")
  }

  const auth = options.auth ?? createEphemeralClerkE2EAuth()
  const env = buildChildEnv(options.env ?? process.env, auth)
  const spawnImpl = options.spawnImpl ?? spawn
  const spawnOptions: SpawnOptions = {
    shell: false,
    stdio: "inherit",
    env
  }

  try {
    return spawnImpl(parsed.command, parsed.args, spawnOptions)
  } catch {
    throw new Error("Failed to spawn production E2E command")
  }
}

export function isDirectCliExecution(
  metaUrl: string,
  argv1: string | undefined
): boolean {
  if (!argv1) return false
  try {
    return pathToFileURL(resolve(argv1)).href === metaUrl
  } catch {
    return false
  }
}

export function forwardChildCompletion(
  child: ChildProcess,
  runtime: {
    exit: (code: number) => void
    kill: (pid: number, signal: NodeJS.Signals) => void
    pid: number
  } = process
): void {
  child.on("error", () => {
    runtime.exit(1)
  })
  child.on("exit", (code, signal) => {
    const result = applyChildExit(code, signal)
    if (result.action === "signal") {
      runtime.kill(runtime.pid, result.signal)
      return
    }
    runtime.exit(result.code)
  })
}

if (isDirectCliExecution(import.meta.url, process.argv[1])) {
  try {
    const child = spawnProductionE2ECommand(process.argv.slice(2))
    forwardChildCompletion(child)
  } catch {
    process.exit(1)
  }
}
