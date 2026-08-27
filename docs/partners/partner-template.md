# Partner record template (PLT-057)

Reusable, fail-closed form for one PitLane Travel commercial handoff or supplier pathway.

Copy this file (or this section) per party. Fill every field. Do not skip axes.

Canonical inventory: [`partner-register.md`](partner-register.md).

## Hard rule

**Absent evidence cannot be converted into claims or production enablement.**

- If the current agreement or dashboard was not read, the field is **`blocking unknown`**.
- Do not write “TBD”, “n/a unless…”, “industry standard”, or a guessed value.
- Historical welcome ≠ current terms.
- A contract-change / legal-update notice ≠ current agreement (even if it mentions that rates or reporting changed).
- Accepted account ≠ product-enabled integration ≠ current terms verified ≠ commercially approved.
- A generic untagged external handoff is not an enabled affiliate partner.
- A configured-off supplier API is not an enabled merchant pathway.
- Industry norms are not evidence.
- State an **evidence cut-off / read date**. This register slice is cut off at **2026-08-27**.
- `negative-search` covers only the **available Gmail account** and the **available Hermes operator vault**. It does **not** prove that no account or evidence exists in inaccessible dashboards, other vaults, or other mailboxes. Scoped absence remains **blocking**, not a global nonexistence claim.

Do not product-enable, and do not publish a rate or attribution capability, until this record is `current-agreement-verified` **and** the owner has signed the activation block.

## Confidentiality

Store **no** credentials or contract-confidential payloads in Git.

Forbidden in this record and in any Git path:

- login names;
- publisher / account / affiliate IDs;
- message IDs, Drive IDs/URLs;
- exact commission rates, payout thresholds, confidential contract clauses;
- tracking query strings, redirect slugs;
- sensitive partner contacts;
- secret-like placeholders that imply a withheld identifier or rate.

Allowed when operationally useful: public provider/program names and public root hostnames.

Confidential details stay in the account holder’s private systems. Git records only the **existence class** of evidence (for example `historical-onboarding`, `notice-only`, `negative-search`) and non-confidential operational facts.

## Lifecycle axes (all required; do not collapse)

| Axis | Allowed values | Notes |
|---|---|---|
| Account / application | `none` / `requested` / `accepted-historical` / `supplier-customer` / `unverified-candidate` | Acceptance is not enablement. |
| Product enablement | `product-enabled` / `not-product-enabled` | Fail-closed definition below. |
| Current terms | `unverified` / `historical-welcome-only` / `notice-only` / `current-agreement-verified` | Only the last permits capability claims. |
| Commercial approval | `not-commercially-approved` / `owner-approved` | Owner-approved requires verified current terms plus the activation block. |

**Product-enabled** means current production presents a live **attributed** commercial handoff to this party, observed in production. Observation of a hostname, a historical seed, or an accepted account does not by itself verify current terms.

## Evidence (required before any claim)

| Field | Value |
|---|---|
| Evidence cut-off / read date | YYYY-MM-DD. This register slice: **2026-08-27**. Date the source was read, not the date the email was sent, unless they coincide and you say so. |
| Evidence source class | `production-observed` / `repository-audited` / `historical-seed` / `historical-onboarding` / `current-messaging-not-terms` / `notice-only` / `negative-search` / `absent` — plus a human `current-dashboard` / `current-agreement` class when those were actually read |
| Evidence date | YYYY-MM-DD of this artefact (must be on or before the cut-off unless a later dated amendment is added). |
| What was read | Exact artefact class (production browser, bounded GET hostnames only, current dashboard, current agreement, historical welcome, notice, **available Gmail** / **available Hermes operator vault** negative search, repository path). No IDs. |
| What was **not** read | Explicit. If the dashboard was not opened, write that. |
| Reviewer | Human name/role. Agent-authored inventory is not current-terms verification. |

A field may cite historical evidence **only** when labelled historical. Current capability requires current-dashboard or current-agreement evidence dated on this form.

A `none` or `negative-search` result is scoped absence in the sources actually searched. It is not proof of global nonexistence and remains blocking.

