# Hosting plan decision (PLT-056)

- **Status:** HOLD — remain on Vercel Hobby during the build phase
- **Date:** 2026-08-25
- **Issue:** PLT-056 / GitHub #36
- **This issue records:** the owner hold and the commercial activation blocker
- **This issue does not:** perform a paid upgrade, change domains, env vars, production settings, or `vercel.json`

Classes below are labelled **observed** (direct Vercel API readback), **official policy** (Vercel docs), or **repository fact**. Do not collapse them.

## Owner decision

Verbatim (authoritative, 2026-08-25):

> Keep it as Hobby until we're done with building.

This is an explicit HOLD. It is not approval to upgrade to Pro. It is not a claim that commercial operation on Hobby is allowed.

“Done with building” is not an automatically inferable milestone and is not Gate F. Upgrade review reopens only when Richard explicitly declares the build phase complete **and** approves the then-current exact monthly base, seat count, add-ons, spend controls, billing owner, and upgrade action. There is no date trigger.

## Verified current state

**Observed** — direct Vercel team API readback, 2026-08-25. Plan name only; no billing contact, payment instrument, or secrets were recorded.

| Field | Value | Class |
|---|---|---|
| Project ID | `prj_sZwimmtV4tilXJkWxiNUvGRfQx73` | Observed |
| Project name | `pit-lane-travel` | Observed |
| Account / team ID | `team_VEwLT4h3vSdKnitmHWwP2kxv` | Observed |
| `billing.plan` | `hobby` | Observed |

No upgrade was performed. No domain, environment variable, production setting, or `vercel.json` change was performed.

**Official policy** (docs, not an API observation): Hobby is free and restricted to non-commercial personal use only.

https://vercel.com/docs/plans/hobby
https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage

**Repository facts** (not an API observation):

- `vercel.json` has six daily UTC cron entries: `update-sessions` 12:00, `update-weather` 06:00, `update-exchange-rates` 03:00, `check-waitlist` 09:00, `cleanup-notifications` 04:00, `reconcile-flight-payments` 05:00. They were not changed.
- [`production-baseline.md`](production-baseline.md) records `HOTEL_AFFILIATE_ID` absent and money-moving flags off. That metadata does **not** by itself disable every existing outbound ticket route.

## Commercial hold

Until a later explicit owner approval of a commercial-use-compatible host **and** the then-current spend envelope:

- Stay on Hobby. No paid plan change.
- Do not intentionally operate or promote tagged monetized affiliate paths.
- PLT-018 (generic attribution) and PLT-057 (partner verification) may be built and tested with synthetic or untagged/noncommercial proof. They must not be treated as commercially activated while this Hobby hold remains.
- No live money movement.
- Preserve the public catalogue.

The Day-70 contract already requires a commercial-use-compatible host before tagged monetisation is intentionally operated. Remaining on Hobby during the build is a deliberate pause, not permission to operate commercially on Hobby.

## Exact unapproved Pro envelope

Prepared for later review. **Not approved.** No add-ons are approved.

**Official policy** — https://vercel.com/docs/plans/pro-plan

- $20/month platform fee
- one deploying team seat included
- $20/month usage credit
- on-demand usage can occur beyond included allocations and credit
- additional paid owner/member seats are $20/month each

Agents may prepare and read back this envelope. They cannot approve spend.

## Current cron implications

**Official policy** — https://vercel.com/docs/cron-jobs/usage-and-pricing
https://vercel.com/docs/cron-jobs/manage-cron-jobs

| Plan | Jobs | Interval | Precision |
|---|---|---|---|
| Hobby | up to 100 | minimum once/day | per-hour (±59 min) |
| Pro | (see official docs) | once/minute | per-minute |

The six daily expressions are Hobby-compatible. They are **not** exact-minute promises. Do not change them.

Instant Rollback does not update active cron schedules. Do not promise that a later rollback would restore cron timing.

## Activation / review checklist

Reopen only when Richard explicitly:

1. Declares the build phase complete (not inferred from Gate F, a calendar date, or issue close).
2. Approves the then-current exact monthly base.
3. Approves seat count.
4. Approves add-ons (none are approved today).
5. Approves spend controls.
6. Confirms billing owner (Richard).
7. Approves the upgrade action itself.

Until those exist: no paid plan change; no commercial activation of tagged affiliate paths; PLT-018 / PLT-057 remain non-activated.

## Rollback / billing ownership

- **Billing owner:** Richard. Agents prepare and read back only; they cannot approve spend.
- **Rollback now:** N/A — no plan change occurred.
- **If later upgraded:** document then-current Vercel downgrade/rollback caveats from official docs. Instant Rollback does not change cron schedules.

## Verification / readback

This issue records the 2026-08-25 direct settings readback (`billing.plan = hobby`) without contact, payment, or secret material.

Post-change plan/cron readback is required only if an approved upgrade later occurs. None did. Production/preview domains and env vars are unchanged.

## Official sources

- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/plans/pro-plan
- https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage
- https://vercel.com/docs/cron-jobs/usage-and-pricing
- https://vercel.com/docs/cron-jobs/manage-cron-jobs
