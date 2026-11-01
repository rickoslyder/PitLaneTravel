import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { parseClerkAuthorizedParties } from "./clerk-authorized-parties"

describe("parseClerkAuthorizedParties", () => {
  it("returns undefined when unset", () => {
    expect(parseClerkAuthorizedParties(undefined)).toBeUndefined()
  })

  it("returns undefined when empty", () => {
    expect(parseClerkAuthorizedParties("")).toBeUndefined()
    expect(parseClerkAuthorizedParties("   ")).toBeUndefined()
    expect(parseClerkAuthorizedParties(",,,")).toBeUndefined()
    expect(parseClerkAuthorizedParties(" , , ")).toBeUndefined()
  })

  it("returns a single origin", () => {
    expect(
      parseClerkAuthorizedParties("https://www.pitlanetravel.com")
    ).toEqual(["https://www.pitlanetravel.com"])
    expect(
      parseClerkAuthorizedParties("  https://www.pitlanetravel.com  ")
    ).toEqual(["https://www.pitlanetravel.com"])
  })

  it("parses multiple origins and drops spaces and trailing commas", () => {
    expect(
      parseClerkAuthorizedParties(
        " https://www.pitlanetravel.com , https://pitlanetravel.com, "
      )
    ).toEqual(["https://www.pitlanetravel.com", "https://pitlanetravel.com"])
  })
})

describe("middleware authorizedParties wiring", () => {
  const middlewareSource = readFileSync(
    path.join(process.cwd(), "middleware.ts"),
    "utf8"
  )

  it("passes authorizedParties only when the parser returns origins", () => {
    expect(middlewareSource).toMatch(/parseClerkAuthorizedParties\s*\(/)
    expect(middlewareSource).toMatch(/process\.env\.CLERK_AUTHORIZED_PARTIES/)
    expect(middlewareSource).toMatch(
      /\.\.\.\(authorizedParties \? \{ authorizedParties \} : \{\}\)/
    )
    expect(middlewareSource).toMatch(
      /export default clerkMiddleware\s*\([\s\S]*clerkMiddlewareNetworklessOptions\s*\(\s*\)/
    )
    expect(middlewareSource).toMatch(/\/admin\(\.\*\)/)
    expect(middlewareSource).toMatch(/\/trips\(\.\*\)/)
    expect(middlewareSource).toMatch(/\/bookings\(\.\*\)/)
    expect(middlewareSource).toMatch(/\/budget\(\.\*\)/)
    expect(middlewareSource).toMatch(/redirect_url/)
    expect(middlewareSource).not.toMatch(/authorizedParties:\s*\[/)
  })
})
