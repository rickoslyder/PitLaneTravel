# Partner register (PLT-057)

Operational inventory of PitLane Travel commercial handoffs and supplier pathways.
Not marketing copy. Not a capability claim. Not Gate C closure.

- **Issue:** PLT-057 / GitHub #8 (remains open)
- **Depends on:** PLT-001 / GitHub #2
- **Milestone:** Gate C — **not satisfied**
- **Register date:** 2026-08-27
- **Evidence cut-off / read date:** 2026-08-27
- **Scope:** PitLane commercial handoffs / supplier pathways only. Unrelated personal affiliate memberships are out of scope.

This file may be merged as **fail-closed evidence infrastructure**. It does **not** close GitHub #8, accept PLT-057, or close Gate C.

## Standing rules

1. **Accepted account ≠ product-enabled integration ≠ current terms verified ≠ commercially approved.** Keep the four axes separate.
2. **Absent evidence cannot become a claim.** If a field was not read from a current agreement or dashboard, it is a **blocking unknown**.
3. **Do not invent from industry norms.** No inferred rates, cookie windows, reporting lag, sub-ID semantics, regions, renewal dates, disclosure wording, or technical capabilities.
4. **Historical onboarding is historical.** Welcome/acceptance emails describe then-stated capabilities only.
5. **A contract-change or legal-update notice is notice-only.** Directing the holder to a dashboard is not a current-terms read.
6. **Product code must not claim a rate or attribution capability absent from this register.**
7. **Credentials and confidential payloads stay out of Git.** No login names, publisher/account/affiliate IDs, message IDs, Drive IDs/URLs, exact commission rates, payout thresholds, confidential terms, tracking query strings, redirect slugs, or sensitive partner contacts. Public provider/program names and public root hostnames only when operationally useful.
8. **PLT-056 Hobby hold** is a paid Vercel plan-change / commercial-launch hosting boundary only. It does not freeze this inventory and does not relax these evidence gates.
9. **Evidence cut-off.** Current-state reads in this register are cut off at **2026-08-27**. Later mailbox, vault, dashboard, or production observations are outside this slice unless a later dated entry is added.
10. **Negative search is scoped, not global.** `negative-search` means only the **available Gmail account** and the **available Hermes operator vault** were searched on the evidence cut-off date. Those two sources are not every mailbox, vault, or partner dashboard. Absence there does **not** prove that no account, agreement, or other evidence exists in inaccessible dashboards, other vaults, or other mailboxes. The scoped absence remains a **blocking unknown**, not a global nonexistence claim.

New partner rows use [`partner-template.md`](partner-template.md).

## Status vocabulary

| Axis | Value | Meaning |
|---|---|---|
| Account | `none` | No application or account evidence. |
| Account | `requested` | Application submitted; acceptance not evidenced. |
| Account | `accepted-historical` | Historical acceptance/welcome exists; current account state not re-verified on a dashboard. |
| Account | `supplier-customer` | Supplier/API customer relationship, not an affiliate program. |
| Account | `unverified-candidate` | Marketing or personal contact only. Not a partner. |
| Product | `product-enabled` | See definition below. Fail closed. |
| Product | `not-product-enabled` | No current production attributed commercial handoff to this party. |
| Terms | `unverified` | Current agreement/dashboard not reviewed. |
| Terms | `historical-welcome-only` | Only historical onboarding email capabilities are evidenced. |
| Terms | `notice-only` | A terms/legal-update notice was received; current terms were not in that notice and were not read from the dashboard. |
| Terms | `current-agreement-verified` | Current dashboard **and** current agreement read directly, with verification date. None in this register. |
| Commercial | `not-commercially-approved` | Default. Owner has not recorded activation against verified current terms. |

**Product-enabled** (fail closed): current production presents a live **attributed** commercial handoff to that party, observed in production (same-origin purchase URL that resolves through the partner redirect host to the partner destination).

Not product-enabled:

- a generic **untagged** external handoff (for example an untagged city search);
- a **configured-off** supplier API / merchant pathway;
- an accepted account with **no product integration**;
- historical parser/seed evidence without a current production path.

