export const FAN_TIP_SLOT_IDS = [
  "getting-out",
  "queues",
  "what-you-can-bring",
  "heat-shade-weather",
  "seat-and-view",
  "what-people-paid",
  "fixed-or-got-worse"
] as const

export type FanTipSlotId = (typeof FAN_TIP_SLOT_IDS)[number]

export type FanTipSource = {
  label: string
  href: string
}

export type FanTipSlot = {
  id: FanTipSlotId
  title: string
  /** Parenthetical edition label, kept beside the slot title. */
  edition?: string
  bullets: string[]
  /** Note that belongs to the slot, such as a rules-can-change line. */
  note?: string
}

export type FanTipsBox = {
  raceSlug: string
  heading: string
  /** ISO date Scout last verified the race on the official calendar. */
  calendarVerifiedOn: string
  /**
   * The status sentence after "On the official F1 calendar as of <date>."
   * The date is formatted at render time from `calendarVerifiedOn`.
   */
  statusLine: string
  leads: string[]
  slots: FanTipSlot[]
  footer: string
  sources: FanTipSource[]
}

export function fanTipSlotHasContent(slot: FanTipSlot): boolean {
  return slot.bullets.some(bullet => bullet.trim().length > 0)
}

/** Empty slots are left out. A title, edition, or note with no bullets is not a slot. */
export function visibleFanTipSlots(slots: readonly FanTipSlot[]): FanTipSlot[] {
  return slots.filter(fanTipSlotHasContent)
}
