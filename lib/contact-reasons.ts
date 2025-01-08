export const CONTACT_REASONS = {
  "race-planning": "Race Planning",
  tickets: "Tickets",
  travel: "Travel & Accommodation",
  platform: "Platform Help",
  other: "Other"
} as const

export type ContactReason = keyof typeof CONTACT_REASONS

export function getContactReasonDisplay(reason: ContactReason): string {
  return CONTACT_REASONS[reason]
}
