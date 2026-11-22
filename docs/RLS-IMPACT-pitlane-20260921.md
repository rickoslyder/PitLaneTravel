# PitLane Travel — RLS impact analysis (2026-09-21)

**Status:** Analysis only. No application behavior change. No SQL applied to
Supabase. No RLS, GRANT, or REVOKE statements from this document should be
executed as part of this PR.

**Project:** PitLane Travel (`vsszkzazjhvlecyryzon`)

**Question:** What would break if the PitLane sections of
`DRAFT-supabase-rls-fixes-20260921.sql` were applied?

**Short answer:** The Next.js app does not query Postgres through PostgREST
`anon` / `authenticated`. Live product reads and writes go through Drizzle on
`DATABASE_URL`, which already bypasses RLS (the same path that keeps the 28
no-policy tables working today). **ENABLE RLS alone on the six P0 tables, and
REVOKE SELECT on the three Stripe foreign tables, should not break any live
UI or API path.** Pairing ENABLE RLS with the draft’s P1 public `SELECT`
policies is *not* required for this app and would reopen PostgREST on tables
that are locked down today.

---

## 1. How this app talks to Supabase

Three channels exist. Only one carries product data.

| Channel | Role / key | Used for | Tables / RPCs |
|---|---|---|---|
| Drizzle + `postgres` (`DATABASE_URL`) | Table-owner / `postgres` (BYPASSRLS) | All live reads/writes | Every product table |
| `@supabase/supabase-js` + `SUPABASE_SERVICE_ROLE_KEY` | `service_role` (PostgREST bypass) | Offline scripts + Storage | `world_plugs` insert; `circuits` select/update in one script; Storage buckets |
| `@supabase/auth-helpers-nextjs` `createClientComponentClient()` | Browser **anon** (if env is set) | Admin circuit image upload only | **Storage only** (`circuit_images`, `circuit_maps`) |

There is no cookie-SSR data client. `createServerActionClient` is imported in
`app/admin/circuits/[id]/_components/upload-actions.ts:3` and never called.
There is no `supabase/functions` directory, no `supabase.rpc(`, no
`.channel(` / Realtime subscription, and no `functions.invoke`.

Identity is Clerk, not Supabase Auth:

```31:34:lib/auth.ts
export async function getAuthedUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId ?? null
}
```

`profiles.user_id` is a Clerk user id (`text`), not `auth.uid()`. Draft P1
owner policies that compare `user_id = (auth.uid())::text` do not match this
app.

### 1.1 Server data path (live product)

```20:21:db/db.ts
function createConnection() {
  const connectionString = requiredServerEnv("DATABASE_URL")
```

The repo treats that connection as the **table owner** and relies on owner
bypass. `db/migrations/0007_circuit_track_map_and_race_history.sql:7-10`:

> RLS: enable on race_history with a public SELECT policy only. No write
> policies and owner bypass left intact, so the table-owner DATABASE_URL
> role can still manage rows while non-owner roles are fail-closed for writes.

`.env.test.example:9` documents the local shape
`postgresql://postgres:postgres@127.0.0.1:5432/pitlane_ci`. Production
`DATABASE_URL` is not printed here; the live proof that it bypasses RLS is
section 5 (28 tables already RLS-on / no-policy, and public catalogue pages
still render their rows).

### 1.2 Supabase JS — service role (scripts only)

| File | Key | Tables | Storage |
|---|---|---|---|
| `scripts/import-world-plugs.ts:7-10,65` | service role | `world_plugs` insert | `assets` |
| `scripts/migrate-track-maps.ts:8-11,49-52,92-95` | service role | `circuits` select + update | `circuit_maps` |
| `scripts/create-storage.ts:4-7` | service role | none | `assets` |
| `scripts/download-plug-images.ts:8-11` | service role | none | `assets` |

Service role bypasses RLS. ENABLE RLS does not break these scripts.

### 1.3 Supabase JS — browser anon (Storage only)

