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
