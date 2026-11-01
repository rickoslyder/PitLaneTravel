export type SidebarBookingsMode = "rename" | "remove" | "keep"

export const SIDEBAR_BOOKINGS_MODE: SidebarBookingsMode = "rename"

export function bookingsNavItem(
  mode: SidebarBookingsMode = SIDEBAR_BOOKINGS_MODE
): { title: string; url: "/bookings" } | null {
  if (mode === "remove") return null
  if (mode === "keep") return { title: "My Bookings", url: "/bookings" }
  return { title: "Flight history", url: "/bookings" }
}