```51:51:app/admin/circuits/[id]/_components/image-upload.tsx
  const supabase = createClientComponentClient()
```

All calls are `supabase.storage.from(bucketName)` (`:99`, `:108`, `:176`,
`:207`). No `.from("<table>")`.

`NEXT_PUBLIC_SUPABASE_ANON_KEY` does not appear anywhere in the repository
(`.env.example` omits it; `.env.test.example:49-51` lists URL + service role
+ project id only). The helper would read that key from the environment at
runtime if Vercel has it. Even then, this path is Storage, not PostgREST
tables.

Public images go through Storage CDN, not PostgREST:

```1:11:supabase-image-loader.js
const projectId = process.env.SUPABASE_PROJECT_ID || "vsszkzazjhvlecyryzon"
export default function supabaseLoader({ src, width, height, quality }) {
  // .../storage/v1/render/image/public/... or /storage/v1/object/public/...
}
```

### 1.4 Historical GRANT surface (why P0 is still an exposure)

`supabase/migrations/20241227154642_remote_schema.sql:1112-1115` grants
`USAGE` on `public` to `anon` and `authenticated`. The same dump
(`:1329-1493`) `GRANT ALL` on the then-existing tables to those roles.
Default privileges (`:1517-1520`) grant ALL on future tables to `anon` /
`authenticated`. Combined with RLS **off**, PostgREST can read and write
every row on the six P0 tables today. Combined with RLS **on** and no
policies (the 28), PostgREST is already locked.

---

## 2. Live schema snapshot (read-only, 2026-09-21)

Confirmed via Supabase `list_tables` + `get_advisors` on
`vsszkzazjhvlecyryzon`. No `execute_sql` / `apply_migration`.

### P0 — RLS disabled (ERROR `rls_disabled_in_public`)

| Table | RLS | Live rows |
|---|---|---|
| `ticket_redirects` | off | 220 |
| `grandstands` | off | 146 |
| `series` | off | 5 |
| `applied_sql_migrations` | off | 4 |
| `circuit_external_ids` | off | 0 |
| `race_external_ids` | off | 0 |

### P0 — Stripe foreign tables (WARN `foreign_table_in_api`)

`stripe_balance`, `stripe_accounts`, `stripe_balance_transactions` are in
the PostgREST schema. Foreign tables do not honor RLS.

### Already RLS-on, no policies (INFO `rls_enabled_no_policy`, 28 tables)

`activities`, `admin_activities`, `circuit_details`, `circuit_locations`,
`circuits`, `currency_rates`, `flight_bookings`, `local_attractions`,
`meetups`, `notifications`, `package_tickets`, `podium_results`, `profiles`,
`race_weather`, `races`, `reviews`, `saved_itineraries`, `supporting_series`,
`ticket_feature_mappings`, `ticket_features`, `ticket_packages`,
`ticket_pricing`, `tickets`, `tips`, `transport_info`, `trips`, `waitlist`,
`world_plugs`.

### Already RLS-on **with** policies (not in the 28)

| Table | Policies in repo |
|---|---|
| `merch` | Public SELECT + authenticated CUD (`supabase/migrations/20250103000000_create_merch_table.sql:28-47`) |
| `race_history` | Public SELECT (`db/migrations/0007_…sql:63-72`; older admin write policies in `supabase/migrations/20250103223802_race_history.sql:28-75`) |

---

## 3. Verdict key

| Verdict | Meaning for *this* repo |
|---|---|
| **Safe** | ENABLE RLS (zero policies) or REVOKE from `anon`/`authenticated` will not break a live Next.js / cron / script path. PostgREST lockdown is intended. |
| **Needs policy first** | Something in this repo selects the object as `anon` or `authenticated`. **No P0 table qualifies.** |
| **Do not touch yet** | Out of P0, or applying the draft’s P1 text would change the security model / reopen PostgREST / mismatch Clerk. |

**Would ENABLE RLS alone (zero policies) break any live path?**

