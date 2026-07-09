# Pit Lane Travel — Revamp & Multi-Series Expansion Spec

Status: in progress on branch `revamp/multi-series`.
Owner: Richard Bankole. Last updated: 2026-07-09.

This document specs (1) remediation of the security/quality debt found in the Jan-2025
codebase, (2) the architecture to expand from F1-only to a multi-series motorsport travel
hub (F1, Formula E, MotoGP, IndyCar, WEC), and (3) completion of every half-built or
not-yet-started feature. Work is sequenced into phases A–E; each phase is independently
shippable.

---

## 0. Context

The app is a Next.js 15 App Router platform: Clerk auth, Supabase Postgres + Drizzle,
Duffel flights, Stripe (payment-link subscriptions), OpenAI + Gemini, Resend email,
Capacitor/Ionic mobile shell (vestigial). The revenue-critical core (races calendar →
tickets via affiliate redirects → Duffel flights → trips + AI planner → Stripe Pro) is
genuinely built. The marquee differentiators (grandstand guide, hotels, budget,
transport, standalone AI planner, packages, race compare) are polished "Coming Soon"
shells. Content is frozen at the 2025 F1 season.

### Guiding principles

- **Series-agnostic domain, series-specific data.** The schema and routes are already
  close to generic; the F1 coupling is concentrated in the OpenF1 data layer and branding
  copy. Add a first-class `series` dimension; keep provider-specific keys out of core
  tables.
- **Security before features.** The live site has a privilege-escalation hole and IDOR
  surface. These land first (Phase A) regardless of everything else.
- **Manual-entry parity.** Every series must be fully operable through the admin CMS with
  zero live-data-provider dependency. Automated feeds (OpenF1 etc.) are an enhancement,
  never a prerequisite — there is no OpenF1 equivalent for MotoGP/IndyCar/WEC/FE.
- **No fake transactions.** Flight booking must either charge the customer or be an
  affiliate hand-off; it must never silently spend the platform's Duffel balance.

---

## Phase A — Security remediation (blocking)

### A1. Privilege escalation — `toggleAdminAction`
`actions/db/profiles-actions.ts` exports `toggleAdminAction(userId)` with no authz check.
Any authenticated user can POST it and self-promote.
**Fix:** add a server-side `requireAdmin()` guard at the top of the action. The target
`userId` becomes an argument, but the *caller* must be a verified admin (derived from
`auth()`), never the target.

### A2. Systemic IDOR / BOLA
8 action files accept a client-supplied `userId: string` and scope queries by it
(`trips-actions`, `flight-bookings-actions`, `notifications-actions`,
`itineraries-actions`, `saved-itineraries`, `community-actions`, `waitlist-actions`,
`profiles-actions`). A caller can pass someone else's id.
**Fix:** introduce `lib/auth.ts` with:
- `getAuthedUserId(): Promise<string | null>` — wraps Clerk `auth()`.
- `requireAuth(): Promise<string>` — throws/returns error envelope if unauthenticated.
- `requireAdmin(): Promise<{ userId, isAdmin }>` — verifies admin via profile.
- `assertOwnership(resourceUserId, authedUserId)` helper.
Refactor the 8 actions so the authenticated id is derived server-side; where an explicit
`userId` param must remain for admin tooling, gate it behind `requireAdmin()`.

### A3. Unauthenticated cron routes
Only `cron/update-sessions` checks `Bearer ${CRON_SECRET}`. The other four
(`check-waitlist`, `update-weather`, `update-exchange-rates`, `cleanup-notifications`) are
open GETs that write to the DB / call paid APIs / mass-delete.
**Fix:** extract `lib/cron.ts#verifyCronRequest(req)` and apply to all five. Standardise on
`GET` with `Authorization: Bearer` (Vercel Cron sends this). Register the crons in
`vercel.json` (currently `"crons": []`, so none run in prod).

