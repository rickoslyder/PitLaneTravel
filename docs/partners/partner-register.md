# Partner register (PLT-057)

Operational inventory of PitLane Travel commercial handoffs and supplier pathways.
Not marketing copy. Not a capability claim. Not Gate C closure.

- **Issue:** PLT-057 / GitHub #8 (remains open)
- **Depends on:** PLT-001 / GitHub #2
- **Milestone:** Gate C — **not satisfied**
- **Register date:** 2026-08-27
- **Evidence cut-off / read date:** 2026-08-28
- **Scope:** PitLane commercial handoffs / supplier pathways only. Unrelated personal affiliate memberships are out of scope as pathways; where a network dashboard observation below lists campaigns, relevance of each campaign to PitLane is separately unverified.

This file may be merged as **fail-closed evidence infrastructure**. It does **not** close GitHub #8, accept PLT-057, or close Gate C.

## Standing rules

1. **Accepted account ≠ product-enabled integration ≠ current terms verified ≠ commercially approved.** Keep the four axes separate. A current human dashboard/login observation (`current-dashboard`) upgrades the **account** axis only; it is not a current-agreement read and does not move the terms axis.
2. **Absent evidence cannot become a claim.** If a field was not read from a current agreement, it is a **blocking unknown**. Campaign presence on a dashboard, the existence of a vault credential, industry norms, API availability, or portal access never substitute for reading the current agreement.
3. **Do not invent from industry norms.** No inferred rates, cookie windows, reporting lag, sub-ID semantics, regions, renewal dates, disclosure wording, or technical capabilities.
4. **Historical onboarding is historical.** Welcome/acceptance emails describe then-stated capabilities only.
5. **A contract-change or legal-update notice is notice-only.** Directing the holder to a dashboard is not a current-terms read.
6. **Product code must not claim a rate or attribution capability absent from this register.**
7. **Credentials and confidential payloads stay out of Git.** No login names, publisher/account/affiliate IDs, message IDs, Drive IDs/URLs, exact commission rates, payout thresholds, confidential terms, tracking query strings, redirect slugs, or sensitive partner contacts. Public provider/program names and public root hostnames only when operationally useful. A vault credential is recorded as **existence-only metadata** (`private-vault-metadata`); no secret fields, values, or identifiers.
8. **PLT-056 Hobby hold** is a paid Vercel plan-change / commercial-launch hosting boundary only. It does not freeze this inventory, does not block developing or deploying commercial-capability code, and does not relax the separate partner/commercial evidence gates in this register.
9. **Evidence cut-off.** Current-state reads in this register are cut off at **2026-08-28**. Later mailbox, vault, dashboard, API, or production observations are outside this slice unless a later dated entry is added.
10. **Negative search is scoped, not global.** `negative-search` means only the **available Gmail account** and the **available Hermes operator vault** were searched on the evidence cut-off date. Those two sources are not every mailbox, vault, or partner dashboard. Absence there does **not** prove that no account, agreement, or other evidence exists in inaccessible dashboards, other vaults, or other mailboxes. The scoped absence remains a **blocking unknown**, not a global nonexistence claim. Owner dashboard/vault review can later locate evidence a scoped search missed; when it does, record the new class and date.
11. **Portal access is not partner status and not automation permission.** A working login, quote creation, or a referral-link generator is a human portal capability. Any future automation against such a portal needs separate authorization and review.

New partner rows use [`partner-template.md`](partner-template.md).

## Status vocabulary

