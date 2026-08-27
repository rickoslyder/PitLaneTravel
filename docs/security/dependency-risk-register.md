# Production dependency risk register (PLT-005)

Date: 2026-08-27.

This is the PLT-005 production-dependency triage record. It is not a
production-build certificate and it is not a Preview/CI check. It does not
change product behavior, auth, routing, env, or database code.

Remediation was generated in a throwaway `/tmp` sandbox from copies of
`package.json` / `package-lock.json` using `npm audit fix --package-lock-only
--ignore-scripts --omit=dev` and `npm install --package-lock-only
--ignore-scripts`. Those commands were **not** run in the worktree (its
`node_modules` is a symlink). Local evidence JSON is
`/tmp/plt005-audit-before.json` and `/tmp/plt005-audit-after.json` and is not
committed. CI already preserves `npm audit --omit=dev --json` separately.

## Baseline (lock at `acbd9add7260ba35edf01cdb6449458a070c2765`)

Observed 2026-08-27 by `npm audit --omit=dev --json` against the unmodified
lockfile.

| Field | Value |
|---|---|
| `next` | 15.5.22 |
| `eslint-config-next` | 15.5.22 |
| `axios` | 1.7.9 |
| `nanoid` | 5.0.9 |
| `postcss` (hoisted) | 8.4.49 |
| `postcss` (nested under `next`) | 8.4.31 |
| `sharp` | 0.34.5 |
| `drizzle-orm` | 0.33.0 |
| Audit total | 41 |
| Critical | 1 |
| High | 16 |
| Moderate | 17 |
| Low | 7 |