P1 Travel is the **only** currently verified product-enabled attributed partner path in this evidence set.

## Evidence classes

| Class | Meaning |
|---|---|
| `production-observed` | Direct production browser / bounded GET, 2026-08-27. Hostnames and statuses only. |
| `repository-audited` | Current repository code, schema, flags, or remaining parser. |
| `historical-seed` | Historical ticket URL host at seed commit `213aed…`. Technical integration, not current terms. 2026-07 hygiene gitignored the raw XML dump and deleted a duplicate test JSON; a parsed ticket seed still exists under `data/seeds/` (this register records hostnames only). |
| `historical-onboarding` | Historical acceptance/welcome email. Then-stated capabilities only. Confidential payloads omitted. |
| `current-messaging-not-terms` | Automated account or promotional messaging. Not a current agreement. |
| `notice-only` | Contract-terms-changed or services-agreement update notice. Not a full terms read. |
| `negative-search` | Search of the **available Gmail account** and the **available Hermes operator vault** on the evidence cut-off date found no matching partner evidence. Scoped absence only. Not a global nonexistence claim. Still blocking. |
| `absent` | No evidence of that class exists. |

Verification of current dashboard/agreement is **human review**. This register does not substitute for it.

## Gate and acceptance state (2026-08-27)

| Claim | State |
|---|---|
| PLT-057 accepted | **No.** Enabled partner (P1) lacks a directly verified **current** capability record. |
| Gate C closed | **No.** Missing current partner terms is a business blocker, not engineering completion. |
| GitHub #8 | **Open.** Do not use closing language until P1’s current agreement/dashboard is directly verified **or** the product-enabled attributed path is disabled under a separate approved change. |
| This docs slice | Mergeable as fail-closed inventory. Does not enable, disable, or commercially approve any path. |

**Activation boundary.** Do not product-enable any inventory row, and do not treat the live P1 redirect as terms-verified, until `current-agreement-verified` plus owner sign-off. Disabling the live P1 attributed path is a **separate approved change**, not this issue.

**Next proof required.** Human read of the current P1 agreement and dashboard (or an approved disable of that attributed path). Until then, every current P1 commercial term remains a blocking unknown.

## Summary

| Party | Account | Product | Current terms | Commercial |
|---|---|---|---|---|
| P1 Travel | `none` (no current account evidence in scoped sources) | `product-enabled` | `unverified` | `not-commercially-approved` |
| Gootickets | `accepted-historical` | `not-product-enabled` | `historical-welcome-only` | `not-commercially-approved` |
| F1 Store / Fanatics on Impact | `accepted-historical` | `not-product-enabled` | `historical-welcome-only` | `not-commercially-approved` |
| Omio on Impact | `accepted-historical` | `not-product-enabled` | `notice-only` (plus historical welcome) | `not-commercially-approved` |
| Airalo on Impact | `accepted-historical` | `not-product-enabled` | `notice-only` (plus historical welcome) | `not-commercially-approved` |
| Duffel | `supplier-customer` | `not-product-enabled` | `notice-only` (not an affiliate matrix) | `not-commercially-approved` |
| Booking.com | `none` (no affiliate account evidence in scoped sources) | `not-product-enabled` | `unverified` | `not-commercially-approved` |
| Grand Prix Grand Tours | `unverified-candidate` | `not-product-enabled` | `unverified` | `not-commercially-approved` |

---

## P1 Travel

Live attributed ticket handoff exists. Current agreement, account, and terms do **not**.

