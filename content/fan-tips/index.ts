import { formatRaceCalendarDate } from "@/lib/race-datetime"
import { abuDhabiGrandPrix2026FanTips } from "./abu-dhabi-grand-prix-2026"
import { lasVegasGrandPrix2026FanTips } from "./las-vegas-grand-prix-2026"
import { qatarGrandPrix2026FanTips } from "./qatar-grand-prix-2026"
import type { FanTipStatusPart, FanTipsBox } from "./types"

export function fanTipsStatusParts(
  tips: Pick<FanTipsBox, "calendarVerifiedOn" | "statusLine" | "status">
): FanTipStatusPart[] {
  if (tips.status && tips.status.length > 0) return [...tips.status]
  const verifiedOn = formatRaceCalendarDate(tips.calendarVerifiedOn)
  return [
    `On the official F1 calendar as of ${verifiedOn}. ${tips.statusLine ?? ""}`
  ]
}

export function fanTipsStatusText(
  tips: Pick<FanTipsBox, "calendarVerifiedOn" | "statusLine" | "status">
): string {
  return fanTipsStatusParts(tips)
    .map(part => (typeof part === "string" ? part : part.text))
    .join("")
}

const FAN_TIPS_BY_RACE_SLUG: Record<string, FanTipsBox> = {
  [lasVegasGrandPrix2026FanTips.raceSlug]: lasVegasGrandPrix2026FanTips,
  [qatarGrandPrix2026FanTips.raceSlug]: qatarGrandPrix2026FanTips,
  [abuDhabiGrandPrix2026FanTips.raceSlug]: abuDhabiGrandPrix2026FanTips
}

export function fanTipsForRaceSlug(
  slug: string | null | undefined
): FanTipsBox | null {
  if (!slug) return null
  return FAN_TIPS_BY_RACE_SLUG[slug] ?? null
}

export { fanTipSlotHasContent, visibleFanTipSlots } from "./types"
export type {
  FanTipSlot,
  FanTipSlotId,
  FanTipSource,
  FanTipStatusPart,
  FanTipsBox
} from "./types"
