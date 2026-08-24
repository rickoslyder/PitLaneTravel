# PitLane Travel — Day-70 product contract

- **Status:** Canonical active product, commercial, coverage and AI contract
- **Frozen:** 2026-08-24
- **Issue:** PLT-001
- **Doctrine:** Broad catalogue, explicit depth
- **Repository baseline:** `99a5ffb9d28035996c61f95a9dfa316e7b00eed2`

This file is the live business/product contract for Days 1–70.
`SPEC.md` is a historical implementation record of the 2026 revamp, not this contract.
`README.md` is intentionally stale until PLT-002 and is not an authority for live capability.
`MASTER_PLAN.md` and older marketing copy are not authorities for live capability.

Claims below are labelled **live-verified 2026-08-24**, **repository-audited**, or **planned**. Aspirations are never current functionality.

---

## 1. Positioning

> PitLane Travel is the decision layer for self-directed motorsport trips: compare races, choose where to sit, understand the real logistics, build a context-aware plan, then hand off to trusted suppliers.

Brand styling (“PitLane Travel” vs “Pit Lane Travel”) remains unresolved. This contract uses **PitLane Travel**. New product copy follows this file until a later brand issue records a different constant.

### This product is not

- a miniature OTA
- a bespoke travel agency
- a generic AI itinerary generator
- a ticket affiliate directory
- a community platform looking for a use

Booking and affiliate links are monetisation surfaces *after* a decision has been improved. They are not the differentiator.

---

## 2. Primary user and decision journey

**Primary user:** a self-directed motorsport traveller choosing *which* race to attend and assembling the trip themselves. Not a customer buying a regulated package from PitLane. Not a traveller hiring PitLane as agent or concierge.

**Job to be done:** replace a 50-tab research process (calendars, grandstand guides, Reddit, maps, transit, ticket sellers) with one evidence-backed decision path.

**Canonical journey**

1. **Compare races** across the public five-series catalogue using travel-decision dimensions, not calendar metadata alone.
2. **Choose where to sit** from a decision-grade circuit/grandstand guide, or see that the event is calendar-only.
3. **Understand the real logistics** — access, stay areas, transfers, walking/shuttle burden, constraints.
4. **Build a context-aware plan** from origin, dates, party, budget and preferences.
5. **Hand off to trusted suppliers** with honest empty states where no current offer exists.

A bounded engineering/QA slice is allowed. A visibly tiny public catalogue is not. Choosing *which* race is itself a primary decision.

---

## 3. Catalogue: broad public coverage, tiered operational depth

**Governing doctrine: Broad catalogue, explicit depth.**

Keep public catalogue coverage for exactly these five series:

- Formula 1 (F1)
- Formula E
- MotoGP
- IndyCar
- WEC

Do not shrink the public catalogue to one series or a handful of races. Do not add a sixth series in this window.

Every supported event remains discoverable. Depth is a labelled coverage tier, not a hidden subset. A Tier-0 race is acceptable if labelled. A race silently presented as complete while its route fails or its inventory is stale is a trust failure.

Upgrade depth by season timing, search demand, user intent and verified partner availability — not by deleting events.

---

## 4. Coverage tiers 0–4

Tier is a **derived** product contract: a function of stored evidence and freshness, not an unverified admin integer. Missing evidence lowers the tier or renders “unknown.” It never invents facts.