| Field | Record | Evidence |
|---|---|---|
| Account / application | **Blocking unknown.** Available Gmail and available Hermes operator vault searches on the 2026-08-27 evidence cut-off found no affiliate acceptance, agreement, dashboard, commission, renewal, or current-contact evidence (public redirect hostname and common affiliate/program names were used as search terms). Newsletters/club messages exist and are not partner evidence. This scoped absence does **not** prove that no P1 account or agreement exists in inaccessible dashboards, other vaults, or other mailboxes. It remains blocking. | `negative-search` 2026-08-27 |
| Product enablement | **`product-enabled`.** Production showed Australian Grand Prix 2025 live ticket cards. Three independent same-origin masked purchase URLs resolved by bounded GET through `p1travel.prf.hn` then `www.p1travel.com`. Hostnames/statuses only; no query strings or tracking IDs retained. Current code creates public masked ticket redirects and can fall back to the reseller URL. Product claims ticket availability/prices; it does **not** state a commission rate. | `production-observed` 2026-08-27; `repository-audited` (`TicketCard`, `/api/redirect/[slug]`, ticket-redirect actions) |
| Offer classes | Production displays ticket cards (availability/prices) for the observed event. **Current authorised offer classes: blocking unknown.** | `production-observed`; terms `unverified` |
| Regions / series | Observed production event: Australian Grand Prix 2025. **Current authorised regions/series: blocking unknown.** Historical seed/parser coverage is not a current authorisation. | `production-observed`; `historical-seed` is not current terms |
| Attribution / sub-ID | Production handoff uses public hostname `p1travel.prf.hn` then `www.p1travel.com`. **Current contractual attribution, sub-ID support, and sub-ID semantics: blocking unknown.** Do not infer a live network agreement from the hostname. | `production-observed`; terms `unverified` |
| Deep-link rules | Observed: same-origin mask → `p1travel.prf.hn` → `www.p1travel.com`. **Current deep-link rules: blocking unknown.** | `production-observed`; terms `unverified` |
| Reporting lag | **Blocking unknown.** | `absent` |
| Commission / cookie terms | **Blocking unknown.** Product does not state a rate. Do not invent one. | `absent`; `repository-audited` (no rate claim in ticket UI path) |
| Feed / API format | Historical parser/import remains at `scripts/parse-p1-tickets.ts`. Historical seed at `213aed…` had 314 ticket URLs, all hosted on `p1travel.prf.hn`. 2026-07 hygiene gitignored the raw XML dump and deleted a duplicate test JSON; a parsed seed still exists under `data/seeds/`. That proves historical technical integration, **not** current feed access or format. **Current feed/API: blocking unknown.** | `repository-audited`; `historical-seed` |
| Disclosure | **Blocking unknown.** | `absent` |
| Contact / renewal | **Blocking unknown.** | `negative-search` 2026-08-27 |
| Last verification | 2026-08-27 evidence cut-off — production browser/bounded GET; scoped available-Gmail and available-Hermes-operator-vault negative search (not a global nonexistence claim); repository audit of redirect/parser. **No current dashboard or agreement review.** | mixed |
| Blockers / next action | **Blocks PLT-057 acceptance and Gate C.** Next: human review of the current P1 agreement and dashboard, **or** a separate approved change that disables this attributed production path. Until one of those, do not claim current rates, cookies, sub-IDs, reporting, disclosure, or authorised inventory. | — |

---

## Gootickets

Inventory only. Not product-enabled.

| Field | Record | Evidence |
|---|---|---|
| Account / application | Affiliate request registered 2024-12-27; accepted / registration confirmed 2024-12-30. Current dashboard/account state **not** re-verified. | `historical-onboarding` |
| Product enablement | **`not-product-enabled`.** No product integration found. | `repository-audited` 2026-08-27 |
| Offer classes | **Historical only:** acceptance email supported broad motorsport/sports offer classes. **Current: blocking unknown.** | `historical-onboarding` |
| Regions / series | **Blocking unknown** (not stated as current; not verified). | `absent` |
| Attribution / sub-ID | **Historical only:** affiliate-tagged URLs. **Current attribution/sub-ID: blocking unknown.** | `historical-onboarding` |
| Deep-link rules | **Historical only:** event-specific deep links. **Current: blocking unknown.** | `historical-onboarding` |
| Reporting lag | **Blocking unknown.** Historical email mentioned dashboard statistics, not lag. | `absent` |
| Commission / cookie terms | **Blocking unknown.** Historical email contained confidential account/commission/payout details; omitted from Git; **not** reused as current terms. | `historical-onboarding` (confidential omitted) |
| Feed / API format | **Blocking unknown.** | `absent` |
| Disclosure | **Blocking unknown.** | `absent` |
| Contact / renewal | **Blocking unknown.** | `absent` |
| Last verification | Historical onboarding 2024-12-27 / 2024-12-30. No current dashboard or agreement reviewed (register date 2026-08-27). | `historical-onboarding` |
| Blockers / next action | Do not product-enable. Current terms are blocking unknowns. Next: current dashboard/agreement review before any integration work. | — |

