# PitLane Travel

Decision layer for self-directed motorsport trips: compare races, choose where
to sit, understand the real logistics, build a context-aware plan, then hand
off to trusted suppliers.

Public catalogue: Formula 1, Formula E, MotoGP, IndyCar, and WEC. Depth is a
labelled coverage tier, not a hidden subset. This is not a miniature OTA, a
travel agency, a generic AI itinerary generator, a ticket directory, or a
community platform.

Live versus planned capability, commercial stop-rules, and the Days 1–70
contract are in `docs/product/day-70-contract.md`. `SPEC.md` is a historical
implementation record. `DECISIONS.md` is the decision log. `AGENTS.md` is the
command and safety runbook. `MASTER_PLAN.md` is not an authority for live
capability.

## Stack

Declared `package.json` ranges, not pinned exact versions:

- Next.js `^15.5.22` (App Router)
- TypeScript `^5.7.2`
- Vitest `^2.1.9`
- PostgreSQL via Supabase, Drizzle ORM
- Clerk, Stripe, PostHog, Vercel

There is no `engines` field. Node v22.22.3 was observed during audit; the
repository does not require a specific Node version.

## Setup

1. Clone the repository.
2. Copy `.env.example` to `.env.local` and fill values locally. That file is
   the environment-variable inventory. Do not commit secrets.
3. Install with `npm ci` (lockfile-faithful). Do not treat a lockfile-mutating
   install as the documented path.
4. `npm run dev` for the local app.

A fresh database needs both journalled Drizzle migrations and hand-authored
SQL 0003+. See `AGENTS.md`. Migration commands are writes and always
ask-first; they are not safe against production.

## Commands

| Command | Purpose |
|---|---|
| `npm ci` | Install from the lockfile |
| `npm run dev` | Local dev server |
| `npm run check` | Type-check, then unit tests |
| `npm run type-check` | `tsc --noEmit` |
| `npm test` | `vitest run` |
| `npm run build` | Production build. Compiles, then needs runtime env such as `DATABASE_URL` and `CLERK_WEBHOOK_SECRET` for page-data collection. A source-only build is not green. PLT-004 owns lazy config. |
| `npm start` | Serve a successful build |
| `npm run db:migrate` | Journalled Drizzle migrations only |
| `npm run db:migrate-sql` | Hand-authored SQL 0003+ |
| `npm run db:migrate:all` | Both, in that order. Write. Ask first. Not production-safe. |

There is no `preview` script. Local preview is `npm run dev`, or `npm start`
after a successful build. Opening or updating a PR deploys a Vercel preview.
Repository CI is absent until PLT-003.

Destructive database scripts remain in `package.json` for this issue but are
not part of normal setup. Do not run them. See `AGENTS.md`.

## Environment

See `.env.example`. Never copy real credentials into docs, commits, or chat.

## Contributing

1. Branch from current `main`.
2. Follow `AGENTS.md` and the Day-70 contract.
3. Run `npm run check` before review.
4. Open a pull request. Vercel preview deploys on push; there is no repository
   CI yet.

Do not add unsupported live capability claims.