- **PostgREST `anon` / `authenticated`:** yes, those roles would see zero
  rows. The app does not use that path for these tables.
- **Next.js / cron / Drizzle:** no, provided `DATABASE_URL` remains owner /
  BYPASSRLS (already true for the 28).
- **Service-role scripts:** no.

---

## 4. P0 tables — per-table verdicts

### 4.1 `series` — **Safe**

Live: 5 rows, RLS off. Public catalogue depends on this table.

| Caller | Role | Evidence |
|---|---|---|
| `getAllSeriesAction` / `getSeriesBySlugAction` | Drizzle / `DATABASE_URL` | `actions/db/series-actions.ts:26-31,48-51` |
| Race list + series join | Drizzle | `actions/db/races-actions.ts:68-73,112,369-371` |
| Sitemap | Drizzle | `app/sitemap.ts:46-48` |
| Cron session update | Drizzle | `app/api/cron/update-sessions/route.ts:38-41` |
| Coverage admin | Drizzle | `actions/db/coverage-actions.ts:200-205` |
| Seed / calendar scripts | Drizzle | `scripts/seed-series.ts:51`, `scripts/refresh-f1-calendar.ts:39-40` |

No `supabase.from("series")`. Same access pattern as `races` / `circuits`,
which already have RLS on and no policies and still serve the public site
(live: 113 races, 43 circuits).

Draft P1 `catalog_select_anon_authenticated` on `series` is **not required**
for the app. ENABLE RLS with zero policies matches `races`.

### 4.2 `grandstands` — **Safe**

Live: 146 rows, RLS off.

| Caller | Role | Evidence |
|---|---|---|
| Public guide pages | Drizzle | `actions/db/grandstands-actions.ts:24-27,50-52` consumed by `app/circuits/grandstands/page.tsx:4` and `app/circuits/[slug]/grandstands/page.tsx:6` |
| Sitemap | Drizzle | `app/sitemap.ts:65-66` |
| Seed | Drizzle | `scripts/seed-grandstands.ts:53-58` |
| E2E fixture | direct SQL `DATABASE_URL` | `tests/e2e/fixtures.ts:864,903` |

Created without RLS in `db/migrations/0004_grandstands.sql:2-23`. No
PostgREST caller.

### 4.3 `ticket_redirects` — **Safe** (prefer lockdown; do **not** add public SELECT)

Live: 220 rows, RLS off. Columns include `destination_url`, `clicks`,
`last_clicked_at` (`supabase/migrations/20250107051700_add_ticket_redirects.sql:1-12`).

| Caller | Role | Evidence |
|---|---|---|
| Affiliate redirect API | Drizzle | `app/api/redirect/[slug]/route.ts:15-32` (select + increment clicks) |
| Masked-URL server action | Drizzle | `actions/db/ticket-redirect-actions.ts:24-51` |

No browser / PostgREST caller. Today anyone with the anon key can read every
affiliate destination URL via PostgREST. ENABLE RLS with **no** policy closes
that. The draft P1 public SELECT on this table (`DRAFT` lines 121-123) would
put those URLs back on the API. Treat that P1 line as **Do not touch yet**.

### 4.4 `applied_sql_migrations` — **Safe**

Live: 4 rows, RLS off. Not in Drizzle schema. Only used by the migration
runner:

```31:49:scripts/apply-sql-migrations.ts
    await sql`create table if not exists applied_sql_migrations (
      tag text primary key,
      applied_at timestamptz not null default now()
    )`
    // ...
      const [seen] = await sql`select tag from applied_sql_migrations where tag = ${tag}`
      // ...
      await sql`insert into applied_sql_migrations (tag) values (${tag})