---

## F1 Store / Fanatics on Impact

Inventory only. Not product-enabled.

| Field | Record | Evidence |
|---|---|---|
| Account / application | Application 2024-12-30; accepted / welcome 2025-01-02. Current dashboard/account state **not** re-verified. | `historical-onboarding` |
| Product enablement | **`not-product-enabled`.** No product integration found. | `repository-audited` 2026-08-27 |
| Offer classes | **Blocking unknown** as current. Historical welcome did not supply a verified current catalogue. | `historical-onboarding`; current `unverified` |
| Regions / series | **Blocking unknown.** | `absent` |
| Attribution / sub-ID | **Historical only:** Impact link building / custom text links. **Current: blocking unknown.** | `historical-onboarding` |
| Deep-link rules | **Blocking unknown** beyond historical Impact text-link building. | `historical-onboarding` |
| Reporting lag | **Blocking unknown.** | `absent` |
| Commission / cookie terms | **Blocking unknown.** No matching Contract Terms Changed email was found in the available Gmail account as of the 2026-08-27 evidence cut-off. That scoped mailbox absence is not a global nonexistence claim. Current automated account messaging through 2026-08-26 reports no traffic/sales; that is **not** a current terms agreement. | `current-messaging-not-terms`; `negative-search` for terms-change mail |
| Feed / API format | **Blocking unknown.** | `absent` |
| Disclosure | **Blocking unknown.** | `absent` |
| Contact / renewal | **Historical only:** program contact mentioned in welcome. **Current contact/renewal: blocking unknown.** | `historical-onboarding` |
| Last verification | Historical welcome 2025-01-02. Automated messaging seen through 2026-08-26 (not terms). No current dashboard/terms reviewed. | mixed |
| Blockers / next action | Do not product-enable. Current terms are blocking unknowns. Next: current Impact dashboard/agreement review before any integration work. | — |

---

## Omio on Impact

Inventory only. Not product-enabled.

| Field | Record | Evidence |
|---|---|---|
| Account / application | Accepted / welcome 2025-01-09. Current dashboard/account state **not** re-verified. | `historical-onboarding` |
| Product enablement | **`not-product-enabled`.** No product integration found. | `repository-audited` 2026-08-27 |
| Offer classes | **Historical only:** train / bus / flight / ferry. **Current: blocking unknown.** | `historical-onboarding` |
| Regions / series | **Historical only:** then-stated Europe / US / Canada reach. **Current: blocking unknown.** | `historical-onboarding` |
| Attribution / sub-ID | **Historical only:** banners / text links and Impact reporting. **Current: blocking unknown.** | `historical-onboarding` |
| Deep-link rules | **Historical only:** deep links to relevant Omio pages; booking widget mentioned historically. **Current: blocking unknown.** | `historical-onboarding` |
| Reporting lag | **Blocking unknown.** Historical welcome mentioned Impact reporting, not lag. | `absent` |
| Commission / cookie terms | **Blocking unknown.** Contract Terms Changed notice received 2026-08-07; body only directs the account holder to the dashboard. Current terms were not in the email. Current promotional messages do not prove current contract capabilities. | `notice-only` 2026-08-07; `current-messaging-not-terms` |
| Feed / API format | **Blocking unknown.** | `absent` |
| Disclosure | **Blocking unknown.** | `absent` |
| Contact / renewal | **Blocking unknown.** | `absent` |
| Last verification | Historical welcome 2025-01-09. Notice-only 2026-08-07. No current dashboard/terms reviewed. | mixed |
| Blockers / next action | Do not product-enable. Current terms are blocking unknowns. Next: read current terms in the Impact dashboard before any integration work. | — |

---

## Airalo on Impact

Inventory only. Not product-enabled. **Do not state any rate.**