| Axis | Value | Meaning |
|---|---|---|
| Account | `none` | No application or account evidence. |
| Account | `requested` | Application submitted; acceptance not evidenced. |
| Account | `accepted-historical` | Historical acceptance/welcome exists; current account state not re-verified on a dashboard. |
| Account | `active-current-dashboard` | Current human dashboard/login review confirms an accessible account and, where stated, campaign presence. Presence/state observation only — **not** a terms read. |
| Account | `inaccessible-current` | Account access currently failing (login/reset). Historical acceptance remains historical evidence only. |
| Account | `rejected-current` | Current portal reports the account is rejected / cannot proceed. |
| Account | `closed-historical` | Programme/account reported closed. Migration to a new programme or business status is unknown unless separately evidenced. |
| Account | `supplier-customer` | Supplier/API customer relationship, not an affiliate program. |
| Account | `unverified-candidate` | Marketing or personal contact only. Not a partner. |
| Product | `product-enabled` | See definition below. Fail closed. |
| Product | `not-product-enabled` | No current production attributed commercial handoff to this party. |
| Terms | `unverified` | Current agreement not reviewed. A dashboard observation does not change this value. |
| Terms | `historical-welcome-only` | Only historical onboarding email capabilities are evidenced. |
| Terms | `notice-only` | A terms/legal-update notice was received; current terms were not in that notice and were not read from the agreement. |
| Terms | `current-agreement-verified` | Current agreement read directly, with verification date and human reviewer. None in this register. |
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
| `current-dashboard` | Human dashboard/login observation by the owner on the read date. Account/campaign presence and portal capabilities only. **Not** a current-agreement read; moves the account axis, never the terms axis. |
| `current-api-terms-observed` | Current effective campaign terms retrieved directly through the authenticated Partnerize terms API and reviewed by the agent for named operational clauses. This is stronger than dashboard presence, but it is **not** `current-agreement-verified` until the owner performs the required human review and records activation. |
| `private-vault-metadata` | Existence-only record that a credential, API token, or login entry for the named provider exists in the private Hermes operator vault. No secret fields, values, identifiers, or login names are recorded. Vault existence never implies any capability. |
| `current-messaging-not-terms` | Automated account or promotional messaging. Not a current agreement. |
| `notice-only` | Contract-terms-changed or services-agreement update notice. Not a full terms read. |
| `negative-search` | Search of the **available Gmail account** and the **available Hermes operator vault** on the evidence cut-off date found no matching partner evidence. Scoped absence only. Not a global nonexistence claim. Still blocking. |
| `absent` | No evidence of that class exists. |

Verification of a current agreement is **human review**. This register does not substitute for it.

## Gate and acceptance state (2026-08-27, amended)

| Claim | State |
|---|---|
| PLT-057 accepted | **No.** The effective P1 terms were retrieved directly through Partnerize on 2026-08-28, but owner/human review, commercial activation, comparison-feed permission, and several operational fields remain unresolved. |
| Gate C closed | **No.** Current terms retrieval does not substitute for owner activation or the remaining attribution/reporting/disclosure proof. |
| GitHub #8 | **Open.** Do not use closing language until the owner reviews the retrieved terms, resolves the remaining unknowns, and records activation — or the product-enabled attributed path is disabled under a separate approved change. |
| This docs slice | Mergeable as fail-closed inventory. Does not enable, disable, or commercially approve any path. |

**Activation boundary.** Do not product-enable any inventory row, and do not treat the live P1 redirect as terms-verified, until `current-agreement-verified` plus owner sign-off. Disabling the live P1 attributed path is a **separate approved change**, not this issue.

**Next proof required.** Owner/human review of the terms retrieved on 2026-08-28, plus direct resolution of comparison-feed permission, attribution/sub-ID semantics, reporting, disclosure, contact, and renewal fields — **or** a separately approved disable of that attributed path. The retrieved terms establish important restrictions but do not answer every activation question. PLT-057 / Gate C stay open.

**Technical capability addendum (2026-08-27).** Bounded read-only probes now verify working API access to Impact, Awin, and Partnerize, including the active programme/campaign inventories summarized in [`api-capability-and-price-intelligence.md`](api-capability-and-price-intelligence.md). This upgrades technical-access evidence only. It does not verify current agreements, authorise product enablement, or close Gate C.

## Summary

