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

---

## Refund path when the airline order fails after charging

**Commit before this change:** `41ea1cf`.

Reviewing my own payment flow surfaced a gap: the customer is charged *before*
`duffel.orders.create()`, so any failure there (offer expired between payment and
booking, airline rejects the passenger data, Duffel outage) left them paid-up with no
flight and no refund.

Now the order creation is wrapped:
- Duffel failure → refund the PaymentIntent, return **502** with a message saying the
  payment was refunded.
- Refund *also* fails → log loudly for manual intervention and return **500** telling the
  customer support has been alerted, quoting their payment reference.

Still behind `FLIGHTS_BOOKING_ENABLED` (off), so nothing here is live.

**Known remaining gap (deliberate):** this is not a distributed transaction. If the
process dies between the Stripe charge and the refund call, reconciliation is manual.
A durable job queue or Stripe webhook reconciliation would close it properly — worth
doing before the flag is ever turned on, alongside the client-side Elements step.

---

## Adversarial review of the payment flow — 10 findings, all fixed

**Commit before this change:** `437f703`.

The review workflow largely **failed** (13 of 14 agents hit a session limit), so its
`count: 0` was an artifact, not a clean bill of health. One reviewer — payments —
completed and returned 10 findings. Because its verifiers died, I verified each against
the code myself. All were real. Fixes:

1. **CRITICAL — concurrent double-submit could refund a *successful* booking (free
   flight).** The single-use check was a read-then-act SELECT with a multi-second Duffel
   call before the INSERT, so two parallel requests both passed it; the loser's Duffel
   call failed and my refund block then refunded the payment backing the winner's
   confirmed order. **Fix:** the PaymentIntent is now *reserved* by inserting a `pending`
   booking row **before** calling Duffel. The unique index makes that the concurrency
   guard — the second request loses at the INSERT and never reaches Duffel.
2. **HIGH — post-charge 402/409 rejections kept the money.** Every payment-mismatch and
   expiry branch now refunds before returning.
3. **HIGH — failures *after* a successful order lost the ticket.** `raceId` was unvalidated
   and could throw on INSERT after the flight was already issued. The row now exists
   beforehand, and the post-order path never throws: it returns the booking reference with
   a warning rather than 500-ing away the only record of a paid ticket.
4. **HIGH — 10× undercharge on three-decimal currencies.** BHD/JOD/KWD/OMR/TND are
   1/1000 units; ×100 charged a tenth. Added the exponent **and** a currency allowlist, so
   an unknown currency is refused rather than guessed.
5. **MEDIUM — my "never loses money" claim was wrong.** At a 0% fee the platform pays
   Stripe processing (~1.5–2.9% + fixed) and FX on every booking, so it loses money per
   sale. Corrected here and in SPEC; the fee env vars are now in `.env.example`.
6. **MEDIUM — the flat minimum fee is currency-blind** (a GBP-tuned floor is ~700× off
   against JPY). Documented in the code; prefer the percentage.
7. **MEDIUM — migrations 0003–0006 were not in the drizzle journal**, so `npm run
   db:migrate` would provision a database *without* the payment-reuse index. Added
   `scripts/apply-sql-migrations.ts` (`npm run db:migrate-sql`) which applies them in
   order and records them. **This immediately caught a latent bug:** 0003 created a
   *non-partial* unique index that a fresh DB can no longer build, because cancelled races
   legitimately share a round. 0003 now creates the partial index directly.
8. **LOW** — offer expiry is re-checked before charging through to Duffel.
9. **LOW** — refunds use an idempotency key and treat "already refunded" as success, so a
   retry no longer tells a refunded customer that their refund failed.
10. **LOW** — fee env vars are validated at load and throw a named error instead of
    turning into `NaN` and 500-ing every payment request.

Still behind `FLIGHTS_BOOKING_ENABLED` (off). **The remaining gap is unchanged and
important: this is not a distributed transaction.** If the process dies between the Stripe
charge and the refund, reconciliation is manual. Close that with Stripe webhook
reconciliation before the flag is ever turned on.

---

## Round-2 adversarial review — 20 confirmed findings

**Commit before this batch:** `0be5b64`.

The round-2 review (data / web / payments-recheck) raised 21 findings and confirmed 20.
Everything below was verified against the code before fixing. Highlights:

**Live production bug (fixed):** `getRacesAction` built `IN ()` whenever a filter matched
zero races. Postgres rejects that outright — I reproduced `syntax error at or near ")"`
against the live database — so any such filter 500'd the entire page. Both call sites now
short-circuit on an empty list.

**Security, repo-wide (fixed):** auditing one file revealed the same gap everywhere —
**122 exported Server Actions with no authorization**, including `deleteRaceAction`.
This corrects my earlier Phase A claim: I fixed the client-supplied-`userId` IDOR pattern
but never verified that each action authorises itself. Guarded the 64 mutating/paid-API
actions; left 52 genuinely public reads open; excluded 8 called by crons/scripts where a
guard would break production jobs.

**Four guards were wrong and had to be corrected** — guarding blindly would have broken
the product:
- `generateMaskedUrlAction` must stay **public**: `TicketCard` calls it for anonymous
  visitors, so a guard would have killed every affiliate ticket link — the main revenue path.