| Field | Record | Evidence |
|---|---|---|
| Account / application | Accepted / welcome 2025-01-21. Current dashboard/account state **not** re-verified. | `historical-onboarding` |
| Product enablement | **`not-product-enabled`.** No product integration found. | `repository-audited` 2026-08-27 |
| Offer classes | **Historical only:** eSIM. **Current: blocking unknown.** | `historical-onboarding` |
| Regions / series | **Historical only:** broad global coverage. **Current: blocking unknown.** | `historical-onboarding` |
| Attribution / sub-ID | **Historical only:** unique tracking links / promotional materials and Impact affiliate links. **Current: blocking unknown.** | `historical-onboarding` |
| Deep-link rules | **Blocking unknown** beyond historical unique tracking links. | `historical-onboarding` |
| Reporting lag | **Blocking unknown.** 2026-05-01 notice confirms a reporting method exists; lag and method details were not verified from a current agreement/dashboard. | `notice-only` 2026-05-01 |
| Commission / cookie terms | **Blocking unknown. Do not state any rate.** 2026-05-01 Contract Terms Changed notice confirms rate differentiation by customer status. Exact rates are confidential and are not recorded here. Full current agreement/dashboard was not reviewed. | `notice-only` 2026-05-01 |
| Feed / API format | **Blocking unknown.** | `absent` |
| Disclosure | **Blocking unknown.** | `absent` |
| Contact / renewal | **Blocking unknown.** | `absent` |
| Last verification | Historical welcome 2025-01-21. Notice-only 2026-05-01. No current dashboard/full agreement reviewed. | mixed |
| Blockers / next action | Do not product-enable. Do not publish rates. Next: current dashboard/agreement review before any integration work. | — |

---

## Duffel

Supplier/API customer. Not an affiliate partner. Not an enabled merchant pathway.

| Field | Record | Evidence |
|---|---|---|
| Account / application | `supplier-customer`. Welcome evidence from 2022. Current Services Agreement update notice 2026-03-26. Proves an active supplier/API customer relationship and a current legal notice, **not** an affiliate program and **not** a verified current capability matrix. Detailed legal terms stay out of Git. | `historical-onboarding`; `notice-only` 2026-03-26 |
| Product enablement | **`not-product-enabled`.** `FLIGHTS_BOOKING_ENABLED` is off/absent. Merchant booking is not active. A configured-off supplier API is not an enabled merchant pathway. Flight *search* code existing is not merchant enablement. | `repository-audited`; production baseline (flag absent → false) |
| Offer classes | **Current authorised commercial offer matrix: blocking unknown.** Not treated as an affiliate offer class. | terms not verified as a capability matrix |
| Regions / series | **Blocking unknown** as a current authorised matrix. | `absent` |
| Attribution / sub-ID | Not an affiliate attribution path. **Affiliate sub-ID: not applicable / not claimed.** Merchant booking remains disabled. | `repository-audited` |
| Deep-link rules | **Not applicable** as an affiliate deep-link. Merchant booking disabled. | `repository-audited` |
| Reporting lag | **Blocking unknown** as a current commercial-reporting term. | `absent` |
| Commission / cookie terms | **Not an affiliate program.** Cookie/commission: not claimed. Detailed supplier legal terms stay out of Git. | `notice-only`; confidential omitted |
| Feed / API format | Supplier API relationship exists; **current verified capability matrix: blocking unknown.** Product must not claim booking capability while the flag is off. | `repository-audited`; `notice-only` |
| Disclosure | **Blocking unknown** as current public disclosure copy. | `absent` |
| Contact / renewal | **Blocking unknown** beyond the 2026-03-26 update notice (notice-only). | `notice-only` |
| Last verification | 2022 welcome (historical). 2026-03-26 notice. Repository flag/baseline 2026-08-27. No current capability-matrix review recorded. | mixed |
| Blockers / next action | Do not treat as an affiliate. Do not enable `FLIGHTS_BOOKING_ENABLED` from this register. Owner-operated money-moving gate remains off (separate from PLT-057). | — |

---

## Booking.com

Generic untagged external handoff. Not an enabled affiliate partner.