| Party | Account | Product | Current terms | Commercial |
|---|---|---|---|---|
| P1 Travel (Partnerize) | `active-current-dashboard` | `product-enabled` | `unverified` (current terms retrieved; owner review still required) | `not-commercially-approved` |
| Gootickets | `inaccessible-current` | `not-product-enabled` | `historical-welcome-only` | `not-commercially-approved` |
| F1 Store / Fanatics on Impact | `active-current-dashboard` | `not-product-enabled` | `historical-welcome-only` | `not-commercially-approved` |
| Omio on Impact | `active-current-dashboard` | `not-product-enabled` | `notice-only` (plus historical welcome) | `not-commercially-approved` |
| Airalo on Impact | `active-current-dashboard` | `not-product-enabled` | `notice-only` (plus historical welcome) | `not-commercially-approved` |
| Awin (network account) | `active-current-dashboard` | `not-product-enabled` | `unverified` | `not-commercially-approved` |
| Motorsport Tickets on Awin | `closed-historical` | `not-product-enabled` | `unverified` | `not-commercially-approved` |
| Trip.com | `active-current-dashboard` | `not-product-enabled` | `unverified` | `not-commercially-approved` |
| GetYourGuide | `active-current-dashboard` | `not-product-enabled` | `unverified` | `not-commercially-approved` |
| Viator | `rejected-current` | `not-product-enabled` | `unverified` | `not-commercially-approved` |
| Expedia TAAP | `active-current-dashboard` (travel-agent/supplier portal; not automatically an affiliate account) | `not-product-enabled` | `unverified` | `not-commercially-approved` |
| Freetour | `active-current-dashboard` | `not-product-enabled` | `unverified` | `not-commercially-approved` |
| Grand Prix Grand Tours | `active-current-dashboard` (portal account; affiliate/partner status a blocking unknown) | `not-product-enabled` | `unverified` | `not-commercially-approved` |
| Duffel | `supplier-customer` | `not-product-enabled` | `notice-only` (not an affiliate matrix) | `not-commercially-approved` |
| Booking.com | `none` (no affiliate account evidence in scoped sources) | `not-product-enabled` | `unverified` | `not-commercially-approved` |

---

## P1 Travel (Partnerize)

Live attributed ticket handoff exists. Current dashboard access and campaign presence are verified. Effective terms were retrieved directly through Partnerize on 2026-08-28, but the owner has not yet recorded the required human review or commercial activation.

| Field | Record | Evidence |
|---|---|---|
| Account / application | **`active-current-dashboard`.** Historical: P1 accepted PitLane Travel into Partnerize per a 2025-01-03 Workspace Gmail acceptance email; Partnerize independently confirmed the P1 Travel campaign acceptance; no P1 termination/suspension email was found. Current: owner dashboard review 2026-08-27 — the Partnerize dashboard is accessible and currently shows P1 Travel as the only campaign. A Partnerize API credential and a separate login entry exist in the private Hermes vault (existence only; nothing recorded here). This owner review supersedes the earlier scoped negative-search record for the **account** axis only; it changes nothing on the terms axis. | `historical-onboarding` 2025-01-03; `current-dashboard` 2026-08-27; `private-vault-metadata` 2026-08-27 |
| Product enablement | **`product-enabled`.** Production showed Australian Grand Prix 2025 live ticket cards. Three independent same-origin masked purchase URLs resolved by bounded GET through `p1travel.prf.hn` then `www.p1travel.com`. Hostnames/statuses only; no query strings or tracking IDs retained. Current code creates public masked ticket redirects and can fall back to the reseller URL. Product claims ticket availability/prices; it does **not** state a commission rate. | `production-observed` 2026-08-27; `repository-audited` (`TicketCard`, `/api/redirect/[slug]`, ticket-redirect actions) |
| Offer classes | Production displays ticket cards (availability/prices) for the observed event. Current P1 terms make the country-specific product feed the controlling list of promotable events and exclude any event omitted for that country. They do **not** independently enumerate offer classes. | `production-observed`; `current-api-terms-observed` 2026-08-28 |
| Regions / series | Current terms require the matching country-domain feed, make country-specific exclusions override the general COM feed, and prohibit promotion through P1’s UK site. Exact current event/series eligibility must therefore come from a working locale feed; the dead feeds cannot establish it. | `current-api-terms-observed`; current feed probe |
| Attribution / sub-ID | Production handoff uses public hostname `p1travel.prf.hn` then `www.p1travel.com`. The campaign API reports an active participation and a 30-day-equivalent cookie field, but the retrieved terms do not define sub-ID support/semantics or complete attribution rules. Those remain blocking unknowns. | `production-observed`; authenticated Partnerize API 2026-08-28 |
| Deep-link rules | Partnerize reports deep-linking enabled for the active P1 campaign. Current terms prohibit copying P1 site text/images and permit only content/images shared by P1; country-feed exclusions still control what may be promoted. Destination allowlists and sub-ID mechanics remain unresolved. | `current-api-terms-observed`; authenticated Partnerize campaign API 2026-08-28 |
| Reporting lag | **Blocking unknown.** Dashboard access exists but reporting terms were not read from a current agreement. | `absent` |
| Commission / cookie terms | Exact rates remain confidential and are omitted. The authenticated campaign API reports a 30-day-equivalent cookie field; the retrieved terms do not fully define attribution. Product does not state a rate. Do not invent one. | authenticated Partnerize API 2026-08-28; `repository-audited` |
| Feed / API format | The authenticated publisher-feed endpoint exposes 18 P1 definitions (12 XML, 6 CSV) across COM/DE/ES/FR/NL/UK, including Formula 1 feeds. Current terms explicitly make the locale feed the controlling promotion/exclusion source. All 18 definitions report zero bytes and never processed; every returned location answered 404. There is no documented publisher-side regeneration endpoint. Do not ingest until P1/Partnerize repairs them and confirms comparison-site use. | `current-api-terms-observed`; [`evidence/p1-product-feed-probe-2026-08-27.json`](evidence/p1-product-feed-probe-2026-08-27.json) |
| Disclosure | **Blocking unknown.** | `absent` |
| Contact / renewal | **Blocking unknown.** No termination/suspension email found; current contact/renewal terms not read. | `negative-search` 2026-08-27; terms `unverified` |
| Last verification | 2026-08-28 — current effective P1 terms retrieved through the authenticated Partnerize API; active participation reports latest terms agreed. 2026-08-27 — owner dashboard review, production redirect observation, and feed probe. Owner/human terms review is still unrecorded. | mixed |
| Blockers / next action | **Blocks PLT-057 acceptance and Gate C.** Next: owner review of the retrieved terms; obtain written confirmation that comparison-site ingestion is permitted; repair the 18 feeds; and resolve sub-ID semantics, reporting, disclosure, contact, and renewal. Do not send the prepared support draft without explicit approval. | — |

