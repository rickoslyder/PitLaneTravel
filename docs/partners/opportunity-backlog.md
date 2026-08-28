# Partner opportunity backlog

**Recorded:** 2026-08-27
**Purpose:** preserve researched partner/provider opportunities for later review. This is not an application queue, acceptance claim, current-agreement record, or commercial approval.

## Decision

PitLane should not accumulate generic affiliate programmes. The partner backlog exists to close specific product gaps: authorised race-ticket coverage, premium hospitality, circuit-aware accommodation, race-day transport, and useful post-booking services. Recommendation ranking remains independent of commission.

## Ranked future queue

| Priority | Candidate | Product gap | Why it belongs here | Gate before action |
|---:|---|---|---|---|
| 1 | Ticketmaster Global Affiliate on Impact | Official primary ticket inventory where Ticketmaster is the promoter shop | Existing network, deep links, and Discovery API; useful for selected F1, IndyCar, and other promoter-led events rather than universal coverage.[1] | Find the campaign in Impact, read the current market contract, and verify official-shop status race by race. |
| 2 | Recover Gootickets / Platinium | Second specialist F1 and MotoGP source | Public programme covers motorsport tickets; the same group operates the MotoGP ticket shop. Existing account recovery is preferable to duplicate signup.[2] | Restore the existing account, then read current terms and determine whether a feed/API exists. |
| 3 | Stay22 | Hotels around circuits | Allez supports contextual destination/date links and map embedding; it fits event-led accommodation discovery.[3] | Apply only when circuit/date landing pages are ready; use explicit contextual handoffs, not editorial link rewriting. |
| 4 | Trainline via Partnerize | European rail | Existing network and race-itinerary deep-link fit.[4] | Check campaign availability and current terms; start with links, not transactional API. |
| 5 | Mozio, with Holiday Taxis as an Awin hedge | Global airport/circuit transfer coverage | Fills the global transfer gap left by UK-focused minicabit; Mozio supports partner integrations.[5] | Prefer widget/affiliate handoff; avoid acting as booking agent. |
| 6 | F1 Experiences / Quint reseller-referrer | Official hospitality and ticket+hotel packages | Strong trust rail for premium inventory.[6] | Referral/introducer relationship only; do not imply PitLane is F1-official or become package principal. |
| 7 | Seat Unique via WebGains | Formula E premium/hospitality | Public affiliate path for premium inventory; Formula E is the clearest non-F1 series gap.[7] | Verify current event inventory and terms before any enablement. |
| 8 | Fever distributor relationship for 2027 | Future official F1 ticketing | Fever has a distributor/API platform, but present-day F1 inventory in the generic partner catalogue is not evidenced.[8] | Revisit when 2027 inventory and account-level rights are concrete; no current F1 claim. |
| 9 | Bounce | Race-day luggage storage | Useful for travellers arriving before check-in or leaving after the race. | Verify city/location coverage and destination-link quality at target races. |
| 10 | AirHelp | Post-disruption recovery | Useful only after real flight intent; not a planning differentiator. | Assess claims-firm trust and current terms; disclose clearly. |

## Other-series map

| Series | Viable path | Current posture |
|---|---|---|
| MotoGP | Gootickets/Platinium; MotoGP Premier/Quint outreach | Recover Gootickets first; Quint is outreach-only. |
| Formula E | Seat Unique for premium/hospitality; official shop for unmonetised merch handoff | Seat Unique is the serious future affiliate target. |
| IndyCar / Indy 500 | Ticketmaster where it is the official promoter shop; direct IMS premium/group sales otherwise | Race-by-race official-source verification required. |
| WEC / Le Mans | ACO and round-promoter official shops | No reliable public affiliate found; use clearly labelled unmonetised official handoffs. |
| WSBK / DTM / Superbike | Gootickets or GP Ticket Shop if later eligible | Do not pursue GP Ticket Shop before its traffic gate is met. |
| Australian MotoGP / Australian GP packages | AGPC travel partner / Quint Australia route | Official package outreach, not self-serve affiliate inventory. |

## Existing-account work before new applications

1. Impact: use the verified API and dashboard to inspect existing programmes; separately assess Ticketmaster availability and contracts.
2. Partnerize: exploit the verified P1 campaign API; check Trainline/Ferrari Store availability only after the current P1 integration is understood.
3. Awin: inspect SportsBreaks, F1 Authentics, minicabit, and per-program feed/link capabilities before adding new programmes.
4. Grand Prix Grand Tours: retain as a human quote/portal pathway; no portal automation without explicit terms and authorization.
5. Gootickets: wait for account recovery; do not create a duplicate account reflexively.

## Explicit exclusions / deferrals

- Motorsport Tickets: closed; stale programme pages must not reactivate it.
- DAZN campaign: retired.
- Viator: rejected.
- StubHub, Viagogo, and unverified secondary inventory: exclude on trust and ticket-validity risk.
- Generic “F1 TV” or “Formula 1 5–10%” directories without official programme evidence.
- More merchandise networks as a substitute for ticket/transport coverage.
- Becoming an OTA, package principal, hospitality agent, insurer, lender, or price-guarantee seller.
- Ads, pay-to-rank recommendations, user-data sales, or a hollow recurring membership.

## Owned monetization to preserve

1. **Comparable ticket/hospitality watches:** free, consented alerts first; paid multi-watch/SMS only after reliability and demand are proven.
2. **One-time cited race brief:** willingness-to-pay test after the planning flow; PitLane produces a decision artifact and supplier handoffs, not bookings.
3. **Group-intent introduction:** capture intent only; introduce to bonded operators later with explicit consent.
4. **Creator distribution kit:** design sub-ID attribution, disclosures, and a ranking firewall before outreach.

## Sources

[1] https://developer.ticketmaster.com/partners/distribution-partners/affiliate-sign-up — Ticketmaster affiliate programme
[2] https://www.gootickets.com/en/p-31-affiliate-program — Gootickets affiliate programme
[3] https://dev.stay22.com/docs/allez — Stay22 Allez API
[4] https://www.thetrainline.com/about-us/partnerships/affiliates — Trainline affiliate programme
[5] https://www.mozio.com/business-partners — Mozio business partners
[6] https://f1experiences.com/reseller-program — F1 Experiences reseller programme
[7] https://www.seatunique.com/blog/seat-unique-affiliates-program — Seat Unique affiliates
[8] https://business.feverup.com/en/partner-programs/experience-distribution-platform — Fever distribution programme
