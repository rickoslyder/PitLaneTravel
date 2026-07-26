# Decision log

Running log of non-obvious choices made during the revamp, so they can be reviewed,
reverted or replayed. Newest last. Each entry notes the commit to revert to if you
disagree with the call.

---

## 2026-07-09 — Autonomous session start (restore point)

**Baseline:** `afc235d` on `main` — PR #1 merged, production deployed and verified live
(`www.pitlanetravel.com` 200, cron auth verified 401/401/200).

Remaining work being attempted autonomously, in priority order:
1. Real 2026 calendars for Formula E / MotoGP / IndyCar / WEC.
2. Grandstand guides expanded from Gbrain to remaining circuits.
3. Stripe flight-payment flow (built, **flag left OFF**).
4. Admin Championships CRUD + dead-code cleanup.

### Standing guardrails for this session

- **No fabricated data.** Every calendar date is web-researched and adversarially
  verified before it touches the DB. (Precedent: the F1 2026 "22 vs 24 rounds" episode —
  22 is correct because Bahrain and Saudi were cancelled after the 2026 Iran war.)
- **No enabling of money movement.** The Stripe flight flow will be built and tested,
  but `FLIGHTS_BOOKING_ENABLED` stays **off** in production. Turning it on charges real
  customers and is the owner's call, not mine.
- **DB changes stay additive and idempotent.** Seeds upsert; migrations are guarded.
- **Commit before each major change** so any step can be reverted independently.

---

## Stripe flight-payment flow (D8) — built, flag deliberately OFF

**Commit before this change:** `cc0d65b`.

**What was built**
- `POST /api/flights/payment-intent` — derives the amount from the *live Duffel offer*
  server-side (never the client), creates a Stripe PaymentIntent for offer total +
  service fee, and stamps `userId`/`offerId`/amounts into PI metadata.
- `POST /api/flights/book` — now requires `paymentIntentId` and refuses (402) unless the
  PI is `succeeded`, belongs to this user, matches this offer, matches the currency, and
  `amount_received` covers the *current* offer price. Re-checked against a fresh Duffel
  offer fetch, so a client cannot pay for a cheap offer and book an expensive one.
- Reuse is blocked twice: an explicit lookup plus a unique index on
  `flight_bookings.payment_intent_id` (migration `0006`, applied to prod).
- `config/pricing.ts` — service fee + Stripe minor-unit conversion, including
  zero-decimal currencies (JPY etc., which must NOT be ×100) and float-drift rounding.

**Decisions and why**
1. **`FLIGHTS_BOOKING_ENABLED` stays OFF in production.** The code is complete but
   turning it on charges real customers and places real Duffel orders. That is an
   owner-level commercial decision, and it should not go live without a Stripe test-mode
   run-through. Flip it only after you've tested end-to-end.
2. **Service fee defaults to 0%** (`FLIGHT_SERVICE_FEE_PERCENT` / `_MINIMUM` unset), so
   if the flag were ever flipped without configuring pricing, the customer is charged
   exactly the offer total — the platform earns nothing but never *loses* money. Set the
   env vars to start earning margin.
3. **Fee stored per booking** (`service_fee_amount`, `amount_charged`) rather than being
   recomputed later, so historical revenue stays correct if the fee changes.

**Not done:** the client-side Stripe Elements payment step in `FlightBookingForm`. The
server contract is ready and documented; the UI is only reachable once the flag is on.

---

## Grandstand guides expanded to all 24 circuits

**Commit before this change:** `6cec862`.

Extracted Gbrain's `grandstand-guides/*` for the 18 circuits that had none, via 18
parallel agents each writing its own JSON (kept 1.1M tokens of source out of the main
context). Merged into `data/seeds/grandstands.json` and seeded.

- **145 grandstands across 24 circuits** in production (was 28 across 6), 0 duplicates.
- Every seed circuit name was checked against the DB *before* seeding — an exact-name
  mismatch would have silently skipped a circuit (accented names like
  `Autódromo Hermanos Rodríguez` are the risk).
- Content is transcribed from Gbrain only, never invented — the same rule applied after
  the first hand-authored attempt shipped wrong corner mappings and had to be discarded.

**Note:** migration `0006` (flight payments) did NOT apply on its first run — the helper
script had been cleared from `/tmp`, and the failure was quiet. It was re-run and
verified (3 columns + unique index present). Worth remembering that "the command printed
something" is not evidence a migration landed; the DB was queried to confirm.

---