---

## Gootickets

Inventory only. Not product-enabled. Current login inaccessible.

| Field | Record | Evidence |
|---|---|---|
| Account / application | **`inaccessible-current`.** Affiliate request registered 2024-12-27; accepted / registration confirmed 2024-12-30. Owner review 2026-08-27: current login is inaccessible; forgotten-password reset mail has not arrived; owner may re-register after a few days. Historical acceptance remains valid **historical** evidence only. | `historical-onboarding`; `current-dashboard` 2026-08-27 (access attempt) |
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
| Last verification | 2026-08-27 — owner access attempt (inaccessible). Historical onboarding 2024-12-27 / 2024-12-30. No current agreement reviewed. | mixed |
| Blockers / next action | Do not product-enable. Current terms are blocking unknowns. Next: restore access (password reset or owner re-registration), then current dashboard/agreement review before any integration work. | — |

---

## F1 Store / Fanatics on Impact

Inventory only. Not product-enabled.

| Field | Record | Evidence |
|---|---|---|
| Account / application | **`active-current-dashboard`.** Application 2024-12-30; accepted / welcome 2025-01-02. Owner dashboard review 2026-08-27: the Impact dashboard is accessible and the F1 Store/Fanatics campaign is present. A fully scoped Impact API token exists in the private Hermes vault (existence only; nothing recorded here). | `historical-onboarding`; `current-dashboard` 2026-08-27; `private-vault-metadata` 2026-08-27 |
| Product enablement | **`not-product-enabled`.** No product integration found. | `repository-audited` 2026-08-27 |
| Offer classes | **Blocking unknown** as current. Historical welcome did not supply a verified current catalogue; dashboard presence does not state terms. | `historical-onboarding`; current `unverified` |
| Regions / series | **Blocking unknown.** | `absent` |
| Attribution / sub-ID | **Historical only:** Impact link building / custom text links. **Current: blocking unknown.** | `historical-onboarding` |
| Deep-link rules | **Blocking unknown** beyond historical Impact text-link building. | `historical-onboarding` |
| Reporting lag | **Blocking unknown.** | `absent` |
| Commission / cookie terms | **Blocking unknown.** No matching Contract Terms Changed email was found in the available Gmail account as of the 2026-08-27 evidence cut-off. That scoped mailbox absence is not a global nonexistence claim. Current automated account messaging through 2026-08-26 reports no traffic/sales; that is **not** a current terms agreement. | `current-messaging-not-terms`; `negative-search` for terms-change mail |
| Feed / API format | **Blocking unknown.** Vault API-token existence does not evidence current authorised use or format. | `private-vault-metadata`; current `absent` |
| Disclosure | **Blocking unknown.** | `absent` |
| Contact / renewal | **Historical only:** program contact mentioned in welcome. **Current contact/renewal: blocking unknown.** | `historical-onboarding` |
| Last verification | 2026-08-27 — owner Impact dashboard review (campaign present); vault metadata (existence only). Historical welcome 2025-01-02. Automated messaging seen through 2026-08-26 (not terms). **No current agreement read.** | mixed |
| Blockers / next action | Do not product-enable. Current terms are blocking unknowns. Next: current Impact agreement read before any integration work. | — |

