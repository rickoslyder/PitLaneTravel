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
