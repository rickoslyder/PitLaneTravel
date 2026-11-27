import { describe, expect, it } from "vitest"
import {
  hasClerkSessionCookie,
  shouldSkipClerkHandshake
} from "./clerk-public-document"

describe("shouldSkipClerkHandshake", () => {
  it("skips an anonymous document load of a public page", () => {
    expect(
      shouldSkipClerkHandshake({
        method: "GET",
        pathname: "/",
        cookie: null,
        nextAction: null
      })
    ).toBe(true)
    expect(
      shouldSkipClerkHandshake({
        method: "GET",
        pathname: "/races/australian-grand-prix-2027-f1-2027",
        cookie: "",
        nextAction: null
      })
    ).toBe(true)
  })

  it("keeps Clerk on signed-in, mutating, protected, and API requests", () => {
    expect(
      shouldSkipClerkHandshake({
        method: "GET",
        pathname: "/",
        cookie: "__session=abc",
        nextAction: null
      })
    ).toBe(false)
    expect(
      shouldSkipClerkHandshake({
        method: "GET",
        pathname: "/races",
        cookie: "__client_uat=1710000000",
        nextAction: null
      })
    ).toBe(false)
    expect(
      shouldSkipClerkHandshake({
        method: "GET",
        pathname: "/",
        cookie: "__client_uat=0",
        nextAction: null
      })
    ).toBe(true)
    expect(
      shouldSkipClerkHandshake({
        method: "POST",
        pathname: "/",
        cookie: null,
        nextAction: null
      })
    ).toBe(false)
    expect(
      shouldSkipClerkHandshake({
        method: "GET",
        pathname: "/admin",
        cookie: null,
        nextAction: null
      })
    ).toBe(false)
    expect(
      shouldSkipClerkHandshake({
        method: "GET",
        pathname: "/api/health",
        cookie: null,
        nextAction: null
      })
    ).toBe(false)
    expect(
      shouldSkipClerkHandshake({
        method: "GET",
        pathname: "/",
        cookie: null,
        nextAction: "abc"
      })
    ).toBe(false)
  })

  it("treats a suffixed session cookie as signed in", () => {
    expect(hasClerkSessionCookie("__session_dev=token")).toBe(true)
    expect(hasClerkSessionCookie(null)).toBe(false)
  })
})