## Record

- **Party name:**
- **Program / network (public name only, or blocking unknown):**
- **Register date:**
- **Evidence cut-off / read date:**
- **Issue / gate this row serves:**

### Account / application status

- Value:
- Evidence source / date:
- Notes (non-confidential):

### Product enablement

- Value (`product-enabled` / `not-product-enabled`):
- Production observation (hostnames/statuses only, or “none found”):
- Repository path(s) or “no integration found”:
- Evidence source / date:

### Offer classes

- Historical (label historical or write “none evidenced”):
- **Current (current agreement/dashboard, or `blocking unknown`):**

### Regions / series

- Historical (label historical or write “none evidenced”):
- **Current (or `blocking unknown`):**

### Attribution / sub-ID support

- Historical (label historical or write “none evidenced”):
- **Current (or `blocking unknown`):**
- Sub-ID semantics if currently verified, else `blocking unknown`:

### Deep-link rules

- Historical (label historical or write “none evidenced”):
- **Current (or `blocking unknown`):**

### Reporting lag

- **Current (or `blocking unknown`):**
- A notice that “reporting exists” is not lag.

### Commission / cookie terms

- **Current (or `blocking unknown`):**
- Exact rates/thresholds: **omit**. If a notice says rates differ by status, record that differentiation exists and still write `blocking unknown` for the rate.

### Feed / API format

- Historical parser/seed (label historical or “none evidenced”):
- **Current access/format (or `blocking unknown`):**

### Disclosure requirements

- **Current (or `blocking unknown`):**
- Untagged outbound must not be labelled monetised.

### Contact / renewal date

- **Current (or `blocking unknown`):**
- Do not copy sensitive contacts into Git.

### Last verification

- Date:
- Source classes:
- Evidence quality (which axes are current vs historical vs absent):

### Blockers / next action

- What is blocking unknown:
- What would unblock (current dashboard/agreement read, owner activation, or approved disable):
- This row does **not** close PLT-057 / Gate C by itself.

## Activation (product-enable or keep enabled)

Complete **all** of the following. Missing any item forbids enablement.

1. Current terms axis is `current-agreement-verified` with evidence date and human reviewer.
2. Every issue field above is either a non-confidential verified current fact or an explicit `blocking unknown` that the owner has accepted as **not required for this activation** (default: unknowns **block**).
3. Product code will claim only capabilities present as current on this record.
4. Owner activation sign-off recorded in `DECISIONS.md` (date, party, what is enabled, what remains unknown).
5. Rollback owner and disable path named below.

- Owner:
- Date:
- Decision (`activate` / `refuse` / `defer`):
- Capabilities actually activated:
- Remaining blocking unknowns (must stay blocking unless the owner explicitly accepted them):

Default if this block is empty: **not enabled / not commercially approved**.

## Disable / rollback

Use a **separate approved change**. This template does not disable a live path by being filled.

| Step | Action |
|---|---|
| Disable | Stop the attributed production handoff (or merchant flag). Do not invent terms to keep it on. Inventory display without attribution is a different product decision. |
| Rollback | Revert the enablement change. Do not restore a path whose current terms have since become unverified. |
| After disable | Set product enablement to `not-product-enabled`. Account/terms axes stay as evidenced. |
| GitHub | Disabling the sole unverified product-enabled attributed path, **or** verifying that path’s current agreement/dashboard, is what allows PLT-057 / #8 to be closed. Filling this template is not closure. |

- Disable owner:
- Disable date / change:
- Rollback owner:

## Sign-off

| Role | Name | Date | Verdict |
|---|---|---|---|
| Evidence reviewer (human, dashboard/agreement) | | | `verified` / `not reviewed` |
| Owner (activation / refuse / defer) | | | |
| Agent (inventory only; cannot verify current terms) | | | `inventory only` |

If evidence reviewer is `not reviewed`, current capability claims are forbidden and product enablement is forbidden (except recording an already-live path as `product-enabled` **and** `unverified`, which **blocks** PLT-057 acceptance).