| Field | Record | Evidence |
|---|---|---|
| Account / application | **`none` in scoped sources.** Available Gmail and available Hermes operator vault searches on the 2026-08-27 evidence cut-off found no Booking.com affiliate/partner account evidence. Personal booking emails are not partner evidence. This does not prove no account exists in inaccessible dashboards, other vaults, or other mailboxes. Still blocking. | `negative-search` 2026-08-27 |
| Product enablement | **`not-product-enabled`.** Production baseline records `HOTEL_AFFILIATE_ID` absent. `/hotels` is a generic untagged Booking.com city search (`www.booking.com`). A generic untagged external handoff is not an enabled affiliate partner. | `repository-audited`; production baseline |
| Offer classes | Product builds a city search URL. **Authorised affiliate offer class: none evidenced.** | `repository-audited` |
| Regions / series | Untagged city search from circuit city/country. **Affiliate-authorised regions: none evidenced.** | `repository-audited` |
| Attribution / sub-ID | No affiliate tag. **Attribution/sub-ID: not present.** Do not claim affiliate attribution. | `repository-audited` |
| Deep-link rules | Generic `www.booking.com` searchresults URL. **Affiliate deep-link rules: not applicable / none evidenced.** | `repository-audited` |
| Reporting lag | **Blocking unknown** (no affiliate account). | `absent` |
| Commission / cookie terms | **Blocking unknown** (no affiliate account). Do not invent. | `absent` |
| Feed / API format | No partner feed. URL builder only (`lib/affiliate.ts`). | `repository-audited` |
| Disclosure | **Blocking unknown.** Untagged outbound must not be labelled monetised (Day-70 contract). | `repository-audited` / product contract |
| Contact / renewal | **Blocking unknown.** No affiliate account evidenced in scoped sources. | `absent` |
| Last verification | 2026-08-27 evidence cut-off — repository + production-baseline (`HOTEL_AFFILIATE_ID` absent); scoped Gmail / Hermes operator vault negative search. | mixed |
| Blockers / next action | Do not claim Booking.com as a partner. Next: none until an actual affiliate account exists and current terms are read. | — |

---

## Grand Prix Grand Tours

Unverified candidate. Not a partner.

| Field | Record | Evidence |
|---|---|---|
| Account / application | **`unverified-candidate`.** Ordinary marketing/personal quote emails from 2024–2025. No partner acceptance, agreement, or dashboard evidence. | `absent` (quotes are not partner evidence) |
| Product enablement | **`not-product-enabled`.** No product integration found. | `repository-audited` 2026-08-27 |
| Offer classes | **Blocking unknown.** Not a partner. | `absent` |
| Regions / series | **Blocking unknown.** Not a partner. | `absent` |
| Attribution / sub-ID | **Blocking unknown.** Not a partner. | `absent` |
| Deep-link rules | **Blocking unknown.** Not a partner. | `absent` |
| Reporting lag | **Blocking unknown.** Not a partner. | `absent` |
| Commission / cookie terms | **Blocking unknown.** Not a partner. | `absent` |
| Feed / API format | **Blocking unknown.** Not a partner. | `absent` |
| Disclosure | **Blocking unknown.** Not a partner. | `absent` |
| Contact / renewal | **Blocking unknown.** Quote emails are not partner contact/renewal evidence. | `absent` |
| Last verification | 2026-08-27 evidence cut-off — no partner evidence in scoped Gmail / Hermes operator vault or repository. Not a global nonexistence claim. | `absent` |
| Blockers / next action | Do not list as a partner. Do not product-enable. Requires actual acceptance/agreement/dashboard before any row upgrade. | — |

---

## Product-code constraint

Until a row is `current-agreement-verified` **and** owner-activated:

- do not claim a commission rate, cookie window, reporting lag, or sub-ID capability;
- do not label an untagged outbound path as a monetised partner;
- do not treat Duffel search or a disabled booking flag as an enabled merchant pathway;
- do not treat Gootickets / F1 Store / Omio / Airalo / Grand Prix Grand Tours as live handoffs.

The live P1 attributed redirect may remain as currently deployed **technical** behaviour. It is **not** terms-verified and **not** commercially approved by this register. That gap is why PLT-057 and Gate C stay open.