### A4. Unauthenticated AI proxy
`app/api/ai-trip-planner/route.ts` streams `gpt-4o-mini` for anyone, no auth, no rate
limit — a free OpenAI wallet.
**Fix:** require `auth()`, apply `lib/rate-limit.ts` keyed on userId (e.g. 20 msgs/min),
and gate heavier usage behind Pro membership.

### A5. Flight booking spends platform balance
`app/api/flights/book/route.ts` creates Duffel orders with `payments: [{ type: "balance" }]`
and never charges the customer.
**Fix (phase A, minimal):** put booking behind a `FLIGHTS_BOOKING_ENABLED` feature flag,
default off, returning "booking coming soon" so no money leaks. **Full fix (Phase D):**
collect payment via Stripe PaymentIntent (amount = Duffel offer total + configurable service
fee) before creating the Duffel order; store the fee as platform revenue.

### A6. Unauthenticated flight search/seats/airports
Add light rate-limiting (IP-keyed) to `flights/search`, `flights/seats`,
`flights/airports/search` to blunt Duffel-cost abuse and scraping.

**Exit criteria:** every mutating/admin action derives identity server-side; all cron +
AI routes authenticated; no code path spends Duffel balance without payment; `tsc` green.

---

## Phase B — Repo hygiene

### B1. Purge committed data dumps
`git rm` from VCS and `.gitignore`: `36e68b7b…xml` (5 MB), `parsed_tickets_2025-01-07.json`,
`parsed_tickets_test.json`, `public_schema.sql`, `race-mapping-data.json`,
`qatar-2024.md`. Move seed inputs the app genuinely needs into `data/seeds/`.

### B2. Consolidate Next config
Two configs exist. `next.config.js` self-clobbers (`module.exports` assigned twice, losing
the `env` block) and shadows `next.config.mjs`. Merge into a single `next.config.mjs`:
image `remotePatterns` (Supabase host + explicit allowlist, drop the `hostname: "*"`
wildcard), env passthrough, and delete `next.config.js`.

### B3. Logging
Replace ~84 `console.log`s (several logging profile/admin state) with a tiny `lib/log.ts`
level-gated logger; strip query-SQL dumps from `profiles-actions`.

### B4. Duplicate enum
`enums.ts` and `races-schema.ts` both declare a `race_status` pgEnum with *different*
values. Remove the unused `enums.ts` copy (or reconcile) to prevent migration drift.

### B5. Test harness
Add `vitest` + `@testing-library/react`. Seed with tests for: `lib/auth` guards, slug
generation, budget estimator math, series provider registry, and the cron verifier.
Add `test` + `test:watch` scripts and a CI workflow.

### B6. Mobile shell decision
Capacitor/Android is scaffolding only (no plugins imported, `webDir: 'build'` doesn't
exist). Either (a) remove `android/`, `capacitor.config.ts`, `ionic.config.json` and the
`@capacitor/*` deps, or (b) keep and document as "future native shell". Default: **remove**
to cut confusion; can re-add when a real native build is scheduled.

---

## Phase C — Multi-series foundation

### C1. `series` entity (new top-level concept)
The existing `supporting_series` table = support races *within* an F1 weekend (F2/F3) — a
**different** concept; do not overload it. Add:

```
series (
  id uuid pk,
  name text notnull,            -- "Formula 1"
  short_name text notnull,      -- "F1"
  slug text notnull unique,     -- "f1"
  governing_body text,          -- "FIA"
  event_noun text notnull,      -- "Grand Prix" | "ePrix" | "Grand Prix" | "Race" | "Round"
  season_label text,            -- "2026 Formula 1 World Championship"
  logo_url text, accent_color text,
  description text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at, updated_at
)
```

Seed rows: F1, Formula E, MotoGP, IndyCar, WEC.

### C2. `races.seriesId`
Add `series_id uuid references series(id)` to `races`, nullable → backfill all existing
rows to the F1 series → set `notNull`. `(series_id, season, round)` becomes the logical
uniqueness (round is per-series-per-season). `season` stays an integer year;
`isSprintWeekend` stays (F1/MotoGP have sprints).

