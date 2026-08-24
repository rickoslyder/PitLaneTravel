# AGENTS.md

Authoritative repository agent / runbook. A fresh agent should be able to identify
build, test, type-check, migration, and preview commands from this file without
guessing. Product truth is not here.

## Authority order

When documents disagree, use this order:

1. `docs/product/day-70-contract.md` — live product, commercial, coverage, AI, and stop-rule contract.
2. This file (`AGENTS.md`) — commands, verification, migrations, and safety.
3. `DECISIONS.md` — decision log (why a change was made).
4. `SPEC.md` — historical 2026 revamp record, not live capability.
5. `README.md` — human onboarding only.
6. `.cursorrules` — compatibility pointer for Cursor. It must not reintroduce stale template rules.

`MASTER_PLAN.md` and older marketing copy are not authorities for live capability.

## Product / commercial pointer

PitLane Travel is the decision layer for self-directed motorsport trips across
Formula 1, Formula E, MotoGP, IndyCar, and WEC. Booking and affiliate links are
monetisation *after* a decision, not the differentiator.

Do not invent live capability. Current vs planned capability, coverage tiers,
authority split (code / model / human), and stop-rules live only in
`docs/product/day-70-contract.md`. Until that contract's named gates and a later
owner decision say otherwise:

- no sixth series
- no new community / social product
- no custom model or LoRA
- no merchant-of-record flight booking (`FLIGHTS_BOOKING_ENABLED` stays off)
- no automatic refunds (`RECONCILE_AUTO_REFUND` stays off)
- no package operation as principal
- no recurring subscription
- no generic guide generation
- no B2B API / widget
- no unsupported trust, scale, savings, or “constantly updated” claims

Models draft, extract, and explain. They do not become the public record, move
money, decide event status, or send externally without a human or a deterministic
verifier.

## Architecture snapshot

- Next.js App Router in `app/` (API routes under `app/api/`).
- Server actions in `actions/` (`actions/db/` for database actions).
- Shared UI in `components/` (`components/ui` is shadcn; do not edit unless asked).
- Postgres via Supabase. Drizzle schema in `db/schema/`; database access is
  primarily through `actions/db/` and the connection in `db/db.ts`.
- Split migrations in `db/migrations/` — see Migration workflow.
- Seeds and static data in `data/`. Operational scripts in `scripts/`.
- Shared types in `types/`. Product contract in `docs/product/`.
- Auth: Clerk. Payments: Stripe (money-moving flags off). Analytics: PostHog.
  Hosting: Vercel.

Declared ranges in `package.json`: Next.js `^15.5.22`, TypeScript `^5.7.2`,
Vitest `^2.1.9`. There is no `engines` field. Node v22.22.3 was observed during
audit; the repo does not freeze a Node version.

Environment-variable inventory is `.env.example`. Copy to `.env.local` for local
values. Never inline, commit, log, or print real credentials. Some runtime-only
keys used at build/import time (for example `CLERK_WEBHOOK_SECRET`) are not
listed there; do not invent values and do not add keys unless the owning issue
says to.

## Command matrix

There is no `preview` script. Local preview is `npm run dev`, or `npm start`
after a successful `npm run build`. Opening / pushing a PR deploys a Vercel
preview. Repository CI does not exist until PLT-003 — do not claim it does.

### Safe default (local, no data writes)

| Command | What it does |
|---|---|
| `npm ci` | Install from `package-lock.json`. Prefer this over a lockfile-mutating install. |
| `npm run` | List scripts. Does not execute them. |
| `npm run dev` | Next.js dev server (`NODE_OPTIONS='--inspect'`). |
| `npm run type-check` | `tsc --noEmit`. Baseline: passing. |
| `npm test` | `vitest run`. Baseline: 26/26 passing. |
| `npm run test:watch` | Vitest watch. |
| `npm run check` | `type-check` then `test`. Preferred local verification. |
| `npm run lint` | `next lint`. |
| `npm run format:check` | Prettier check. |

### Expensive / env-sensitive

These may compile, hit the network, or fail closed without local env. They are
not production writes, but they are not “source-only green” either.

| Command | What it does |
|---|---|
| `npm run build` | `next build`. Compiles, then fails page-data collection without runtime-only env such as `DATABASE_URL` and `CLERK_WEBHOOK_SECRET`. PLT-004 owns lazy config. Do not claim a source-only build is green. |
| `npm start` | `next start` after a successful build. |
| `npm run analyze` | `ANALYZE=true npm run build` — same env caveat as `build`. |
| `npm run db:test` | Live DB connectivity check. Needs `DATABASE_URL`. |
| `npm run db:schema` | Reads live schema. Needs `DATABASE_URL`. |

### Ask-first writes

Treat every item here as a write. Ask Richard before running. None of these is
safe against production. `db:migrate:all` is a write even on an empty local
database.

