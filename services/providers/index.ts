/*
<ai_context>
Provider registry. Resolve a series' RaceDataProvider by its `dataProvider` slug
(series table). Unknown/missing slugs resolve to the manual provider so a new series is
always operable with zero integration work.
</ai_context>
*/

import { ManualProvider } from "./manual-provider"
import { OpenF1Provider } from "./openf1-provider"
import type { RaceDataProvider } from "./types"

const manual = new ManualProvider()
const openf1 = new OpenF1Provider()

const registry: Record<string, RaceDataProvider> = {
  [manual.slug]: manual,
  [openf1.slug]: openf1
}

export function getProvider(slug: string | null | undefined): RaceDataProvider {
  if (slug && registry[slug]) return registry[slug]
  return manual
}

export { ManualProvider, OpenF1Provider }
export type { RaceDataProvider, RaceStatusValue } from "./types"