---

## Omio on Impact

Inventory only. Not product-enabled.

| Field | Record | Evidence |
|---|---|---|
| Account / application | **`active-current-dashboard`.** Accepted / welcome 2025-01-09. Owner dashboard review 2026-08-27: Impact dashboard accessible; Omio campaign present. Impact API token exists in the private vault (existence only). | `historical-onboarding`; `current-dashboard` 2026-08-27; `private-vault-metadata` |
| Product enablement | **`not-product-enabled`.** No product integration found. | `repository-audited` 2026-08-27 |
| Offer classes | **Historical only:** train / bus / flight / ferry. **Current: blocking unknown.** | `historical-onboarding` |
| Regions / series | **Historical only:** then-stated Europe / US / Canada reach. **Current: blocking unknown.** | `historical-onboarding` |
| Attribution / sub-ID | **Historical only:** banners / text links and Impact reporting. **Current: blocking unknown.** | `historical-onboarding` |
| Deep-link rules | **Historical only:** deep links to relevant Omio pages; booking widget mentioned historically. **Current: blocking unknown.** | `historical-onboarding` |
| Reporting lag | **Blocking unknown.** Historical welcome mentioned Impact reporting, not lag. | `absent` |
| Commission / cookie terms | **Blocking unknown.** Contract Terms Changed notice received 2026-08-07; body only directs the account holder to the dashboard. Current terms were not in the email and were not read from the agreement. Current promotional messages do not prove current contract capabilities. | `notice-only` 2026-08-07; `current-messaging-not-terms` |
| Feed / API format | **Blocking unknown.** | `absent` |
| Disclosure | **Blocking unknown.** | `absent` |
| Contact / renewal | **Blocking unknown.** | `absent` |
| Last verification | 2026-08-27 — owner Impact dashboard review (campaign present). Historical welcome 2025-01-09. Notice-only 2026-08-07. **No current agreement read.** | mixed |
| Blockers / next action | Do not product-enable. Current terms are blocking unknowns. Next: read current terms in Impact before any integration work. | — |

---

## Airalo on Impact

Inventory only. Not product-enabled. **Do not state any rate.**

| Field | Record | Evidence |
|---|---|---|
| Account / application | **`active-current-dashboard`.** Accepted / welcome 2025-01-21. Owner dashboard review 2026-08-27: Impact dashboard accessible; Airalo campaign present. Impact API token exists in the private vault (existence only). | `historical-onboarding`; `current-dashboard` 2026-08-27; `private-vault-metadata` |
| Product enablement | **`not-product-enabled`.** No product integration found. | `repository-audited` 2026-08-27 |
| Offer classes | **Historical only:** eSIM. **Current: blocking unknown.** | `historical-onboarding` |
| Regions / series | **Historical only:** broad global coverage. **Current: blocking unknown.** | `historical-onboarding` |
| Attribution / sub-ID | **Historical only:** unique tracking links / promotional materials and Impact affiliate links. **Current: blocking unknown.** | `historical-onboarding` |
| Deep-link rules | **Blocking unknown** beyond historical unique tracking links. | `historical-onboarding` |
| Reporting lag | **Blocking unknown.** 2026-05-01 notice confirms a reporting method exists; lag and method details were not verified from a current agreement. | `notice-only` 2026-05-01 |
| Commission / cookie terms | **Blocking unknown. Do not state any rate.** 2026-05-01 Contract Terms Changed notice confirms rate differentiation by customer status. Exact rates are confidential and are not recorded here. Full current agreement was not reviewed. | `notice-only` 2026-05-01 |
| Feed / API format | **Blocking unknown.** | `absent` |
| Disclosure | **Blocking unknown.** | `absent` |
| Contact / renewal | **Blocking unknown.** | `absent` |
| Last verification | 2026-08-27 — owner Impact dashboard review (campaign present). Historical welcome 2025-01-21. Notice-only 2026-05-01. **No current agreement read.** | mixed |
| Blockers / next action | Do not product-enable. Do not publish rates. Next: current agreement read before any integration work. | — |

---

## Awin (network account)

Inventory only. Not product-enabled. Campaign relevance to PitLane is separately unverified.