```

That script uses `DATABASE_URL` (`scripts/apply-sql-migrations.ts:26-28`).
ENABLE RLS, no policies. Do not add a public SELECT. Optional later (not
P0): move the table out of `public`.

### 4.5 `circuit_external_ids` — **Safe**

Live: 0 rows, RLS off. Declared in `db/schema/external-ids-schema.ts:39-58`
and created in `db/migrations/0003_multi_series.sql:59-68`. **No
`circuitExternalIdsTable` query exists** in `actions/`, `app/`, `services/`,
or `scripts/` (schema + migration + types only). OpenF1 still uses legacy
columns on `circuits` (`services/openf1/circuit-mapper.ts:18,62`).

ENABLE RLS, no policies. Draft P1 public SELECT is unnecessary.

### 4.6 `race_external_ids` — **Safe**

Live: 0 rows, RLS off. Same as above: `db/schema/external-ids-schema.ts:17-37`,
`db/migrations/0003_multi_series.sql:48-57`. **No
`raceExternalIdsTable` query in the app.** OpenF1 uses `races` columns
(`services/openf1/race-mapper.ts:21`).

ENABLE RLS, no policies.

---

## 5. Stripe foreign tables — **Safe** to REVOKE

Draft:

```sql
REVOKE SELECT ON TABLE public.stripe_balance FROM anon, authenticated;
REVOKE SELECT ON TABLE public.stripe_accounts FROM anon, authenticated;
REVOKE SELECT ON TABLE public.stripe_balance_transactions FROM anon, authenticated;
```

Money movement in this repo uses the Stripe Node SDK and
`STRIPE_SECRET_KEY`, not those foreign tables:

```9:10:lib/stripe.ts
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
```

Callers: `actions/stripe-actions.ts:12`, `app/api/stripe/webhooks/route.ts:12`,
`app/api/flights/payment-intent/route.ts:6`,
`app/api/flights/book/route.ts:13`,
`app/api/cron/reconcile-flight-payments/route.ts:2`.

The only repo mention of the foreign tables is generated
`types/database.ts:1003-1092` (from `npm run gen-types`). No
`supabase.from("stripe_*")`, no Drizzle schema, no UI.

`REVOKE` from `anon` / `authenticated` does not affect `service_role` or the
Stripe SDK. **Would not break any UI/API path.**

---

## 6. The 28 no-policy tables — already service/owner-only

These tables already have RLS enabled and **zero** policies. For
`anon` / `authenticated` they are locked today. The public catalogue still
works because Drizzle uses `DATABASE_URL` owner bypass.

That is the existence proof that ENABLE RLS without policies is the live
contract, not a breakage.

| Table | Live rows | App path (all Drizzle / `DATABASE_URL`) | PostgREST today |
|---|---|---|---|
| `circuits` | 43 | `actions/db/circuits-actions.ts:51,73`; `app/api/circuits/route.ts:7`; sitemap `app/sitemap.ts:63` | locked |
| `races` | 113 | `actions/db/races-actions.ts:110`; `app/api/races/route.ts:7`; cron `app/api/cron/update-weather/route.ts:42` | locked |
| `race_weather` | 253 | `actions/db/race-weather-actions.ts:139,170` | locked |
| `currency_rates` | 20 | `actions/db/currency-actions.ts:20,29` | locked |
| `supporting_series` | 0 | `actions/db/supporting-series-actions.ts:36`; `app/api/cron/update-sessions/route.ts:55` | locked |
| `tickets` | 0 | `actions/db/tickets-actions.ts:96,125` | locked |
| `ticket_pricing` | 0 | `actions/db/tickets-actions.ts:241` | locked |
| `ticket_features` | 0 | `actions/db/ticket-features-actions.ts:13` | locked |
| `ticket_feature_mappings` | 0 | `actions/db/tickets-actions.ts:196` | locked |
| `ticket_packages` | 0 | `actions/db/ticket-packages-actions.ts:88` | locked |
| `package_tickets` | 0 | `actions/db/ticket-packages-actions.ts:103` | locked |
| `circuit_details` | 0 | `actions/db/circuits-actions.ts:141` | locked |
| `circuit_locations` | 0 | `actions/db/circuit-locations-actions.ts:36`; `app/admin/circuits/[id]/page.tsx:34` | locked |
| `local_attractions` | 0 | `actions/db/local-attractions-actions.ts:16` | locked |
| `transport_info` | 0 | `actions/db/transport-info-actions.ts:21` | locked |
| `podium_results` | 0 | schema + admin surfaces; no dedicated PostgREST client | locked |
| `world_plugs` | 0 | `actions/db/world-plugs-actions.ts:14`; script insert via **service role** `scripts/import-world-plugs.ts:65` | locked (script bypasses) |
| `profiles` | 0 | Clerk-scoped Drizzle: `actions/db/profiles-actions.ts:31,86`; `lib/auth.ts:54-57`; webhook `app/api/webhooks/clerk/route.ts:74` | locked |
| `trips` | 0 | `actions/db/trips-actions.ts:79`; `app/admin/trips/page.tsx:14` | locked |
| `flight_bookings` | 0 | `actions/db/flight-bookings-actions.ts:136`; `db/queries/flight-bookings.ts:43` | locked |
| `saved_itineraries` | 0 | `actions/db/itineraries-actions.ts:68`; `actions/db/itinerary-actions.ts:49` | locked |
| `activities` | 0 | `actions/db/activities-actions.ts:42` (keyed by `itinerary_id`, no `user_id`) | locked |
| `notifications` | 0 | `actions/db/notifications-actions.ts:41` | locked |
| `reviews` | 0 | `actions/db/community-actions.ts:32,52` | locked |
| `tips` | 0 | `actions/db/community-actions.ts:136,156` | locked |
| `meetups` | 0 | `actions/db/meetups-actions.ts:35`; `app/admin/meetups/page.tsx:31` | locked |
| `waitlist` | 0 | `actions/db/waitlist-actions.ts:38`; cron `app/api/cron/check-waitlist/route.ts:32` | locked |
| `admin_activities` | 0 | `actions/db/admin-activity-actions.ts:34`; `actions/db/activity-actions.ts:34` | locked |

**Is something broken today?** Not for the Next.js app. PostgREST is already
denied. That is lockdown, not a production outage.

**Exception in scripts:** `scripts/migrate-track-maps.ts:49-52,92-95` uses
**service role** PostgREST against `circuits`. Service role bypasses RLS, so
the existing no-policy lockdown does not affect it.

**Do not apply draft P1 `catalog_select_anon_authenticated` or
`owner_all_auth_uid` as part of P0.** Those policies would:

1. Open world-readable PostgREST on catalogue tables the app does not use
   that way.
2. Attach owner checks to `auth.uid()` even though user ids are Clerk
   (`lib/auth.ts:31-33`, `db/schema/profiles-schema.ts:12`).
3. Not be consumed by any current client (there is no Supabase Auth session
   on the data path).

If a later issue wants PostgREST public catalogue reads, that is a product
decision, not a prerequisite for ENABLE RLS.

---

## 7. Tables the P0 draft should not touch

| Object | Verdict | Why |
|---|---|---|
| `merch` | **Do not touch yet** | Already has RLS + policies (`supabase/migrations/20250103000000_create_merch_table.sql:28-47`). App still uses Drizzle (`actions/db/merch-actions.ts:32`; `app/admin/merch/page.tsx:8`). |
| `race_history` | **Do not touch yet** | Already has RLS + public SELECT (`db/migrations/0007_…sql:63-72`). Used via Drizzle (`actions/db/race-history-actions.ts:16`; `app/sitemap.ts:58`). |
| `coverage*` / `ticket_price_observations` | **Do not touch yet** | In Drizzle (`db/schema/coverage-schema.ts`, `ticket-price-observation-schema.ts`) but **absent** from live `list_tables` on this project. Not in the P0 draft. |
| Draft P1 catalog SELECT policies | **Do not touch yet** | Reopens PostgREST; unused by this app. Especially harmful on `ticket_redirects`. |
| Draft P1 `owner_all_auth_uid` | **Do not touch yet** | Clerk vs `auth.uid()` mismatch. `requesting_user_id` exists on the live DB (advisor WARN) but is unused in application TypeScript. |
| `FORCE ROW LEVEL SECURITY` | **Do not touch** | Would apply RLS to the table-owner `DATABASE_URL` role and take down the app. `tests/e2e/sql-migration-0007-contract.spec.ts:64` already forbids FORCE on that migration. |

---

## 8. Recommended apply order (zero / low downtime)

Human approval is still required before any SQL. This is apply-order
guidance only.

**Pre-flight (one read-only check on the Vercel `DATABASE_URL` connection):**
confirm the role is superuser or `BYPASSRLS` / table owner. If it is a
restricted pooler user without bypass, **stop** — ENABLE RLS would then
affect Drizzle. Live behaviour of the 28 tables strongly indicates bypass
is already in place.

1. **Stripe REVOKE** (`anon`, `authenticated` only). No app caller. Cuts
   financial PostgREST exposure immediately.
2. **ENABLE RLS, no policies**, unused / internal first:
   `applied_sql_migrations`, `circuit_external_ids`, `race_external_ids`.
3. **ENABLE RLS, no policies**, live catalogue tables that already match
   the `circuits` / `races` pattern: `series`, `grandstands`,
   `ticket_redirects`.
4. **Do not** add the draft P1 public SELECT or `auth.uid()` owner policies
   in the same window.
5. **Do not** FORCE RLS.
6. Optional hygiene later (not P0): revoke leftover `GRANT ALL` from
   `anon`/`authenticated` on locked tables; pin `search_path` on the six
   WARN functions; decide whether `applied_sql_migrations` belongs in
   `public`.

This is the opposite of pairing ENABLE RLS with public SELECT in one
transaction. For PitLane, ENABLE RLS *is* the lockdown. Policies would be
the reopening.

Rollback if something unexpected hits PostgREST: `ALTER TABLE … DISABLE ROW
LEVEL SECURITY` on the one table, or `GRANT SELECT` restore on a Stripe FT.
Drizzle paths should not need rollback.

---

## 9. Summary matrix

| Object | Draft P0 action | Live rows | App caller role | ENABLE RLS / REVOKE breaks app? | Verdict |
|---|---|---|---|---|---|
| `series` | ENABLE RLS | 5 | Drizzle owner | No | **Safe** |
| `grandstands` | ENABLE RLS | 146 | Drizzle owner | No | **Safe** |
| `ticket_redirects` | ENABLE RLS | 220 | Drizzle owner | No | **Safe** (skip P1 public SELECT) |
| `applied_sql_migrations` | ENABLE RLS | 4 | Script `DATABASE_URL` | No | **Safe** |
| `circuit_external_ids` | ENABLE RLS | 0 | None (schema only) | No | **Safe** |
| `race_external_ids` | ENABLE RLS | 0 | None (schema only) | No | **Safe** |
| `stripe_balance` | REVOKE SELECT | n/a (FT) | None (Stripe SDK) | No | **Safe** |
| `stripe_accounts` | REVOKE SELECT | n/a (FT) | None | No | **Safe** |
| `stripe_balance_transactions` | REVOKE SELECT | n/a (FT) | None | No | **Safe** |
| 28 no-policy tables | (P1 in draft) | see §6 | Drizzle owner (plus one service-role script on `circuits`) | Already locked; app works | **Do not touch yet** (P1 policies) |
| `merch` / `race_history` | not in P0 | 0 | Drizzle owner | n/a | **Do not touch yet** |

**Needs policy first:** none of the P0 objects, given current callers.

---

## 10. What this document is not

- Not approval to run the draft.
- Not a migration, GRANT, or policy change.
- Not a claim about DentistryExplained or other projects in the same draft
  SQL file.
- Not a claim that `npm run build` was run, or that production traffic /
  revenue was measured. Row counts above are from a read-only
  `list_tables` call on 2026-09-21.

*Generated 2026-09-21. Database unchanged.*