| Tier | Promise | Required evidence | Freshness / SLA expectation |
|---|---|---|---|
| **0 — Calendar** | Correct event, series, dates, circuit, status | Official calendar source; one deterministic date-state function; date-state tests | Volatile. Official calendar snapshot inside SLA (7 days generally; 24 hours around race week / calendar-change windows). Status is derived from dates at render time. A recently-run cron is not a substitute. |
| **1 — Logistics** | Airport / rail / road / access and where-to-stay guidance | ≥1 approved transport or location claim from current primary/local sources; `last_verified` set by a human or a deterministic official-source parse | Seasonal. Stale after 90 days, or 30 days before the next event at that circuit. Expiry downgrades the tier and opens review; it does not invent a replacement. |
| **2 — Decision-grade guide** | Grandstand / GA trade-offs, viewing geometry, atmosphere, accessibility, value | Structured guide, citations, confidence, human QA. First publish at this tier is a human approval. | Stable geometry: 365 days, or immediately if a source snapshot implies rebuild/rename. Seasonal weekend-format and access notes follow the seasonal SLA. Low `source_quality` cannot take a “best” badge unless labelled. |
| **3 — Live offers** | Current ticket / hotel / partner availability | Current-season inventory **or** an explicit empty state; tagged outbound; generic attribution | Volatile. Inventory and “current” prices: 7 days; 24 hours around on-sale / race week. Expired offer data must not render as current availability. Untagged outbound is not monetised. |
| **4 — Personalised plan** | Origin / stay / date / budget-aware itinerary and handoffs | Complete user inputs; only admitted facts in the plan; unresolved unknowns named; tracked handoff | Plan output carries generated/verified timestamps. Factual assertions are traceable to approved claims or marked unknown. Retrieval-empty → refuse, do not improvise. |

These SLAs are the **Day-70 contract**. They are not implemented as of 2026-08-24.

`last_verified` may be set only by a human or a deterministic official-source parse. An LLM extraction does not bump `last_verified`.

---

## 5. Current capability versus Day-70 capability

Do not present the planned column as live. Do not present 2026-07 implementation notes as 2026-08-24 production truth.

### 5.1 Live-verified 2026-08-24

Checked against the public site and sitemap on 2026-08-24 UTC (`decision-history-and-grounded-path-2026-08-24.md` [L]; `days-1-70-platform-plan.md` §17):

- `https://www.pitlanetravel.com` is reachable.
- Home, `/races`, grandstand index, compare, hotels and pricing returned HTTP 200.
- Two sampled current race-detail URLs — the 2026 Italian GP and 2026 Dutch GP — returned **HTTP 500**. These are Gate A blockers.
- The live sitemap returned **179 URLs**, including **136 race routes**, **25 circuit-related routes**, and **5 series routes** (F1, MotoGP, Formula E, IndyCar, WEC).
- Series pages have displayed already-past events as “Upcoming.” Date-state is not trustworthy enough for a decision product.
- The live homepage still publishes unsupported trust and capability claims, including “Join thousands of race fans,” named testimonials (“Sarah L.,” “Mike R.,” “Emma T.”), community-review / VIP / package-browse copy, and a claim that a team constantly updates the database.
- A $10 / $100 pricing page is publicly reachable.

No traffic, conversion, revenue or inventory-freshness figure was live-verified in that audit. None is recorded here as a baseline target.

### 5.2 Repository-audited at `99a5ffb` — not freshly production-verified

Inspected in the repository on 2026-08-24. These are code/schema/seed facts, not a live re-query of production:

- Public data model and seeds cover the five series above. The 2026-07-26 implementation snapshot recorded **113 races**, **67 circuits**, and **145 grandstands across 24 circuits**. Those counts were not re-counted live on 2026-08-24. The live sitemap’s 136 race routes and 25 circuit-related routes are a different measurement (routes, including history) and must not be flattened into one number.
- `FLIGHTS_BOOKING_ENABLED` defaults **off**. `RECONCILE_AUTO_REFUND` defaults **off**. Flight *search* code exists; merchant booking is not a live product.
- The newsletter action validates an address, logs it, and returns a success confirmation without persistence or email handoff (`actions/newsletter-actions.ts`).
- Hotel link building works without `HOTEL_AFFILIATE_ID`, produces untagged URLs, and generates a generic city search rather than a ranked circuit-specific property (`lib/affiliate.ts`).
- Outbound attribution is ticket-redirect specific. There is no generic partner / placement attribution model.
- `aiPlannerProGate` defaults false. A public AI planner route/API still exists and is not retrieval-constrained.
- Stripe subscription / pricing surfaces exist in code. There is no demonstrated gated entitlement that would justify a recurring subscription.
- Community-related surfaces, packages, hotels, compare, budget, transport and trip-planner routes exist as implementation. Existence of a route is not decision-grade coverage and is not a commercial offer.
- A separate **50-guide, ~262k-word** multi-series corpus exists as a stored gbrain asset with sources, confidence and `last_verified` metadata (frontmatter dates in that corpus include 2026-06-15/16). It is broader than the app’s current grandstand surface. Its decision-grade quality and currentness remain unverified until sampled against live primary sources.