| Field | Record | Evidence |
|---|---|---|
| Account / application | **`active-current-dashboard`.** Owner dashboard review 2026-08-27: the Awin dashboard is accessible and currently lists the campaigns Alpine Hearing Protection UK, F1 Authentics UK, minicabit, Awin, and SportsBreaks. A private API credential and a login entry exist in the private Hermes vault (existence only; nothing recorded here). | `current-dashboard` 2026-08-27; `private-vault-metadata` 2026-08-27 |
| Product enablement | **`not-product-enabled`.** No product integration found. | `repository-audited` 2026-08-27 |
| Offer classes | Dashboard lists the campaigns above. **Current authorised offer classes per campaign: blocking unknown** (no current agreement terms reviewed). | `current-dashboard`; terms `unverified` |
| Regions / series | Campaign names above are as displayed. **Current authorised regions/series: blocking unknown.** | `current-dashboard`; terms `unverified` |
| Attribution / sub-ID | **Blocking unknown.** Campaign membership does not state attribution terms. | `absent` |
| Deep-link rules | **Blocking unknown.** | `absent` |
| Reporting lag | **Blocking unknown.** | `absent` |
| Commission / cookie terms | **Blocking unknown.** No current agreement terms were reviewed. Do not invent. | `absent` |
| Feed / API format | **Blocking unknown.** Vault API-credential existence does not evidence current authorised use or format. | `private-vault-metadata`; current `absent` |
| Disclosure | **Blocking unknown.** | `absent` |
| Contact / renewal | **Blocking unknown.** | `absent` |
| Last verification | 2026-08-27 — owner Awin dashboard review; vault metadata (existence only). **No current agreement terms reviewed.** | mixed |
| Blockers / next action | Do not product-enable. Do not infer any capability from campaign membership. Next: per-campaign current agreement read before any integration work. | — |

---

## Motorsport Tickets on Awin

Closed Awin account/programme. Not product-enabled.

| Field | Record | Evidence |
|---|---|---|
| Account / application | **`closed-historical`.** Owner Awin dashboard review 2026-08-27: the Motorsport Tickets account on Awin is closed. It is **unknown** whether it migrated to a new programme/account or shut down; this register records only the Awin account closure, not any business-level status. | `current-dashboard` 2026-08-27 |
| Product enablement | **`not-product-enabled`.** No product integration found. | `repository-audited` 2026-08-27 |
| Offer classes | **Blocking unknown.** | `absent` |
| Regions / series | **Blocking unknown.** | `absent` |
| Attribution / sub-ID | **Blocking unknown.** | `absent` |
| Deep-link rules | **Blocking unknown.** | `absent` |
| Reporting lag | **Blocking unknown.** | `absent` |
| Commission / cookie terms | **Blocking unknown.** No current agreement terms were reviewed. | `absent` |
| Feed / API format | **Blocking unknown.** | `absent` |
| Disclosure | **Blocking unknown.** | `absent` |
| Contact / renewal | **Blocking unknown.** Whether a successor programme/account exists is unknown. | `absent` |
| Last verification | 2026-08-27 — owner Awin dashboard review (account closed). | `current-dashboard` |
| Blockers / next action | Do not product-enable. Next: only if a successor programme/account is identified, open a new row and read its current agreement before any integration work. | — |

---

## Trip.com

Inventory only. Not product-enabled.

| Field | Record | Evidence |
|---|---|---|
| Account / application | **`active-current-dashboard`.** Owner review 2026-08-27: the Trip.com partner login currently works. A login entry exists in the private Hermes vault (existence only). | `current-dashboard` 2026-08-27; `private-vault-metadata` 2026-08-27 |
| Product enablement | **`not-product-enabled`.** No product integration found. | `repository-audited` 2026-08-27 |
| Offer classes | **Blocking unknown.** No current agreement terms were reviewed. | `absent` |
| Regions / series | **Blocking unknown.** | `absent` |
| Attribution / sub-ID | **Blocking unknown.** A working login does not state attribution terms. | `absent` |
| Deep-link rules | **Blocking unknown.** | `absent` |
| Reporting lag | **Blocking unknown.** | `absent` |
| Commission / cookie terms | **Blocking unknown.** Do not invent. | `absent` |
| Feed / API format | **Blocking unknown.** | `absent` |
| Disclosure | **Blocking unknown.** | `absent` |
| Contact / renewal | **Blocking unknown.** | `absent` |
| Last verification | 2026-08-27 — owner login check; vault metadata (existence only). **No current agreement terms reviewed.** | mixed |
| Blockers / next action | Do not product-enable. Next: current agreement read before any integration work. | — |

