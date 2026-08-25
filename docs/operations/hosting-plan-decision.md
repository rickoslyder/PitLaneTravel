# Hosting plan decision (PLT-056)

- **Status (operative):** HOLD — remain on the observed Vercel Hobby plan until Richard's explicit go-ahead for a paid plan change. This hold is **only** a paid plan-change / commercial-launch hosting boundary. It is **not** a freeze on developing, merging, previewing, or deploying commercial-capability code.
- **Date:** 2026-08-25
- **Issue:** PLT-056 / GitHub #36
- **This issue records:** the owner hold on a paid Vercel plan change, plus the same-day owner clarification that commercial-feature development is not frozen
- **This issue does not:** perform a paid upgrade, change domains, env vars, production settings, or `vercel.json`

Classes below are labelled **observed** (direct Vercel API readback), **official policy** (Vercel docs), or **repository fact**. Do not collapse them.

## Owner decision (original, 2026-08-25)

Verbatim (recorded 2026-08-25; preserved as history):

> Keep it as Hobby until we're done with building.

This was an explicit HOLD on a paid plan change. It was not approval to upgrade to Pro. It was not a claim that commercial *operation* on Hobby is allowed.

The earlier merged reading treated “done with building” as a required owner declaration that the build phase is complete, **conjoined** with cost / seat / add-on / spend approvals, and treated Hobby as a freeze on commercially activating (and, over-broadly, on developing) commercial features. **That reading is superseded** by the owner clarification below. The original quote is not rewritten.

## Owner clarification (2026-08-25, operative)

Verbatim (authoritative, 2026-08-25):

> Well hold on, we can still develop the commercial features etc - we don't have any users yet so it doesn't matter if they exist, I'm just saying no to Hobby until my go-ahead

Interpreted from context: **remain on the current Hobby plan / say no to a paid Vercel plan change until Richard's explicit go-ahead.** That “no” is a hold on a paid plan change, not a change of the current Hobby plan. The directly observed state is Hobby, and the first decision was to remain there.

“No users yet” is the owner's **present operational context**. It is not a permanent guarantee that zero users can be proven.

The trigger is Richard's **explicit go-ahead**. It does **not** require him first to declare “building complete”. It does **not** require a hidden conjunction of cost / seat / add-on / spend approvals before he can give that go-ahead. At the actual upgrade action, present the then-current cost / scope and obtain explicit approval as required by issue #36; his go-ahead controls *when* to reopen it.

## Verified current state

**Observed** — direct Vercel team API readback, 2026-08-25. Plan name only; no billing contact, payment instrument, or secrets were recorded.

| Field | Value | Class |
|---|---|---|
| Project ID | `prj_sZwimmtV4tilXJkWxiNUvGRfQx73` | Observed |
| Project name | `pit-lane-travel` | Observed |
| Account / team ID | `team_VEwLT4h3vSdKnitmHWwP2kxv` | Observed |
| `billing.plan` | `hobby` | Observed |

No upgrade was performed. No domain, environment variable, production setting, or `vercel.json` change was performed. Plan remains Hobby.

**Official policy** (docs, not an API observation): Hobby is free and restricted to non-commercial personal use only.

https://vercel.com/docs/plans/hobby
https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage

**Repository facts** (not an API observation):

- `vercel.json` has six daily UTC cron entries: `update-sessions` 12:00, `update-weather` 06:00, `update-exchange-rates` 03:00, `check-waitlist` 09:00, `cleanup-notifications` 04:00, `reconcile-flight-payments` 05:00. They were not changed.
- [`production-baseline.md`](production-baseline.md) records `HOTEL_AFFILIATE_ID` absent and money-moving flags off. That metadata does **not** by itself disable every existing outbound ticket route. Do **not** claim affiliate routes are technically disabled. Preserve the public catalogue.

## What this hold is (operative)

The hosting-plan hold is **only** a paid plan-change / commercial-launch hosting boundary. It is not a freeze on developing, merging, previewing, or deploying commercial-capability code while there are no users / no intentional commercial operation.

Hosting does **not** become an excuse to skip PLT-018, PLT-057, or other monetization-enabling implementation.

### A. Allowed now without a Vercel plan change

Develop, merge, preview, production-deploy, and production-dogfood commercial-feature code. Use synthetic / test / sandbox or otherwise non-money-moving proof **where separate provider / product gates require it**. Keep product code ready for future users.

This includes PLT-018 (generic attribution), PLT-057 (partner verification), attribution plumbing, partner schemas, commercial CTA UX, reporting, and other monetization-enabling implementation.

A feature's existence in code or a deployment is **not** by itself treated as commercial launch.

PLT-018 and PLT-057 may be **fully developed**. They are **not** limited to synthetic or untagged / noncommercial proof by this hosting hold. PLT-057's own evidence rules and PLT-018's dependency still apply; hosting does not rewrite those product contracts and does not block implementation.

### B. Still gated by existing separate product / security / provider decisions

Live money movement, real supplier orders, unsupported partner claims / terms, external campaigns / sends, or enabling flags that existing contracts say are owner-operated.

Do **not** attribute these separate gates to Vercel Hobby. They would still apply after a paid plan change.

### C. Paid hosting change

Stay Hobby until Richard's explicit go-ahead. At that point re-read current pricing / plan / seat / add-on / spend details and get explicit approval for the actual upgrade action. No automatic date trigger. No Gate F trigger. No mandatory “build complete” declaration.

### D. Commercial launch / traffic

Before intentionally launching / operating for users and monetization, re-evaluate the then-current Vercel commercial-use requirement and obtain the hosting go-ahead. Do not claim “zero users” can be permanently guaranteed; record it as the owner's present operational context.

The Day-70 contract still requires a commercial-use-compatible host before tagged monetisation is *intentionally operated*. Remaining on Hobby is a deliberate pause on the paid plan change, not a freeze on building commercial capability, and not permission to intentionally operate commercially on Hobby.

## Exact unapproved Pro envelope

Prepared for later review. **Not approved.** No add-ons are approved. Figures below are a 2026-08-25 snapshot of official docs; they **require a fresh readback at go-ahead** before any upgrade action.

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

Reopen the paid plan change only when Richard gives **explicit go-ahead**. That go-ahead is sufficient to reopen review. It is **not** gated on a “build complete” declaration.

At the upgrade action (issue #36), present a **fresh** then-current readback and obtain explicit approval for:

1. The upgrade action itself (Richard's go-ahead controls when).
2. Then-current exact monthly base.
3. Seat count.
4. Add-ons (none are approved today).
5. Spend controls.
6. Billing owner (Richard).

Until go-ahead: no paid plan change. Commercial-feature development, merge, preview, and production deploy are **not** frozen by this hold. PLT-018 / PLT-057 remain implementable; they are not hosting-blocked and are not hosting-limited to synthetic / untagged proof.

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