Engineering snapshot, also repository-audited 2026-08-24, not a product capability claim: `npm test` 26/26; `npm run type-check` passing; `npm run build` compiles then fails page-data collection when required env values are absent; `npm audit --omit=dev` reported 41 production vulnerabilities (1 critical, 16 high, 17 moderate, 7 low).

### 5.3 Workbench-supplied production audit — not independently re-queried

Recorded in the 2026-08-24 evidence synthesis as [P]. Treat as **repository-audited / workbench-supplied**, not live-verified by a fresh production query in this contract:

- One registered profile, one old trip, 20 lifetime affiliate clicks, no reviews, no waitlist signups.
- Ticket inventory contains 2025 tickets and no 2026 inventory.

This is evidence of no demonstrated demand. It is not evidence that the traveller job is false. It is also not a conversion baseline to hit.

### 5.4 Planned Day-70 capability

By the Day-70 gate, a traveller can:

1. browse every supported series and current event without stale status or broken current-event routes;
2. see what PitLane knows about an event, how deep that coverage is, and when volatile claims were verified;
3. compare races on travel-decision dimensions (affordability band, travel time, ticket state, logistics difficulty, guide confidence, accessibility/burden, freshness) with missing values rendered unknown;
4. choose a race and a grandstand / logistics approach;
5. create a trip brief from origin, dates, party, budget and preferences;
6. receive a source-backed plan whose factual assertions are traceable, or an explicit refusal / unknown;
7. follow contextually relevant, correctly tagged supplier handoffs — or an honest “no current inventory” state;
8. subscribe to a real, permissioned alert or newsletter flow (confirmation sent ≠ subscribed until the token is confirmed);
9. generate measurable funnel and partner-attribution evidence.

The business can answer, including with the answer “none observed”:

- Which acquisition page produced the planning session?
- Which decision step was completed or abandoned?
- Which placement produced each outbound click?
- Which race, supplier and offer class were involved?
- Which content is stale, unsupported or incomplete?
- Which real users found the product useful enough to return, subscribe, click out or pay?

Day-70 does **not** require a sixth series, a community product, merchant flight booking, package-principal operation, a recurring subscription, a custom model, or a B2B API.

---

## 6. Commercial boundary and stop rules

Until the named gates are met, and unless a later owner decision after Gate F records a written hypothesis, displaced priority, acceptance metric and approval:

| Rule | Meaning |
|---|---|
| No sixth series | Catalogue stays F1, Formula E, MotoGP, IndyCar, WEC. |
| No new community / social product | No travel-buddy, meetup, forum, split-payment or community-expansion work. Existing community-related code is not a reason to grow it. |
| No custom model or LoRA | Not without a frozen retrieval+prompting eval that fails on a documented, economically important error *and* does not displace Days 1–70 work. The parked r/GrandPrixTravel corpus is not training data. |
| No merchant-of-record flight booking | `FLIGHTS_BOOKING_ENABLED` stays off. Flight search may remain a planning affordance. Automatic refunds stay off. |
| No package operation as principal | Referral to a bonded operator may be considered after qualified trip intent and verified terms. Operating the package is a different company. |
| No recurring subscription | Not without a genuinely gated repeated-use product. The current $10 / $100 surface is not that product. |
| No generic guide generation | No auto-published “generate a guide for X.” |
| No B2B API / widget | Not before consumer evidence that the operating system for freshness and provenance actually works. |
| No unsupported trust / scale claims | No users, savings, conversions, reviews, staff, VIP, packages, or “constantly updated” copy that cannot be demonstrated. |

**Conditional, after the named gates — not before:**

- Supplier handoffs and affiliate attribution may be *tested* only after the public surface is truthful (Gate A), catalogue/date-state/consent are reliable (Gate B), and generic attribution plus verified partner terms exist (Gate C). Untagged outbound is never labelled monetised.
- A one-time paid guide / personalised decision artifact is a **post-Gate-F demand test**, not Days 1–70 scope. Do not paywall the generic circuit knowledge that earns trust and search. A later test may charge only for a personalised, offline, or itinerary-specific output.