---

## GetYourGuide

Inventory only. Not product-enabled.

| Field | Record | Evidence |
|---|---|---|
| Account / application | **`active-current-dashboard`.** Owner review 2026-08-27: the GetYourGuide partner login currently works. A login entry exists in the private Hermes vault (existence only). | `current-dashboard` 2026-08-27; `private-vault-metadata` 2026-08-27 |
| Product enablement | **`not-product-enabled`.** No product integration found. | `repository-audited` 2026-08-27 |
| Offer classes | **Blocking unknown.** No current agreement terms were reviewed. | `absent` |
| Regions / series | **Blocking unknown.** | `absent` |
| Attribution / sub-ID | **Blocking unknown.** A working login does not state attribution terms. | `absent` |
| Deep-link rules | **Blocking unknown.** | `absent` |
| Reporting lag | **Blocking unknown.** | `absent` |
| Commission / cookie terms | **Blocking unknown.** Do not invent. | `absent` |
| Feed / API format | **Blocking unknown.** | `absent` |
| Disclosure | **Blocking unknown.** | `absent` |
| Contact / renewal | **Blocking unknown.** | `absent` |
| Last verification | 2026-08-27 — owner login check; vault metadata (existence only). **No current agreement terms reviewed.** | mixed |
| Blockers / next action | Do not product-enable. Next: current agreement read before any integration work. | — |

---

## Viator

Current account rejected. Not product-enabled.

| Field | Record | Evidence |
|---|---|---|
| Account / application | **`rejected-current`.** Owner review 2026-08-27: the current account is unavailable/rejected; the portal states it cannot proceed with the account. | `current-dashboard` 2026-08-27 |
| Product enablement | **`not-product-enabled`.** No product integration found. | `repository-audited` 2026-08-27 |
| Offer classes | **Blocking unknown.** | `absent` |
| Regions / series | **Blocking unknown.** | `absent` |
| Attribution / sub-ID | **Blocking unknown.** | `absent` |
| Deep-link rules | **Blocking unknown.** | `absent` |
| Reporting lag | **Blocking unknown.** | `absent` |
| Commission / cookie terms | **Blocking unknown.** | `absent` |
| Feed / API format | **Blocking unknown.** | `absent` |
| Disclosure | **Blocking unknown.** | `absent` |
| Contact / renewal | **Blocking unknown.** | `absent` |
| Last verification | 2026-08-27 — owner portal review (rejected). | `current-dashboard` |
| Blockers / next action | Do not product-enable. Next: none unless the owner re-applies and is accepted; then current agreement read before any integration work. | — |

---

## Expedia TAAP

Travel-agent/supplier portal. Not automatically an affiliate account. Not product-enabled.

| Field | Record | Evidence |
|---|---|---|
| Account / application | **`active-current-dashboard`.** Owner review 2026-08-27: the Expedia TAAP login currently works. A login entry exists in the private Hermes vault (existence only). TAAP is a travel-agent/supplier portal; this observation does **not** establish an affiliate account or any affiliate capability. | `current-dashboard` 2026-08-27; `private-vault-metadata` 2026-08-27 |
| Product enablement | **`not-product-enabled`.** No product integration found. | `repository-audited` 2026-08-27 |
| Offer classes | **Blocking unknown.** No current agreement terms were reviewed. | `absent` |
| Regions / series | **Blocking unknown.** | `absent` |
| Attribution / sub-ID | **Blocking unknown.** Portal access does not state attribution terms. | `absent` |
| Deep-link rules | **Blocking unknown.** | `absent` |
| Reporting lag | **Blocking unknown.** | `absent` |
| Commission / cookie terms | **Blocking unknown.** Do not infer agent commission terms from portal access. | `absent` |
| Feed / API format | **Blocking unknown.** | `absent` |
| Disclosure | **Blocking unknown.** | `absent` |
| Contact / renewal | **Blocking unknown.** | `absent` |
| Last verification | 2026-08-27 — owner login check; vault metadata (existence only). **No current agreement terms reviewed.** | mixed |
| Blockers / next action | Do not product-enable. Do not treat TAAP access as an affiliate pathway. Next: current agreement read and explicit classification (agent vs affiliate) before any integration work. | — |