### C3. Provider keys → external-id join tables
Move F1-provider-specific columns out of core tables so other providers coexist and the
`.unique()` constraints stop being global:

```
race_external_ids (id, race_id fk, provider text, external_key text, kind text,   unique(provider, external_key, kind))
circuit_external_ids (id, circuit_id fk, provider text, external_key text,          unique(provider, external_key))
```

Migrate `races.openf1_meeting_key/openf1_session_key` and
`circuits.openf1_key/openf1_short_name` into these (provider = `openf1`). Keep the old
columns for one release as nullable/deprecated to avoid breaking the OpenF1 mappers, then
drop. `supporting_series.openf1_session_key` similarly.

### C4. Data-provider abstraction
Introduce `services/providers/`:
- `RaceDataProvider` interface: `listEvents(season)`, `getEventStatus(externalKey)`,
  `getSessions(externalKey)`, `getWeather(...)` — all optional/capability-flagged.
- `OpenF1Provider` — wraps the existing `services/openf1/*` (F1 only).
- `ManualProvider` — the universal fallback: data comes from the admin CMS, status is set
  manually or by scheduled time windows. Every non-F1 series uses this initially.
- `providerRegistry` keyed by series slug. Cron `update-sessions`/`update-weather` iterate
  active races and dispatch to the race's series provider; Manual is a no-op.

### C5. Series-aware naming, slugs, breadcrumbs
`races-breadcrumb.tsx` and `app/races/[id]/page.tsx` hardcode `"Grand Prix"` and
`.endsWith("2025")`. Replace with `lib/series.ts#formatEventName(series, race)` and a
season-agnostic slug parser. Slugs become `${circuit-or-event}-${series.slug}-${season}`
for new content (existing F1 slugs preserved via redirects).

### C6. Series-aware UX
- Nav: series switcher (All / F1 / Formula E / MotoGP / IndyCar / WEC).
- `/races`: `?series=` filter facet + series badge on each race card; default = all active.
- Series landing pages `app/[series]/page.tsx` (or `/series/[slug]`) for SEO
  ("F1 travel", "MotoGP tickets", …) — one hub page per series.
- Race map + compare: series filter + don't assume same-series when comparing.

### C7. De-F1 branding & SEO
~144 copy sites across `app/` + `components/` and all SEO metadata
(`layout.tsx`, marketing pages, `races/metadata.ts`, `races/map/metadata.ts`). Move
user-facing strings to `config/brand.ts` (brand name stays "Pit Lane Travel" — it already
works multi-series). Generalise hero/features/FAQ to "motorsport" with series call-outs;
per-series metadata generated from the `series` table.

### C8. Admin CMS
Add a `Series` admin section (CRUD over the new table) and a series selector on the race
create/edit dialogs. Distinguish it in the UI from the existing "Supporting Series".

**Exit criteria:** a new MotoGP round can be created in admin, appears under its series
filter with correct event naming and SEO, sells tickets via the same affiliate flow, and
requires zero OpenF1 wiring.

---

## Phase D — Feature completion

Each stub becomes real, series-agnostic, and monetisable where applicable.

### D1. Grandstand guide (`app/circuits/grandstands`, `app/[series]/…`) — highest SEO value
- New `grandstands` table: `circuit_id fk, name, slug, description, view_rating (1-5),
  covered bool, price_tier, best_for text, pros text[], cons text[], image_url,
  view_of text[] (corners), sun_exposure, big_screen bool`.
- Public circuit guide page listing grandstands with view rating, price tier, pros/cons,
  linked to bookable tickets for that grandstand at upcoming rounds.
- Tie into reviews (filter reviews by grandstand). Admin CRUD.
- Evergreen content → strong organic search ("best grandstand at Silverstone").

### D2. Budget estimator (`app/budget`)
- Real calculator (not "coming soon"): inputs = race, nights, party size, ticket tier,
  travel origin; outputs = ticket (from real ticket pricing) + est. flights (Duffel
  quick-quote or heuristic) + est. hotel (nightly band per city) + transport + spending
  money, in the user's currency via the existing FX table.
