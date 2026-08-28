# Current partner APIs and ticket-price intelligence

**Observed:** 2026-08-27 UTC
**Method:** bounded, read-only live API probes using credentials injected locally from 1Password. No credential values, account IDs, affiliate IDs, tracking URLs, confidential rates, or agreement payloads are retained here.
**Commercial state:** technical access is not current-agreement verification or owner activation; `partner-register.md` remains the commercial gate.

## Conclusion

Three partner-network APIs are genuinely usable now: Impact, Awin, and Partnerize. They can immediately support campaign health, catalogue/creative discovery, deep-link generation, and attribution reporting. None yet gives PitLane a normalized, multi-provider race-ticket price feed. The next product should therefore be a provider-neutral **price-intelligence layer** that can ingest authorised APIs/feeds first and bounded official-source observations second.

The public promise should be **“cheapest comparable authorised ticket we observed”**, not “cheapest ticket on the internet.”

## Live capability matrix

| Network | Verified live access | Programmes observed | Useful now | Not yet proved |
|---|---|---|---|---|
| Impact v16 | Authentication and six read endpoints returned HTTP 200 | Omio Travel Partner Program, F1 Store, Airalo — all active and deep-link enabled | Joined-program health; three active contracts; 25 current catalogues; ads/deep links; API-accessible reports | Motorsport-ticket inventory; Ticketmaster campaign acceptance; permission to product-enable any programme without current terms review |
| Awin | Authentication, joined programmes, commission groups, account metadata, and transaction read returned HTTP 200 | Awin, minicabit, F1 Authentics UK, Alpine Hearing Protection UK, SportsBreaks — all active | Campaign health; per-advertiser commission-group structure; transaction reads; official Link Builder is available for future deep-link generation | Enhanced/product feed availability per programme; normalized live race-ticket prices; current terms/product activation |
| Partnerize | Authentication, campaign, tracking, P1 commission, creative, and publisher-feed endpoints returned HTTP 200 | P1 Travel active; DAZN retained only as retired | P1 campaign health; deep-link permission; current tracking capability; commission structures; 1,399 ordinary creatives; 18 configured XML/CSV feed definitions | A usable current P1 feed—the 18 listed feed locations all return 404; normalized prices/availability; working modern reporting endpoint; current agreement verification |

Impact’s API documentation confirms joined-program and catalogue surfaces.[1][2]

It separately documents ad and reporting surfaces.[3][4]

Awin documents publisher APIs for reports, offers, Link Builder, and advertiser commission groups, with a 20-calls-per-minute per-user throttle.[5][6][7]

Partnerize’s publisher guide documents read access to campaign creatives, commission structures, tracking, and reporting, although its public guide is old and every endpoint must be validated live before use.[8] The current API reference separately exposes publisher product feeds, rather than mixing them into ordinary campaign creatives.[11]

## What the APIs can power next

### Immediate, low-risk

1. **Daily partner-health snapshot**
   - active/retired campaign state;
   - deep-link capability flag;
   - catalogue/creative freshness;
   - report endpoint health;
   - fail closed if a campaign disappears or API auth fails.
2. **Controlled deep-link service**
   - generate links only for an allowlisted programme and destination domain;
   - store destination + provider + campaign state + generation timestamp;
   - never store credentials or expose network IDs publicly.
3. **Catalogue ingestion outside ticketing**
   - F1 Store and Airalo product catalogues;
   - Omio catalogue discovery where the items are relevant to a race itinerary;
   - preserve provider currency, current/original price, stock, and source timestamp.[2]
4. **Attribution reporting**
   - ingest network reports into a private operational table;
   - recommendation ranking must never depend on commission.

### Ticketing-specific probe result

The ordinary P1 campaign-creative endpoint returned 1,399 creatives: 759 active and 640 inactive. Every row carried a tracking link; destinations were confined to P1’s public country domains. Public creative metadata contained 157 Formula 1 keyword hits and 30 MotoGP hits, but **zero rows exposed a price- or cost-named field**. This endpoint supplies useful event/deep-link metadata, not inventory. The sanitized aggregate is preserved at [`evidence/p1-creative-taxonomy-2026-08-27.json`](evidence/p1-creative-taxonomy-2026-08-27.json).