Critical: `form-data` 4.0.0–4.0.5
([GHSA-fjxv-7rqg-78g4](https://github.com/advisories/GHSA-fjxv-7rqg-78g4),
[GHSA-hmw2-7cc7-3qxx](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx)).

High families on that baseline included `axios`, `@clerk/backend` /
`@clerk/shared` / `js-cookie`, `nanoid`, `ws`, `lodash`, `glob` / `minimatch` /
`brace-expansion` / `picomatch` / `editorconfig`, Next via `postcss` + `sharp`,
and `drizzle-orm`.

## Post-remediation (same date, regenerated lock)

`npm audit --omit=dev --json` after the sandbox regeneration:

| Field | Value |
|---|---|
| Audit total | 12 |
| Critical | 0 |
| High | 1 |
| Moderate | 7 |
| Low | 4 |
| Untriaged critical/high | 0 |

Locked production-relevant versions (exact, from `package-lock.json`):

| Package | Locked version |
|---|---|
| `next` | 15.5.24 |
| `eslint-config-next` | 15.5.24 |
| `axios` | 1.20.0 |
| `nanoid` | 5.1.16 |
| `postcss` (only installed copy) | 8.5.26 |
| `sharp` | 0.35.4 |
| `drizzle-orm` | 0.33.0 |
| `lodash` | 4.18.1 |
| `form-data` | 4.0.6 |
| `@clerk/backend` | 1.34.0 |
| `@clerk/shared` | 3.47.8 |
| `glob` | 10.5.0 |
| `picomatch` | 2.3.2 |
| `editorconfig` | 1.0.7 |
| `js-cookie` | 3.0.7 |

Direct declarations in `package.json`: `next` `^15.5.24`,
`eslint-config-next` `^15.5.24`, `postcss` exact `8.5.26`, `drizzle-orm`
unchanged at `^0.33.0`. No `--force`. No major direct-dependency upgrade.

### Next 15.5.24 and the Next high

Official npm packument `time["15.5.24"]` observed 2026-08-27:
`2026-08-25T16:14:06.715Z`. GitHub release API/page
https://github.com/vercel/next.js/releases/tag/v15.5.24
`published_at` `2026-08-25T16:16:55Z`. The release page states v15.5.24
contains security fixes for the two critical repository advisories below.

Direct GitHub repository security advisory API returned HTTP 200 on
2026-08-27 for both:

- [GHSA-p293-qw3h-jr36](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36)
  — critical; `published_at` `2026-08-25T16:15:42Z`; affected
  `>=13.4 <15.5.24` and `>=16.0 <16.3.3`; patched `15.5.24` and `16.3.3`.
- [GHSA-2xp9-vwfh-vxw4](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4)
  — critical; `published_at` `2026-08-25T16:16:28Z`; affected
  `>=10.0.0 <15.5.24` and `<16.3.3`; patched `15.5.24` and `16.3.3`.

The candidate locks `next` `15.5.24`, which is in both patched ranges, so
both critical Next advisories are cleared. Baseline lock had `next`
`15.5.22` (in both affected ranges). 15.5.24 is the highest 15.x release
published at remediation time. After locking 15.5.24 plus patched
`sharp`/`postcss`, `npm audit --omit=dev` no longer reports `next` as a
production high.

Next 15.5.24 still *declares* `postcss` `8.4.31` and accepts
`sharp` `^0.34.3 \|\| ^0.35.3` (observed on the 15.5.24 lock entry). npm's
non-force fix for the Next high otherwise points at `next@16.3.3`
(`isSemVerMajor: true`) because of those transitives.

### PostCSS override (required)

Official PostCSS high
[GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q)
(CVE-2026-45623) is patched `>=8.5.12`. Related later PostCSS advisories on
the same sourceMappingURL path:
[GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849)
(patched `>=8.5.18`) and
[GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp)
(patched `>=8.5.23`). Medium stringify XSS
[GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93)
is patched `>=8.5.10`. npm latest observed: `8.5.26`.

`npm audit fix --package-lock-only --omit=dev` hoisted `postcss` to `8.5.26`
but left `node_modules/next/node_modules/postcss` at `8.4.31`. That nested
copy kept a production high and made npm claim the only fix was Next 16.

Mechanism: pin the existing direct `devDependency` `postcss` to exact
`8.5.26` and set `overrides.postcss` to `$postcss`, then regenerate the lock
with `--package-lock-only --ignore-scripts`. Result: a single installed
`postcss` at `8.5.26` (`https://registry.npmjs.org/postcss/-/postcss-8.5.26.tgz`).
No nested `next` postcss copy remains. Next 15.5.24's declared `8.4.31`
string is still in its lock metadata; it is not an installed package.

### Sharp

Official
[GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj)
is patched `>=0.35.0`. npm latest observed: `0.35.4`. Non-force audit fix
resolved `sharp` to `0.35.4` within Next 15.5.24's optional range. No sharp
override.

## Remaining high: drizzle-orm — triaged-deferred, not silently accepted

npm audit still reports **one** production high. That finding is **triaged
and deferred** with an owner, rationale, mitigation, and expiry. It is not
an untriaged advisory and it is not a silent accept.

| Field | Value |
|---|---|
| Package | `drizzle-orm` |
| Current locked / declared | `0.33.0` / `^0.33.0` |
| Patched version named by npm / GHSA | `0.45.2` |
| Advisory | [GHSA-gpj5-g38j-94v9](https://github.com/advisories/GHSA-gpj5-g38j-94v9) (CVE-2026-39356), high |
| npm fix | `npm audit fix --force` would install `drizzle-orm@0.45.2` (`isSemVerMajor: true`) |
| Status | **triaged-deferred** |
| Owner | PitLane Travel engineering owner |
| Expiry | Milestone B, **2026-09-06** |

### Official reachability (advisory)

https://github.com/advisories/GHSA-gpj5-g38j-94v9

Drizzle ORM `<0.45.2` improperly escaped quoted SQL identifiers in
dialect-specific `escapeName()`. Attacker-controlled input that reaches
identifier or alias construction (`sql.identifier()`, dynamic `.as()`) can
terminate the quoted identifier and inject SQL. The advisory states
applications that use only static schema objects, or that strictly map user
input through an allowlist of known column or alias names, are **not
affected**.

### Codebase reachability (this repository, 2026-08-27)

- No `sql.identifier(` and no `.as(` in `*.ts` / `*.tsx`.
- No `sql.raw(` .
- Database access uses static Drizzle schema objects plus parameterized
  values (`eq`, `and`, `inArray`, and similar).
- `scripts/apply-sql-migrations.ts` uses postgres.js `sql.unsafe` only to
  apply repository-authored numbered SQL files under `db/migrations/`
  (0003+). That path is not request input and is not Drizzle
  `sql.identifier()` / `.as()`.

Disposition: the GHSA class is **not reachable** in current source. Keeping
`0.33.0` is a compatibility hold, not a claim that the advisory is
irrelevant.

### Mitigations until expiry

1. Do not add `sql.identifier()`, dynamic `.as()`, or other identifier/alias
   construction from runtime or request input.
2. Keep queries on static schema objects and parameterized values.
3. Keep `apply-sql-migrations.ts` limited to repository-authored migration
   files.
4. Treat new identifier/alias construction from untrusted input as a
   fail-closed review reject.

### Follow-up acceptance (dedicated work item; not this slice)

- Upgrade `drizzle-orm` to `>=0.45.2` with a compatible `drizzle-kit`, **or**
  complete an explicit re-review that records a new expiry.
- Compatibility tests covering schema, journalled migrations, and
  `db:migrate-sql`.
- Existing public routes, auth, tests, and production build remain the
  acceptance bar for that follow-up.

### Fail-closed after 2026-09-06

No silent rollover. After Milestone B expiry the engineering owner must
either complete the `>=0.45.2` upgrade (with compatibility tests) or publish
an explicit re-review with a new expiry. Absence of that action is a
register breach, not an implicit extension.

This record does not claim personal approval by Richard.

## Isolated major lanes (not opened here)

Do not treat these as existing GitHub issues.

**Drizzle `0.45.2`.** npm classifies the jump from `0.33.0` as a semver-major
force-fix. 0.x ORM compiler/query/kit changes need their own compatibility
tests (schema, migrations, SQL 0003+). The GHSA is triaged-deferred above;
this slice keeps `0.33.0`.

**Next `16.3.3`.** npm's non-override path for the baseline Next high is
`next@16.3.3` (`isSemVerMajor: true`). Next 16 is an App Router / runtime
major and is **not required** for this patch: `next@15.5.24` plus patched
transitive `sharp` (`0.35.4`) and `postcss` (`8.5.26` via override) clears
the Next production high while staying on major 15.

## Residual moderate / low (semver-major remediation only)

After remediation, `npm audit --omit=dev` reports 7 moderate and 4 low.
npm's listed fixes for every remaining finding are semver-major
(`isSemVerMajor: true` or `--force` to a new major). This register does
**not** claim they are unreachable; it only records that this slice does not
take those majors.

Moderate families:

| Family | npm's named major fix | Advisory when present |
|---|---|---|
| `ai` / `jsondiffpatch` | `ai@7.0.83` | [GHSA-rwvc-j5jr-mgvh](https://github.com/advisories/GHSA-rwvc-j5jr-mgvh), [GHSA-33vc-wfww-vjfv](https://github.com/advisories/GHSA-33vc-wfww-vjfv) |
| `@react-email/components` / `@react-email/code-block` / `prismjs` | `@react-email/components@1.0.12` | [GHSA-x7hr-w5r2-h6wg](https://github.com/advisories/GHSA-x7hr-w5r2-h6wg) |
| `react-syntax-highlighter` / `refractor` / `prismjs` | `react-syntax-highlighter@16.1.1` | [GHSA-x7hr-w5r2-h6wg](https://github.com/advisories/GHSA-x7hr-w5r2-h6wg) |

Low family: `@ai-sdk/openai` / `@ai-sdk/provider-utils` / `@ai-sdk/react` /
`@ai-sdk/ui-utils` — npm names `ai@7.0.83` or `@ai-sdk/openai@4.0.50`.
[GHSA-866g-f22w-33x8](https://github.com/advisories/GHSA-866g-f22w-33x8).

## What this slice does not claim

- No production build, public-route smoke, or fresh `npm ci` was run against
  the new lock in this worktree. Parent / Aegis / CI own those gates on a
  fresh install.
- `node_modules` in this worktree remains a symlink to the pre-PLT-005
  install. Any `npm run check` here exercises **old** `next@15.5.22`
  binaries, not 15.5.24.
- No credentials, tokens, or account identifiers are recorded here.
