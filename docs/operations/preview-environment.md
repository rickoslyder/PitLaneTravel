# Preview and CI environments

This document is the PLT-003 isolation contract. It is not production
verification. Opening a pull request still deploys a separate Vercel Preview;
that status is not this workflow.

## Three environments

| Environment | Purpose | Credentials | Database | Outbound |
|---|---|---|---|---|
| **Local test** | Developer `npm run check` / optional local build | Developer-owned stubs from `.env.test.example` copied locally. Never production. | Local or disposable only | Flags off. No provider sends. |
| **GitHub Actions PR CI** | Locked install, type-check, Vitest, disposable-DB build, production-dep audit artifact | Hard-coded synthetic sentinels in `.github/workflows/ci.yml`. No repository or organization secret contexts. No `environment:` blocks. | Job-scoped `postgres:16` service, database `pitlane_ci` only | Flags off. Stubs only. No email, payments, or supplier calls are part of CI. |
| **Vercel Preview** | Hosted preview of the PR | Preview-scoped non-production provider credentials configured only in Vercel, if/when added later. Never Production-scoped values. | Non-production Preview database only | Flags off until a later owner decision. Not a production check. |

## Isolation rules

- **Clerk** — CI uses syntactically test-shaped invalid keys (`pk_test_…`, `sk_test_…`, `whsec_…`). Local test uses the same class of stubs. Vercel Preview may later use a dedicated Clerk development/preview instance. Production Clerk keys stay in Production.
- **Postgres** — CI may run `npm run db:migrate:all` against the disposable `pitlane_ci` service only. That is fixture setup, not permission to touch a shared or production database. Local migrations remain ask-first (`AGENTS.md`).
- **Resend** — CI value is `re_ci_invalid`. No send is part of this workflow.
- **PostHog** — CI host is `https://posthog.invalid`. Analytics in CI is a stub.
- **Stripe / suppliers (Duffel, Google Maps, Gemini, Mapbox, Visual Crossing)** — CI uses `.invalid` hosts or `*_ci_invalid` tokens. Payment links and `HOTEL_AFFILIATE_ID` are blank. Vercel Preview may later use test-mode / sandbox credentials, never live money-moving keys.
- **Supabase** — CI uses `https://ci.invalid` and project id `ci-invalid`. Do not copy a real project id into CI.
- **Cron** — CI `CRON_SECRET` is a stub. Cron routes are not invoked by this workflow.
- **Flags** — `FLIGHTS_BOOKING_ENABLED`, `RECONCILE_AUTO_REFUND`, and `AI_PLANNER_PRO_GATE` are `false` in CI. Fee variables are `0`. Same default-off contract as Day-70.

GitHub Actions is stub/disposable and secret-free. Vercel Preview is allowed to use Preview-scoped non-production credentials configured only in Vercel. Production values must not appear in pull-request jobs.

## Current limitations

- `.github/workflows/ci.yml` is the first repository CI. It did not exist before PLT-003.
- Import-time env validation remains in source (`db/db.ts`, `lib/resend.ts`, `lib/google-places.ts`, Clerk webhook). PLT-004 owns source-only / lazy env behavior. A green type-check is not a source-only production build.
- `npm run build` in CI provisions disposable Postgres and synthetic stubs so page-data collection has a chance to run. Compile-only is still not a green production build. Live GitHub Actions is required to prove the build job.
- Vercel Preview checks are a separate GitHub status. Passing or failing Vercel does not prove this workflow, and passing this workflow does not prove Preview or Production.
- No preview, CI job, or local `check` is production verification.
- `npm audit --omit=dev` is expected to report the known nonzero baseline. PLT-005 owns remediation. The audit job must upload findings and must not fail solely because that baseline is nonzero.

## Verification procedure

Run this against a GitHub Actions run of `CI` on a pull request targeting `main` or a push to `main`. Do not paste secret or env values into notes.

1. Open the workflow run. Confirm the workflow name is `CI` and the jobs are `quality`, `build`, and `dependency-audit`.
2. Confirm `quality` ran `npm ci` and `npm run check` (type-check + Vitest).
3. Confirm `build` used a `postgres:16` service, applied `npm run db:migrate:all` to `pitlane_ci` only, then ran `npm run build`.
4. Open the `build` step **Prove synthetic sentinels and no secret context**. Confirm it printed variable names and `sentinel checks passed=N` only. If any value appears, treat the run as a contract failure.
5. Confirm that step listed the expected names (`DATABASE_URL`, Clerk publishable/secret/webhook, `RESEND_API_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, and the three flags) as `ok`.
6. Download the `dependency-audit` artifact (retention 14 days).
   Official download path: https://docs.github.com/en/actions/tutorials/store-and-share-data
7. Inspect `npm-audit-production.json`: it must parse as JSON and contain `metadata` and `vulnerabilities`. Inspect `npm-audit-status.txt`: `exit_code` and `status` must be present. `status=findings` with valid JSON is an accepted baseline; `missing_or_empty`, `invalid_json`, or `command_failed` is a CI failure.
8. Confirm the run requested no GitHub Environment and no repository/organization secret context. The workflow file must not contain a secret context, `environment:`, or `pull_request_target`. Permissions must be `contents: read` only.
9. Confirm no `.env` file and no Next.js build output were uploaded as artifacts.

## Official sources

- https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions
- https://docs.github.com/en/actions/use-cases-and-examples/using-containerized-services/creating-postgresql-service-containers
- https://docs.github.com/en/actions/tutorials/store-and-share-data
- https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions
