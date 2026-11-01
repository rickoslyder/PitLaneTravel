import { abuDhabiGrandPrix2026FanTips } from "./abu-dhabi-grand-prix-2026"
import { qatarGrandPrix2026FanTips } from "./qatar-grand-prix-2026"
import type { FanTipsBox } from "./types"

const FAN_TIPS_BY_RACE_SLUG: Record<string, FanTipsBox> = {
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
  FanTipsBox
} from "./types"