- Save to a trip; feeds the trip budget tab. Series-agnostic.

### D3. Transport guide (public) (`app/transport`)
- Surface the existing admin `transport_info` data as a public per-circuit guide
  (getting there, parking, shuttles, public transit, walking routes) instead of a stub.

### D4. Race compare (`app/races/compare`)
- Side-by-side of 2–3 races: circuit stats, weather norms, cheapest ticket, grandstand
  ratings, travel difficulty, best support series. Works across series.

### D5. Standalone AI planner (`app/trips/planner`)
- Promote the working in-trip assistant to a standalone entry point: pick series + race +
  constraints → generates a draft trip (itinerary, ticket suggestion, budget) → save.
  Auth + rate-limited + Pro-gated for heavy use (per A4).

### D6. Packages (`app/packages`)
- Real listing backed by the existing `ticket_packages` schema (ticket + hotel + transport
  bundles) with per-package detail pages and affiliate/enquiry CTA. Remove ComingSoon.

### D7. Hotels (`app/hotels`)
- v1: affiliate/curated model — per-circuit recommended stays with affiliate links
  (booking.com/Expedia) + distance-to-circuit, mirroring the ticket redirect pattern
  (cloaked, click-tracked). Defer live Duffel Stays to a later phase.

### D8. Flights payment (completes A5)
- Stripe PaymentIntent charging offer total + service fee before Duffel order; booking
  confirmation shows the fee. Flip `FLIGHTS_BOOKING_ENABLED` on once done.

### D9. Notifications / community polish
- Wire push (web-push/PWA) or clearly scope to email-only; add review photo upload +
  basic moderation queue (admin). Optional this phase.

---

## Phase E — Data & launch

- **F1 refresh:** ingestion path for the current season calendar (don't ship a site that
  says "2025 season now available" in 2026). Script + admin.
- **Multi-series seeds:** hand-authored current-season calendars for Formula E, MotoGP,
  IndyCar, WEC (round, circuit, date, country) via `data/seeds/*` + an idempotent seed
  script. Tickets per series added as affiliate inventory becomes available (BD task).
- **Redirects:** preserve existing F1 slugs; add `series` landing pages to sitemap.
- **Verify:** `tsc --noEmit` + `next build` green; smoke tests; deploy preview; then point
  `www.pitlanetravel.com` DNS correctly (currently not resolving to Vercel).

---

## Sequencing & status

| Phase | Scope | Status |
|-------|-------|--------|
| A | Security criticals | ✅ done (branch `revamp/multi-series`) |
| B | Repo hygiene | ✅ done |
| C | Multi-series foundation | ✅ done (schema, providers, naming, series filter, landing pages, de-brand of key SEO) |
| D | Feature completion | ✅ done (grandstands, budget, transport, packages, planner, hotels, compare) |
| E | Data + launch | 🔧 in progress — series + sample multi-series seeds authored; migrations not yet run; full de-brand sweep + full calendars + DNS remain |

### Remaining before launch (tracked)
- Run migrations `0003_multi_series.sql`, `0004_grandstands.sql` and
  `scripts/seed-series.ts` + `scripts/seed-sample-calendars.ts` against production.
- Refresh the F1 calendar to the current season (the live homepage still implies 2025).
- Replace sample multi-series dates with verified official calendars; source per-series
  ticket inventory (affiliate BD).
- Finish the branding sweep of the ~130 remaining F1 copy strings in `components/`.
- Full CRUD dialogs for the admin Championships page (currently read view + actions API).
- Build the Stripe-charge flight flow (D8) before enabling `FLIGHTS_BOOKING_ENABLED`.
- Point `www.pitlanetravel.com` DNS at the Vercel deployment (currently not resolving).
- Backfill grandstand content per circuit (the guide is data-driven and currently empty).

Migrations are authored as Drizzle SQL under `db/migrations/`; they are **not** run here
(no production `DATABASE_URL` in this environment) — apply with `npm run db:migrate` after
review. All code changes are validated with `tsc --noEmit` and `next build`.
