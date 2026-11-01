import { describe, expect, it } from "vitest"
import {
  SIDEBAR_BOOKINGS_MODE,
  bookingsNavItem
} from "@/config/sidebar-bookings"

describe("sidebar bookings item", () => {
  it("defaults to rename", () => {
    expect(SIDEBAR_BOOKINGS_MODE).toBe("rename")
    expect(bookingsNavItem()).toEqual({
      title: "Flight history",
      url: "/bookings"
    })
  })

  it("renames the item to Flight history", () => {
    expect(bookingsNavItem("rename")).toEqual({
      title: "Flight history",
      url: "/bookings"
    })
  })

  it("removes the item", () => {
    expect(bookingsNavItem("remove")).toBeNull()
  })

  it("keeps My Bookings", () => {
    expect(bookingsNavItem("keep")).toEqual({
      title: "My Bookings",
      url: "/bookings"
    })
  })
})