---

## Freetour

Inventory only. Not product-enabled.

| Field | Record | Evidence |
|---|---|---|
| Account / application | **`active-current-dashboard`.** Owner review 2026-08-27: the Freetour login currently works. A login entry exists in the private Hermes vault (existence only). | `current-dashboard` 2026-08-27; `private-vault-metadata` 2026-08-27 |
| Product enablement | **`not-product-enabled`.** No product integration found. | `repository-audited` 2026-08-27 |
| Offer classes | **Blocking unknown.** No current agreement terms were reviewed. | `absent` |
| Regions / series | **Blocking unknown.** | `absent` |
| Attribution / sub-ID | **Blocking unknown.** Portal referral-link generation, if enabled, would still not state contractual attribution terms. | `absent` |
| Deep-link rules | **Blocking unknown.** | `absent` |
| Reporting lag | **Blocking unknown.** | `absent` |
| Commission / cookie terms | **Blocking unknown.** Do not invent. | `absent` |
| Feed / API format | **No API access exists.** Referral-link generator access requires contacting support; it is not currently enabled. **Current feed/API: none available; terms blocking unknown.** | `current-dashboard` 2026-08-27 |
| Disclosure | **Blocking unknown.** | `absent` |
| Contact / renewal | **Blocking unknown.** Support contact would be required for link-generator access; no sensitive contact is recorded here. | `absent` |
| Last verification | 2026-08-27 — owner login check; vault metadata (existence only). **No current agreement terms reviewed.** | mixed |
| Blockers / next action | Do not product-enable. Next: current agreement read (and any support-granted generator access) before any integration work. | — |

---

## Grand Prix Grand Tours

Human portal account with quote capability. Affiliate/partner status and automation permission are **not** established. Not product-enabled.

| Field | Record | Evidence |
|---|---|---|
| Account / application | **`active-current-dashboard`** as a portal account. Owner review 2026-08-27: the portal login currently works and allows quote creation. A public sales toolkit exists at `https://www.grandprixgrandtours.com/motorsportsalestoolkit`. A login entry exists in the private Hermes vault (existence only). **Portal access and quote capability do not themselves prove affiliate/partner status or permission to automate; that status is a blocking unknown.** Earlier marketing/quote emails (2024–2025) are not partner evidence. | `current-dashboard` 2026-08-27; `private-vault-metadata` 2026-08-27 |
| Product enablement | **`not-product-enabled`.** No product integration found. | `repository-audited` 2026-08-27 |
| Offer classes | Portal allows human quote creation. **Current authorised offer classes as a partner/affiliate: blocking unknown.** | `current-dashboard`; terms `unverified` |
| Regions / series | **Blocking unknown.** | `absent` |
| Attribution / sub-ID | **Blocking unknown.** Quote capability is not attribution. | `absent` |
| Deep-link rules | **Blocking unknown.** | `absent` |
| Reporting lag | **Blocking unknown.** | `absent` |
| Commission / cookie terms | **Blocking unknown.** Do not infer any commercial terms from portal access. | `absent` |
| Feed / API format | **No API is offered.** Quote creation is a human portal capability, **not** a safe read-only API; any future automation would need separate authorization and review. | `current-dashboard` 2026-08-27 |
| Disclosure | **Blocking unknown.** | `absent` |
| Contact / renewal | **Blocking unknown.** | `absent` |
| Last verification | 2026-08-27 — owner portal review; vault metadata (existence only). **No current agreement terms reviewed.** | mixed |
| Blockers / next action | Do not product-enable. Do not automate against the portal. Next: explicit partner/agreement confirmation and a current terms read before any integration or automation work. | — |

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

## Product-code constraint

Until a row is `current-agreement-verified` **and** owner-activated:

- do not claim a commission rate, cookie window, reporting lag, or sub-ID capability;
- do not label an untagged outbound path as a monetised partner;
- do not treat Duffel search or a disabled booking flag as an enabled merchant pathway;
- do not treat Gootickets, the Impact campaigns, the Awin campaigns, Trip.com, GetYourGuide, Viator, Expedia TAAP, Freetour, or Grand Prix Grand Tours as live handoffs;
- do not infer capability from dashboard campaign presence, vault credential existence, or portal access.

The live P1 attributed redirect may remain as currently deployed **technical** behaviour. It is **not** terms-verified and **not** commercially approved by this register. That gap is why PLT-057 and Gate C stay open.