Partner commission, cookie, deep-link and reporting rules remain **unverified** until the current agreement is inspected directly. Code must not infer them.

Vercel (or any host) must be on a commercial-use-compatible plan before tagged monetisation is intentionally operated.

---

## 7. Authority split: agents, code, humans

AI / agents may assist **inside an evidence plane**. They do not own product truth.

| Owner | Owns |
|---|---|
| **Deterministic code** | Date-state; coverage-tier derivation; freshness SLA expiry; fetch / hash / HTTP status; schema validation; citation presence; stand-name allowlists; ranking inputs and ranker scores; affiliate URL construction and sub-ID minting; attribution / click logging; inventory matching and “none current” rendering; publish state machine; authorization and consent; send eligibility; eval hard gates; banned-trust-copy lint. |
| **LLM / agent** | Source discovery followed by direct retrieval; structured extraction into a schema; supplier-blob rewrite; draft section refresh; snapshot-diff review comments; explanations of a code ranking; planner chat over retrieved *approved* cards; source-type classification. |
| **Human** | First publish of decision-grade (Tier 2+) content; stand / layout / price / name changes; raising confidence or coverage; marketing / trust sentences; promoting any draft to canonical; calendar contradictions against the last official snapshot; accepting ambiguous provider matches; activating or changing affiliate partnerships; external email campaigns; enabling payments, booking or automatic refunds; legal / compliance copy; any use of customer data for model training. |

Hard rules:

- Models draft, extract and explain. They do not become the public record without a human or a deterministic verifier that the draft added no facts.
- Models do not decide event status, arithmetic, money movement, or whether an alert threshold fired.
- Planner is retrieval-constrained or silent. Empty retrieval → refuse.
- Ranker is code. Missing fact → null component, not zero.
- Auto-approve is allowed only for (a) HTTP 200 + identical content hash (touch `fetched_at`, do not bump `last_verified`) and (b) time-derived status transitions from the tested date-state function.
- Every model-generated artifact that affects factual content records provider/model, source URLs and retrieval time, prompt/schema/evaluator version, input/output fingerprint, automated checks, and the reviewer / publication decision.

---

## 8. Issue, milestone and sequencing conventions

### Issue IDs

- Stable backlog identity is **`PLT-NNN`** (zero-padded, sequential in the Days 1–70 tracker).
- GitHub issue numbers (`#2`, …) are transport. They are not the product ID. Titles and bodies keep `PLT-NNN`.
- Later issues list `Depends` on earlier `PLT-NNN` IDs. Numeric order is not automatically dependency order.
- One issue, one logical change, independently revertible where possible.

### Milestone gates

Gates are admission control, not calendar labels. A gate closes only when its listed issues are complete (or, where the tracker allows, explicitly partner-blocked).

| Gate | Window | Closes when | Meaning |
|---|---|---|---|
| **A** — baseline truthful and reproducible | Days 1–7 | PLT-001–010, PLT-058, PLT-059 | Green production-equivalent build; known current-event 500s fixed; one future event per series renders a real body; no unsupported public trust claims or fake newsletter success; no live valueless subscription or ungrounded generic planner; advisories triaged; preview and rollback proven. |
| **B** — catalogue reliable and consented | Days 8–14 | PLT-011–017, PLT-056 | Representative route matrix green; event status deterministic; coverage state explicit; analytics requires explicit consent. |
| **C** — monetization and audience plumbing real | Days 15–28 | PLT-018–029, PLT-056, PLT-057 | Every commercial click uses generic attribution; current inventory staged and freshness-labelled *or* the unavailable partner path is explicit; double opt-in email works; one consent/send ledger. Missing partner access is a business blocker, not an engineering completion. |
| **D** — content operating system admitted | Days 29–42 | PLT-032–038 | Guide corpus imported with sources/confidence preserved; agent work reviewable; unsupported claims fail admission; coverage derives from evidence. |
| **E** — decision journey production-ready | Days 43–56 | PLT-039–048 | Compare → brief → plan → contextual handoff works; recommendations are cited or abstain; funnel is measurable. |
| **F** — real evidence obtained | Days 57–70 | PLT-049–055, PLT-060 | Production dogfood of the scenario matrix; 10–20 observed real planning sessions/interviews *or* a documented recruitment failure; partner reports reconcilable; owner chooses the next roadmap from evidence. |