- local-attractions actions → `requireAuth`, not admin (they render in the trip planner).
- `getFlightBookingByReferenceAction` → `requireAuth` + owner-scoped, not admin (it backs
  a customer's own confirmation page).

**Seed data integrity (fixed):** the F1/multi-series upsert matched on
`(series, season, round)` with no status filter, so a re-run could overwrite the
**cancelled** Bahrain/Saudi rows — destroying the cancellation records and leaving Miami
rendering as "cancelled due to the 2026 Iran war". `seed-cancelled-races` also created the
very `(0,0)` placeholder circuit it claimed to refuse, because it checked `created` *after*
the insert committed. And the multi-series seed used a private normaliser that ignored
`circuit-aliases.json` — the original cause of the Interlagos/Imola duplicates.

**SEO (fixed):** the five `/series/<slug>` hubs had **zero inbound internal links** (built
for SEO, reachable only via the sitemap) — added a site-wide Championships footer column.
A deactivated championship still served its public page. The series page returned 404 when
the *database call failed*, which deindexes pages during an outage. The sitemap advertised
a history URL for every race when only 23 exist (267 → 179 URLs, all resolving). The
sitemap was also a build-time snapshot; it now revalidates daily.

**Still open, deliberately:** the payment flow remains behind `FLIGHTS_BOOKING_ENABLED`
(off) and still needs Stripe webhook reconciliation for the process-death case. Two
findings about the *fresh-database* provisioning path (enum values and seed ordering) are
untested here because production was migrated incrementally — worth a dry run on a scratch
DB before anyone provisions a new environment.

---

## Flight-payment reconciliation sweep

**Commit before this change:** `b1b408d`.

Closes the gap I had flagged twice and left open: the Stripe charge and the Duffel order
are not one transaction, so if the function dies between reserving the PaymentIntent and
creating the airline order, the booking route's own refund path never runs. The customer
is charged with nothing delivered and no code path recovers it.

`/api/cron/reconcile-flight-payments` (daily, 05:00) sweeps reservations that are still
`pending`, have **no** orderId, and are older than the 15-minute stale window:
- Charged → refund and mark `failed`.
- Never charged (abandoned checkout) → mark `expired` so it stops holding the PaymentIntent.

Safety properties, since this moves money unattended:
- It can only ever touch rows with **no airline order**, so a real ticket is never refunded.
- Stripe is re-read as the source of truth rather than trusting our own row.
- Idempotency key + "already refunded" treated as success, so repeated runs cannot
  double-refund.
- Refund failures are logged loudly and counted rather than swallowed.

**Limitation:** Hobby caps crons at once daily, so worst-case a customer waits ~24h for an
automatic refund. On Pro this should run every 15 minutes. A Stripe webhook on
`payment_intent.succeeded` would tighten it further; the cron is the durable backstop
because webhooks can be missed.

All of this remains behind `FLIGHTS_BOOKING_ENABLED` (off).

---

## Round-3 payment audit — NO-GO, and my own reconciliation cron was the worst finding

**Commit before this batch:** `3c84b0a`.

Four independent attacker lenses. The headline result: **all four independently found that
the reconciliation cron I shipped hours earlier would hand out free flights.**

The cron refunded any reservation that was `pending` with no `orderId`. But the exact crash
it was built for — dying between `duffel.orders.create()` (line ~322) and writing `orderId`
(line ~357) — leaves a **real, paid-for ticket with no orderId recorded**. So the sweep
would refund the customer while the platform had already paid Duffel for a ticket the
customer keeps. My fix for the process-death gap created a free-flight path in precisely
the scenario it existed to handle. **That is three rounds, three self-inflicted money bugs.**

Fixed:
1. **Refunds now require POSITIVE confirmation from Duffel** that no order exists. If a
   ticket is found the row is *repaired* into a confirmed booking instead. If Duffel cannot
   be reached, it refunds **nothing** and flags for manual review — never act on incomplete
   information when the action is irreversible.
2. **A fully refunded PaymentIntent still reports `status: "succeeded"` in Stripe**, so the
   booking route would accept an already-refunded payment and issue a flight for free. Now
   expands `latest_charge` and rejects refunded payments.
3. **`reclaimStaleReservation` was not an atomic claim** — its predicate tested `createdAt`
   while the update only touched `updatedAt`, so two concurrent retries both won; the loser
   would re-order the offer and refund the winner's ticket. Now a genuine compare-and-swap
   on `updatedAt`.

### Verdict: do NOT enable FLIGHTS_BOOKING_ENABLED

Known-outstanding, deliberately not fixed here:
- **The client never creates or sends a PaymentIntent.** `FlightBookingForm` has no Stripe
  Elements step, so flipping the flag today would 402 every booking. The flow is not
  finished — this alone is disqualifying.
- **A charge with no booking row is invisible to reconciliation.** If a customer confirms
  payment and closes the tab before submitting, no row is ever written and nothing refunds
  them. The sweep is DB-row-driven; it needs a Stripe-driven pass over succeeded
  PaymentIntents carrying our metadata.
- Hobby caps crons at daily, so worst-case refund latency is ~24h.

The recurring lesson is not any individual bug: it is that **every round of fixes to this
flow has introduced a new money-losing bug**, including the fix written specifically to
close the previous round's gap. This code should not move real money until an independent
review round comes back clean without my having fixed anything in response.
