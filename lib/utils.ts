/*
<ai_context>
Contains the utility functions for the app.
</ai_context>
*/

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true
  }).format(date)
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  })
}

export function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric"
  })
}

export function formatDuration(duration: string): string {
  // Parse ISO 8601 duration string (e.g., "PT2H30M")
  const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!matches) return "Duration unknown"

  const hours = parseInt(matches[1] || "0")
  const minutes = parseInt(matches[2] || "0")

  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)

  return parts.join(" ") || "0m"
}

/**
 * Calculate the distance between two points in kilometers using the Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function formatPassengerTitle(title: string): string {
  const titleMap: Record<string, string> = {
    mr: "Mr.",
    mrs: "Mrs.",
    ms: "Ms.",
    miss: "Miss",
    dr: "Dr."
  }
  return titleMap[title.toLowerCase()] || title
}