The distinct publisher-feed endpoint was then checked directly. It lists **18 P1 product-feed definitions: 12 XML and 6 CSV**, spanning COM/DE/ES/FR/NL/UK and including Formula 1-specific feeds. However, all 18 report `filesize: 0` and `last_processed: 0`; their metadata was last updated between January and August 2023; and every returned download location currently responds HTTP 404. The definitions are real, but **none is a usable current price or availability feed**. Preserve this result at [`evidence/p1-product-feed-probe-2026-08-27.json`](evidence/p1-product-feed-probe-2026-08-27.json).

On 2026-08-28 the authenticated Partnerize effective-terms endpoint returned the current P1 terms and the participation endpoint reported an active, approved participation with latest terms agreed. The terms make the matching country feed the controlling list of promotable events, make locale exclusions override the COM feed, restrict site-copy/image reuse, and prohibit several paid/retargeted channels. They do **not** explicitly grant comparison-site ingestion/republication, define sub-ID semantics, or expose a publisher-side feed-regeneration control. The sanitized result is preserved at [`evidence/p1-current-terms-probe-2026-08-28.json`](evidence/p1-current-terms-probe-2026-08-28.json); owner review and commercial activation remain separate gates.

### Remaining ticketing probes

1. **Partnerize / P1:** ask P1 or Partnerize to regenerate/repair the configured feeds and confirm comparison-site ingestion/republication is permitted before use. No publisher-side regeneration endpoint appears in the public API reference. Do not build against the dead URLs.
2. **Awin / SportsBreaks:** a bounded enhanced-feed probe found an accessible F1 Authentics UK `en_GB` retail feed, while the equivalent SportsBreaks route returned 404. That only rules out this one enhanced-feed shape; the legacy product-feed list uses a separate key and remains unverified. Preserve the result at [`evidence/awin-enhanced-feed-probe-2026-08-27.json`](evidence/awin-enhanced-feed-probe-2026-08-27.json).
3. **Impact:** search for Ticketmaster campaign availability and review the current contract before any API or link work.[9]
4. **Gootickets:** after account recovery, determine whether the dashboard exposes a feed/API; its public affiliate page alone does not prove one.[10]
5. **Official promoter shops:** add only terms-permitted bounded observations when no partner feed exists; unmonetised official handoffs are still useful.

## Price-intelligence product contract

### Comparable-offer key

An offer is comparable only when these fields match:

- `race_id`
- `session_scope` — race day, Saturday, weekend, multi-day, hospitality
- `grandstand_id` and named section/zone where applicable
- `ticket_class` — adult/child, seated/GA, standard/premium, obstructed/accessibility
- `quantity`

Never compare Saturday-only with weekend, child with adult, standing with seated, hospitality with admission, or base-only with all-in price.

### Required observation fields

```text
provider
source_url
source_method
observed_at
race_id
session_scope
grandstand_id
ticket_class
quantity
currency
base_price
mandatory_fees
all_in_total
availability
fulfilment_restrictions
refund_terms_summary
authorisation_tier
confidence
```

Rules:

- `all_in_total` is the sortable price; if mandatory fees are unknown, the offer is **not eligible** for a “cheapest” badge.
- Store original currency and a timestamped FX conversion separately.
- A failed fetch records `unknown`; it never overwrites the last-known-good observation.
- Show source and observation time to users. Do not call a price “live” unless the refresh cadence justifies it.
- Separate official/promoter, authorised reseller, bonded package operator, and unverified/secondary tiers. The last tier is excluded from recommendation ranking.
- Affiliate status affects disclosure and attribution, not recommendation order.

## Operational pilot

The earlier **3 races × 4 grandstands × 3 sources** scope is only a smoke test for schema, adapter, and mapping failures. It is not the price-intelligence pilot.

The pilot is bounded by **source adapters and comparison behaviour, not by an arbitrary race cap**:

- ingest every currently on-sale Formula 1 and MotoGP race exposed by the admitted sources;
- ingest every named grandstand/zone and session class those sources expose, rather than sampling four;
- start with at least four independent official or authorised source families, including official/promoter inventory and authorised resellers;
- include unmonetised official inventory when it improves coverage;
- admit a source only when its terms and technical method permit the observation.

Admission floor—below this, continue calling it an integration harness rather than a pilot:

- at least 20 races across Formula 1 and MotoGP;
- at least 200 canonical ticket variants (`race × session × grandstand/zone × class`);
- at least 500 provider offers observed;
- at least 100 canonical variants with two or more genuinely comparable provider offers;
- at least four independent source families and three currencies;
- weekend, race-day, general-admission, named-grandstand, and hospitality classes represented but ranked only within their own class.

The first post-admission expansion cohort is every technically and contractually viable Formula E, IndyCar, and WEC race. Expansion is coverage-driven: do not wait for an arbitrary date, but do not lower comparison-integrity gates to add a series.

Cadence:

- daily by default;
- increase to every 6 hours only around on-sales or low-stock periods and only within source limits;
- exponential backoff on failures;
- source-level circuit breaker after repeated auth/format failures.

Pilot success:

- at least 90% successful scheduled observations after every adapter has completed 30 scheduled checks;
- zero cross-class “cheapest” comparisons;
- mandatory-fee status visible for every ranked offer;
- source timestamp visible;
- fewer than 5% mapping corrections after stratified manual review;
- false price-change alerts below 10%;
- useful unmonetised official handoffs count as product-value evidence.

Kill or pause if:

- lawful/authorised observation cannot be established;
- providers cannot be normalized without misleading users;
- fee opacity makes all-in comparison impossible;
- false changes exceed 10%; or
- the system silently serves stale prices.

## Source-policy ladder

1. Current authorised API or contracted feed.
2. Sanctioned public feed, widget, or documented deep-link API.
3. Public official/promoter page with terms-permitted bounded monitoring.
4. Authenticated portal only after explicit automation permission and a read-only, exact-host scope.
5. Never bypass bot controls, capture session tokens from HARs, automate checkout, or use unofficial secondary inventory.

A HAR-derived client is a last-mile adapter, not permission. Before building one, record allowed hosts, methods, resource types, auth boundary, rate limit, redactions, and sunset conditions.

## Concrete sequence

1. Build a private read-only partner-health collector for the three verified networks.
2. Get P1/Partnerize to regenerate the 18 configured feeds and finish the SportsBreaks feed-capability probe.
3. Define canonical race/session/grandstand mappings in code and test them against existing PitLane data.
4. Implement a monitor adapter interface plus an immutable observation table.
5. Use 3 races × 4 grandstands × 3 sources only as a pre-pilot smoke test.
6. Admit the operational pilot only when the breadth floor above is met; ingest every current F1 and MotoGP product exposed by admitted sources.
7. Publish only after comparison integrity, staleness, source attribution, and fee handling pass review.
8. Add alerts after the observation layer is trustworthy; monetize only after demand and hosting/commercial gates are satisfied.

## Sources

[1] https://integrations.impact.com/partner-api-reference/reference/programs/programs — Impact Programs API v16
[2] https://integrations.impact.com/partner-api-reference/reference/catalogs/catalogs — Impact Catalogs API v16
[3] https://integrations.impact.com/partner-api-reference/reference/ads/ads — Impact Ads API v16
[4] https://integrations.impact.com/partner-api-reference/reference/reports/reports — Impact Reports API v16
[5] https://developer.awin.com/apidocs/introduction — Awin API introduction
[6] https://developer.awin.com/apidocs/generatelink — Awin Link Builder API
[7] https://developer.awin.com/apidocs/gets-an-array-of-commission-groups-for-an-advertiser — Awin commission groups API
[8] https://docs.partnerize.com/Publisher_API_Guide_EN.pdf — Partnerize Publisher API Guide
[9] https://developer.ticketmaster.com/partners/distribution-partners/affiliate-sign-up — Ticketmaster affiliate programme
[10] https://www.gootickets.com/en/p-31-affiliate-program — Gootickets affiliate programme
[11] https://api-docs.partnerize.com/partner/ — Partnerize Partners API reference
