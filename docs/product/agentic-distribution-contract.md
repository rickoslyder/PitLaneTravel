# Agentic distribution contract (future adapter)

**Status:** parked. Not Days 1–70 scope. Not a Muse submission. Not a public API.
**Date:** 2026-09-19
**Trigger:** Jeff Weinstein, 2026-09-19, quoting Alexandr Wang — Muse Connector Platform + Stripe agentic payments for sellers ([status 2101197582655537239](https://x.com/jeff_weinstein/status/2101197582655537239)). Official pages: [muse.ai/platform](https://muse.ai/platform), [Stripe agentic commerce for service sellers](https://docs.stripe.com/agentic-commerce/for-sellers/services).

## What this is

A later **distribution adapter** for a PitLane action that already works for a human: search → quote → confirm → pay. Muse/Link is not the product.

Day-70 stop rules still apply until an explicit post-Gate-F owner exception:

- no B2B API / widget before the freshness and provenance operating system works;
- no generic guide generation;
- no merchant-of-record flight booking;
- no unsupported trust/scale claims;
- models draft/extract/explain; they do not become the public record or move money.

## Stolen operating system (keep)

1. **Capability split.** `search` / `explain` ≠ `create_booking` ≠ `pay`. Muse’s “ask before anything consequential” is the same split. Preview never authorizes pay.
2. **Stable IDs and structured errors.** Agents recover (`slot_unavailable`) instead of handing research homework to the traveller.
3. **Human SKU first.** If a person cannot complete a useful, payable result on pitlanetravel.com, a Muse agent must not be offered that result.
4. **Fail-closed public agent API.** Revocable opaque token, exact method/path admission, named scopes, owner binding, honest `readOnlyHint`. Search/read does not imply book or pay.
5. **Payments.** Shared Payment Tokens / Link only against an existing Stripe integration that already works for humans. Do not invent a second processor path.

## Do not steal

- Ticket merchant of record via Muse/Link. Affiliate redirects (P1 or otherwise) are not `POST /bookings`.
- Shipping the current brief/planner as a connector. That exports an internal research backlog.
- Directory placement as a substitute for Gate F, partner terms, or a real SKU.
- Website scraping as the agent interface.

## Admission gates (all required)

A Muse connector or Stripe agentic seller integration may start only when **all** of the following are written and true:

| Gate | Meaning |
|---|---|
| Gate D | PLT-032–038 evidence plane admitted: provenance, review, freshness, coverage from evidence. |
| Human SKU | One decision-useful, source-backed consumer action a traveller can complete without being sent to “investigate”. |
| Charge path | That action is payable by a human on PitLane **or** is an attributed partner book whose current terms explicitly allow this distribution. |
| Partner terms | For any ticket/path that is not PitLane-owned, current agreement is `current-agreement-verified` and commercially approved for agent distribution. Dead P1 feeds do not count. |
| Hosting | Commercial-use-compatible host before tagged monetisation is operated (PLT-056). |
| Owner exception | Written post-Gate-F hypothesis, displaced priority, acceptance metric, and approval that names the exact SKU and lifts “no B2B API” for that SKU only. |

## First API shape (when admitted)

Not implemented now. When admitted, expose only:

- `search_availability` / retrieve approved cards (read, retrieval-constrained, abstain if empty);
- `create_quote` (non-canonical; no money);
- `confirm_booking` (canonical; requires prior quote id + human/agent confirmation reference);
- `pay` (separate; accepts Stripe SPT; never card data).

Cancel/modify only if the SKU actually supports them. Untagged outbound must not be labelled monetised.

## Explicitly out of scope until the gates

- Muse Connector Platform submission or directory listing
- Public MCP or B2B widget
- Stripe Shared Payment Token / Link agent-wallet work
- Recurring jobs that watch Muse
- Expanding catalogue or SEO pages to “feed the connector”

## Acceptance when this later unparks

- Human can complete the named SKU on pitlanetravel.com.
- Agent can complete the same SKU only through the scoped API, with confirmation before pay.
- Search-only tokens cannot pay.
- Failed retrieval refuses; it does not invent inventory or prices.
- Partner/MoR status is unchanged unless a separate owner decision says otherwise.

Until then, the next work is the consumer evidence plane and a useful human SKU — not this adapter.