## Sitemap: static file → Next dynamic route

**Commit before this change:** `8f7543e`.

`public/sitemap.xml` was a committed static file (57 URLs) produced by a script somebody
had to remember to run — it predated every new page, so series hubs, grandstands,
compare, packages, transport and hotels were all invisible to search engines. Worse,
**every URL in it pointed at the apex**, which 308-redirects to `www`, so each entry
cost a redirect hop.

Replaced with `app/sitemap.ts` (Next's native dynamic sitemap), which reads the DB at
build time: **113 URLs, all canonical `www`**, including the 5 series landing pages.
Cancelled races and auth-gated routes (trips/bookings/budget) are excluded.

- Deleted `public/sitemap.xml` (it would shadow the route) and `scripts/generate-sitemap.ts`
  plus its `npm run sitemap` script, so there's one source of truth.
- `robots.txt` now points at the `www` sitemap and allows the new sections.
- The DB query is wrapped in try/catch: a database blip degrades to the static routes
  rather than failing the production build.

---

## Grandstand guides split into per-circuit pages

**Commit before this change:** `3d68f44`.

Expanding to 145 stands made `/circuits/grandstands` render every stand at every circuit
on one page. In production that measured **2.5 MB and ~4 s** — bad for Core Web Vitals on
the page that is supposed to be the site's strongest SEO asset, and worst on the mobile
connections race fans actually use.

Split into:
- `/circuits/grandstands` — light index of 24 circuit cards (stand count + top pick).
  **153 KB, down from 5.1 MB (~33× smaller).**
- `/circuits/[slug]/grandstands` — full guide per circuit, ~205 KB.

This is also the better SEO shape: each circuit gets its own page and title
("Best Grandstands at Silverstone Circuit"), targeting the query people actually
search — "best grandstand at X" — instead of one page competing for all 24.

Circuits have no `slug` column, so routes resolve by slugifying the stored name
(24 rows, matched in memory). If circuits ever get a real slug column, switch to it.
All 24 guide pages are in the sitemap (now 137 URLs).

---

## Real 2026 calendars for Formula E, MotoGP, IndyCar and WEC

**Commit before this change:** `c0c7416`.

Replaced the placeholder multi-series seed with **65 researched, independently
fact-checked races**. Each calendar was researched by one agent and then verified by a
separate skeptical agent against official series sites (schema.org JSON-LD) and Wikipedia.

| Series | Rounds | Confidence |
|---|---|---|
| Formula E | 17 | high |
| MotoGP | 22 | high |
| IndyCar | 18 | high |
| WEC | 8 | medium — rounds 7/8 (Qatar, Bahrain) reported at risk of relocation; the note is stored on the race |

**Decisions and why**

1. **Race `status` is derived from the date at seed time, never stored in the seed file.**
   The verifier caught that my context's "today" (9 July 2026) was wrong — the real date is
   26 July 2026 — which would have shipped a stale status for the Tokyo E-Prix. Deriving
   from the date makes the seed self-correcting and immune to that class of bug.
2. **Statuses backfilled for ALL races** using the same rule as `ManualProvider`. F1's 2025
   and 2026 races were all still `upcoming` — the site would have shown finished races,
   including the whole 2025 season, as upcoming until the daily cron caught up.
   Now: 75 completed, 2 in progress, 34 upcoming, 2 cancelled.
3. **Formula E is seeded under `season = 2026`** even though Season 12 starts in Dec 2025.
   FE seasons straddle calendar years; the season is labelled by the year it ends, which is
   what a traveller browsing "2026" expects. Season 13's Dec 2026 rounds are deliberately
   excluded to avoid round-number collisions — revisit if you want a rolling calendar.
4. **Coordinates come from the Wikipedia coordinates API, not a placeholder.** 44 new
   venues were geocoded (Nominatim managed only 4/44 and was abandoned).

**Two geocoding errors caught before they shipped** — worth knowing the check that found
them. A country bounding-box check passed all 44, but a *distance* check between circuits
revealed two venues sitting 0 km from an unrelated circuit:
- **Phillip Island** had been given Albert Park's coordinates (140 km out, still in Australia
  so the country check missed it).
- **Streets of Arlington** resolved to Arlington *Virginia* instead of Arlington *Texas*.
Both corrected from Wikipedia. Also merged 2 duplicate circuits the seed created
(Interlagos, Imola) and added aliases so a re-run cannot recreate them. Re-running the
seed is now a no-op (0 added, 65 updated).