| Command | What it does |
|---|---|
| `npm run db:migrate` | `drizzle-kit migrate` — journalled Drizzle migrations only (currently 0000–0002). |
| `npm run db:migrate-sql` | `scripts/apply-sql-migrations.ts` — hand-authored numbered SQL 0003+ , recorded in `applied_sql_migrations`. |
| `npm run db:migrate:all` | Journalled migrate, then SQL 0003+. Required for a fresh database. Always ask-first. |
| `npm run db:generate` | `drizzle-kit generate` — writes new journalled migration files. |
| `npm run db:migrate-data` | Data-migration script. |
| `npm run migrate:track-maps` | Track-map data script. |
| `npm run db:update-timezones` | Circuit timezone data write. |
| seed / import scripts under `scripts/` | Production-shaped data. Ask first; never point at production. |
| `npm run gen-types` | Talks to a live Supabase project and overwrites `types/database.ts`. |
| dependency / lockfile changes | Out of scope unless Richard asks. This issue must not touch `package-lock.json`. |
| `npm run clean` / `lint:fix` / `format:write` | Rewrites source. Do not run as a drive-by. |

### Production-only (owner-operated)

Do not run from an agent session unless Richard names the exact production
action, target, and rollback. Even then, skip anything destructive or
irreversible.

- Changing production env, credentials, or provider configuration.
- Enabling `FLIGHTS_BOOKING_ENABLED`, `RECONCILE_AUTO_REFUND`, live Stripe, or
  any money movement.
- Production seeds, production schema apply, production data mutation.
- External sends (email, alerts, user-facing webhooks, campaigns).

### Forbidden / destructive — outside agent scope

These scripts exist in `package.json` so this issue does not delete them. They
are not developer guidance. Do not run them. Do not document them as normal
setup. Richard's specific approval is required before *anyone* considers them;
even with that approval, destructive or irreversible action remains outside
agent scope.

- `npm run db:drop`
- `npm run db:push`
- `npm run db:rename`
- `npm run supasync`
- `npm run supasync:include-all`
- Direct production data mutation, wipes, hard-deletes, cascade-deletes
- Any command that moves money, refunds, or places a live supplier order

## Change / verification workflow

1. Read the Day-70 contract and this file. Do not follow stale README / SPEC claims.
2. Make the smallest complete change that the issue names. No drive-by edits.
3. If the change touches schema, include a migration (see below). Do not skip
   `db/migrations`.
4. If the change adds an env var, update `.env.example` with an empty / placeholder
   value only.
5. Verify locally with `npm run check`. That is type-check + unit tests.
6. Do not claim `npm run build` is green unless page-data collection actually
   succeeded with the required runtime env. Compile-only is not a green build.
7. Do not change dependencies or `package-lock.json` unless the issue is about
   that and Richard asked.
8. Do not commit, push, open PRs, or send externally unless the task explicitly
   says to.

## Migration workflow

The repository uses a **split** migration path. A fresh database needs both.
Schema work must include a migration. Do **not** tell agents to skip or ignore
`db/migrations`.

1. **Journalled Drizzle** — `db/migrations/meta/_journal.json` currently records
   `0000_nostalgic_mauler`, `0001_silent_the_order`, `0002_youthful_warbird`.
   Apply with `npm run db:migrate` (`drizzle-kit migrate`).
2. **Hand-authored SQL 0003+** — numbered files in `db/migrations/`
   (`0003_multi_series.sql`, `0004_grandstands.sql`, `0005_cancelled_races.sql`,
   `0006_flight_payments.sql`, …). These are additive and written to be
   idempotent. `scripts/apply-sql-migrations.ts` applies any `.sql` whose leading
   tag is `>= 0003` that is not yet in `applied_sql_migrations`, then records the
   tag. Apply with `npm run db:migrate-sql`.
3. **Both** — `npm run db:migrate:all` runs journalled then SQL 0003+.
   Journal-only provision silently omits series tables, grandstands, the
   cancelled-race index, and flight-payment columns.

When changing schema:

- Update `db/schema/` and export it from `db/schema/index.ts` / `db/db.ts` as
  existing code already does.
- Add a migration: either a new journalled Drizzle migration (`db:generate`,
  ask-first) or the next numbered additive/idempotent SQL file for the 0003+
  lane.
- Do not apply either lane until Richard approves the exact target database.
- Never run migrations in a docs-only or instruction-reconciliation task.

`db:push` is not a substitute for a migration.

## Ask-first boundaries

Stop and ask Richard before:

- executing any schema or migration command
- adding, removing, or upgrading dependencies, or editing `package-lock.json`
- writing production data or running seeds against a shared / production database
- changing provider configuration or credentials
- payments, refunds, booking flags, or any money movement
- any external send (email, alerts, user-facing webhooks, campaigns, chat)

Drafting is fine. Execution is gated.

## Rollback and production-proof expectations

- Prefer additive, independently revertible changes. One issue, one logical change.
- Source / type-check / unit-test green is not production-verified and is not deployed.
- A compile that dies in page-data collection is not a green build.
- Schema rollback is an additive inverse migration, not `db:drop` / `db:push`.
- Do not report live capability, traffic, revenue, or inventory freshness unless
  the Day-70 contract already records it or a fresh production check was actually
  performed.
- Destructive rollback remains outside agent scope even if a human could do it.

## Local conventions that do not override the above

- Import app code with `@/`.
- Prefer kebab-case file and folder names matching the existing tree.
- Fetch in server components; mutate through server actions.
- Do not casually rewrite shadcn components under `components/ui`.