Business-development and recruitment lanes start on Day 1. They do not wait for Gate C or Gate F to discover that a feed, sub-ID or participant pool is unavailable.

### Days are sequence windows

Days 1–70 are **dependency-ordered sequence windows**, not engineering-duration estimates. Implementation may compress elapsed time. **Gates cannot be skipped merely because implementation is fast.** If Days 1–14 finish in three days, start the next *admitted* phase; do not wait for the calendar. Conversely, a phase does not graduate because its nominal dates elapsed.

These remain sequential even when coding is fast:

- no commercial CTA rollout before attribution and verified partner configuration;
- no agent content publication before provenance, review and eval gates;
- no alert sends before consent, inventory snapshots and unsubscribe paths;
- no recommendation UX before admitted content and decision inputs exist;
- no roadmap expansion before production-pilot evidence.

---

## 9. Day-70 acceptance and stop / continue

No traffic, conversion, attach-rate or revenue target is defined. None has been observed. Scenario arithmetic from prior conversations is not a forecast and is not an acceptance number.

### Accept Day-70 only if all of the following are true

1. Gates A–F are closed under the definitions in §8.
2. The nine traveller capabilities and six operational questions in §5.4 can be exercised on production, not only fixtures.
3. Production dogfood of the representative matrix exists (desktop and mobile; anonymous and authenticated; consent accept/reject; no-inventory and live-inventory; at least one event per series; fresh and stale content; successful and failed email/partner paths) with screenshots, console/network state, DB rows, analytics receipts and actual redirect destinations.
4. Real-user evidence is either 10–20 observed planning sessions/interviews with recorded decisions, unanswered questions, external tabs, distrust points and whether they saved / confirmed / clicked / would pay — **or** a written recruitment-failure record (channels and response rate). Synthetic personas do not substitute.
5. Every public factual claim maps to stored evidence or is removed. Every commercial outbound path is tagged and attributed, or explicitly non-commercial.
6. Money-moving features remain off (`FLIGHTS_BOOKING_ENABLED`, automatic refunds, package-principal, recurring subscription).

### Continue / stop after Day-70

Choose at most one next-cycle track from *observed* evidence. No outcome automatically admits a stop-ruled item.

| Observed evidence | Eligible next track |
|---|---|
| Users complete comparisons/plans; handoff conversion is weak | Decision product |
| Contextual supplier clicks and partner-reported conversions appear | Affiliate travel layer |
| Confirmed subscriptions and repeat alert engagement lead | Audience / alerts |
| Users pay, or strongly pull, for a personalised / offline decision artifact | One-time paid artifact (not a generic-guide paywall; not a recurring subscription) |
| Freshness and provenance are operational *and* actual partners express demand | B2B data product may be *considered* — not built on speculation |
| Users still prefer existing sources and do not complete meaningful actions | Pause / reposition |
| Recruitment fails | Distribution evidence; not permission to invent users |

A stopped item from §6 re-enters only with a written hypothesis, named displaced priority, acceptance metric and owner approval after Gate F.

---

## 10. Evidence basis for this freeze

| Id | Source | Role |
|---|---|---|
| Decision history | Out-of-repo workbench artifact: `decision-history-and-grounded-path-2026-08-24.md` | Founder intent, stop rules, live/repo/production caveats |
| Platform plan | Out-of-repo workbench artifact: `days-1-70-platform-plan.md` | Day-70 outcome, gates, AI doctrine, 2026-08-24 engineering snapshot |
| Issue tracker | Out-of-repo workbench artifact: `days-1-70-issue-tracker.md` | `PLT-NNN` graph and Gate A–F close conditions |
| Capabilities | Out-of-repo workbench artifact: `modern-capabilities-layer-2026-08-24.md` | Evidence plane, authority split, volatility SLAs |
| Repo snapshot | `SPEC.md`, `DECISIONS.md` at `99a5ffb` | Historical implementation notes only |

Where those sources disagree on *live* capability, the 2026-08-24 live checks win. Where they disagree on *intent*, Richard’s recorded 2024–2026 decisions win over agent proposals. Where a figure was not freshly production-verified, this contract marks it repository-audited and does not promote it to live.
