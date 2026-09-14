# IDD Policy Configuration

This repository uses the following IDD policies, confirmed at onboarding
(roadmap #38) and re-affirmed at import time (#32).

## Merge Policy

**Policy**: `fully_autonomous_merge`

## PR Review Policy

**Profile**: `copilot-advisory` (distributed default; no profile
artifact edits needed)

## Review-Thread Resolution Policy

**Policy**: `fast-agent-resolve`

## Critique-Loop Profile

**Profile**: distributed defaults

## Claim Timing

- **claim-stale-age**: 24 h
- **claim-heartbeat-interval**: 12 h

## Forced-Handoff Recovery

**Status**: `forcedHandoff.mode: "human-gated"` (adopted; #125). Before
this change, `.github/idd/config.json` had no `forcedHandoff` field,
which defaults to `disabled` per the policy schema, so a stuck
non-stale claim (an active claim not yet past the 24 h
`claim-stale-age` threshold, but whose owning session is confirmed
gone) had no recovery path short of waiting out the stale-takeover
clock.

**What it enables**: a human-verified exception letting a maintainer
transfer a stuck, non-stale claim through the interactive
`idd-force-handoff` tool, before the 24 h stale-takeover would
otherwise apply.

`forcedHandoff.authorityPolicy` stays at its schema default,
`owners-and-maintainers-only` -- no separate maintainer-authority tier
is configured for this repository.

**Autopilot boundary**: autopilot and unattended agents must never
author the `forced-handoff` marker themselves -- only a human running
the TTY-gated `idd-force-handoff` helper can. Per
`idd-resume.instructions.md`: "Autopilot and unattended agents must
never invent, request, or broaden forced handoff; they may only
consume already-recorded human-gated evidence." An agent asked to
proceed with a forced handoff must report the stalled-claim evidence
back and hand the operator a runnable helper invocation, never post
the marker on the operator's behalf.

## CI Wait Policy

- **running timeout**: `PT30M` / 30 min
- **generation timeout**: `PT10M` / 10 min
- **rerun policy**: `rerun-once`

## Credential Scope

**Worker credentials**: one trusted merge-capable session

**Merge-capable credentials**: same as worker -- worker and merge credentials
are the same set; no separate merge-only actor is configured.

## Helper Runtime Profile

**Profile**: `package-manager`

## Issue-Author Approval Gate

- **Gate posture**: `enabled-by-default`
- **Opt-out state**: gate remains default-enabled (no
  `skipIssueAuthorApprovalGate: true` opt-out)
- **`maintainer-approval-actors` policy**: `owners-and-maintainers-only`
- **Approval signals**: distributed default (configured ready label or a
  standalone `IDD ready` comment)
- **`approvalSignals.readyLabelName`**: `idd:ready`
- **`approvalSignals.labelFreshnessMode`**: `presence-only`
- **Missing-approval behavior**: distributed default (explicit-target
  stop-before-claim + discovery approval-needed fallback bucket)

## Issue-Authoring Companion

**Status**: `installed`, in both `.claude/skills/issue-authoring/` and
`.github/skills/issue-authoring/` -- byte-identical copies (verified with
`diff -r`), so either a Claude Code session or a Copilot-family runtime can
draft IDD-ready issues.

**Two-copy layout**: the two directories must stay byte-identical. Any future
refresh from upstream must update both in the same change. The canonical
source is upstream `kurone-kito/idd-skill`'s `skills/issue-authoring/`, not
either local copy -- treat both local copies as installed artifacts, not the
place to make original edits.

**Prefix-first rule**: an installed bundle must resolve this repository's
marker prefix, `jsonresume-types`, and must never fall back to upstream's own
`idd-skill` prefix. The bundle's own reference docs (`references/contract.md`,
`references/draft-patterns.md`) already warn against that fallback in prose
that travels verbatim with the copy; this section is the repository-local
confirmation of which prefix actually applies here.

- **`issueAuthoring.maxClarificationRounds`**: `3` (default)
- **`issueAuthoring.authoringLabelName`**: `status:authoring` (default)
- **`issueAuthoring.journalIssue`**: `kurone-kito/jsonresume-types#124`
  (resolves #119)

## Worktree Guard

**Status**: `worktreeGuard.enabled: true`. The `.githooks/pre-commit` and
`.githooks/pre-push` hooks refuse a commit or push made from the **primary**
worktree while HEAD is on an implementation branch (`issue/*` or
`roadmap-audit/*`) -- B1 requires that work to live in a sibling worktree.

**One-time local wiring** (per clone -- `core.hooksPath` is local and
uncommitted):

```sh
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit .githooks/pre-push
```

**Fresh-clone caveat**: `worktreeGuard.enabled: true` alone enforces nothing.
A coding agent, ephemeral container, or throwaway checkout starts unwired and
silently unguarded until the command above runs. Re-run it at the start of
every task rather than assuming a previous session's local config survived.

**Enabled-but-inert finding**: `idd-doctor` reports this specific finding when
`worktreeGuard.enabled` is `true` but `core.hooksPath` is not pointed at
`.githooks` in the current checkout. That finding is the signal the setup
step above did not run -- not a false positive to suppress. In practice this
is the common steady state: `core.hooksPath` also drives this repository's
Husky-managed `lint-staged`/`commitlint` hooks (`.husky/pre-commit`,
`.husky/commit-msg`), and `pnpm install`'s `prepare` script resets
`core.hooksPath` back to Husky's directory on every install. Wiring the
worktree guard therefore trades away Husky's git-level enforcement for the
duration it stays wired; re-running `pnpm install` (or the wiring command
again after it) switches `core.hooksPath` back. Neither this repository nor
upstream `idd-skill` (which also ships `worktreeGuard.enabled: true` but
keeps `core.hooksPath` on Husky day to day) resolves this tension by chaining
the two hook sets -- treat the worktree guard as a manually-invoked check
around worktree-sensitive operations, not a permanently co-resident hook.

**Intentional bypass**: `--no-verify` on `git commit` / `git push` is the
single-commit escape hatch for a deliberate exception, so it should never be
mistaken for a broken hook.

## Advisory-Convergence Required Check

**Status**: registered. `idd-advisory-convergence` is a required status check
on the default branch, enforced via GitHub's Rulesets API rather than classic
branch protection -- the `main` ruleset (id `20745987`) pins the check via
`integration_id: 15368`, with `strict_required_status_checks_policy: false`
and `bypass_actors: []` (the `enforce_admins: true` equivalent -- the check
applies to admin merges too, including a trusted merge-capable session's
own). The same ruleset's `required_status_checks` array also lists three
build-matrix jobs, one exact context per Node.js version --
`The build process (22.x, ubuntu-latest, bash)`,
`The build process (24.x, ubuntu-latest, bash)`, and
`The build process (26.x, ubuntu-latest, bash)` -- same
`integration_id: 15368`, alongside `idd-advisory-convergence`. This is
expected under the `matches` inclusion-check semantics documented below,
but recorded here so a future reader doesn't assume `idd-advisory-convergence`
is the *only* required check on this ruleset. Verify the pinned check and
its strict-policy flag with:

```sh
gh api repos/kurone-kito/jsonresume-types/rules/branches/main \
  --jq '.[] | select(.type == "required_status_checks" and .ruleset_id ==
  20745987) | .parameters | {matches: (.required_status_checks |
  any(.context == "idd-advisory-convergence" and .integration_id ==
  15368)), strict: .strict_required_status_checks_policy}'
```

Confirm the response is `{"matches": true, "strict": false}`. This endpoint
returns every active rule from **every** ruleset that matches `main`, each
tagged with its own `ruleset_id` -- filtering on `.ruleset_id == 20745987`
ties the confirmed rule specifically to this ruleset, rather than letting a
required-check rule from a *different* matching ruleset satisfy the check
while the separate bypass-actors call below verifies ruleset `20745987`
alone (which would leave the two calls unintentionally describing two
different rulesets). `matches` is an **inclusion** check, not a per-entry
equality: it asks whether this ruleset's `required_status_checks` array
contains an entry pinned to `idd-advisory-convergence` with
`integration_id: 15368`, rather than asserting every entry in the array
matches -- the array may hold other required checks alongside this one.
The `integration_id` half of that check matters on its own: a
differently-sourced check that merely shares the `idd-advisory-convergence`
name would satisfy a bare context match, defeating the source pin this
repository's fail-closed required-check handling relies on. `strict`
confirms `strict_required_status_checks_policy`.

Separately confirm the no-bypass condition on the ruleset itself:

```sh
gh api repos/kurone-kito/jsonresume-types/rulesets/20745987 \
  --jq '{bypass_actors, current_user_can_bypass}'
```

Confirm `bypass_actors` is explicitly returned as an empty array. GitHub only
includes this field for a caller with write access to the ruleset, so an
**omitted** field means the check is unverifiable for that caller, not
confirmed empty -- treat it accordingly rather than assuming no-bypass. (The
ruleset-detail endpoint above does return both `rules` and `bypass_actors`
together for a write-access caller, so the two calls above aren't required by
a field split; they answer two different questions. `rules/branches/main`
reports the branch's **effective** required-check rule, aggregated across
every matching ruleset, and never exposes `bypass_actors` at all.
`rulesets/{id}` reports this **one** ruleset's own configuration, including
its bypass actors.)

`strict_required_status_checks_policy: false` means a PR that is merely
`BEHIND` `main` (no content conflict) is not required to update to the
latest base before merge -- it lifts only that one gate, never a promise
of mergeability on its own, since required checks, reviews, and the
advisory-convergence gate can all still independently block the merge.
This is exactly the condition the E-phase branch-sync check and
F1 already gate their own `behind-no-conflict` routing on ("when branch
protection or recorded repository policy requires an up-to-date head");
this ruleset does not impose that requirement, so that up-to-date-head
routing condition is not triggered under normal, successfully-read
ruleset operation for this repository. This does not retire the
fail-closed exception both checks also gate on: an unreadable or
ambiguous protection/ruleset read still routes through the same
sync-required path regardless of this ruleset's actual configured value.
Live-reverified during the
v0.11.0 re-import (roadmap #102, #110); see "v0.11.0 Re-import Notes"
below.

Two behaviors to expect, both by design:

- The check **shows as failing** until the advisory reviewer reviews the
  current HEAD. The workflow's own script always exits pass or fail -- it has
  no separate pending outcome -- so the check stays red rather than sitting
  in an in-progress state until convergence.
- A stale review (one that predates the current HEAD, e.g. after a
  force-push-free follow-up commit) reads as unconverged, not merely
  outdated; re-request review or push a change that prompts a fresh one.

**Waiver mode**: intentionally left off. `ciGate.externalCheckWaivers.mode`
is unset in `.github/idd/config.json`, and `idd-advisory-convergence` is not
listed under `ciGate.externalChecks.waivable`. A stuck advisory-convergence
check therefore has no maintainer-waiver escape path -- the only way through
is a fresh converged review. Revisit this decision if the `24h` default
`advisoryWait.convergenceDeadline` proves too tight in practice.

## Advisory-Wait Bot Exemption

**Status**: `advisoryWait.exemptBotAuthoredPrs: true` (added during the
v0.6.0 re-import, commit `9066d7518881a7f78280e7ad199734e887d6fbd5`,
Refs #66). `.github/idd/config.json`
also sets `advisoryWait.convergenceScope: "all-prs"`, so the
`idd-advisory-convergence` required check normally applies to bot-authored
PRs (e.g. Dependabot) too, on the same terms as agent-authored PRs. This
repository's active Dependabot PRs predate any IDD claim-marker history, so
they have no claim for the check's review-currency machinery to resolve
against. The exemption skips requiring manual maintainer intervention for
bot-authored PRs specifically -- this repository's advisory-convergence
check has no waiver mechanism at all (see "Waiver mode" above), so without
the exemption those PRs would stay permanently blocked on a check they were
never claimed under, with no escape path.

## Known `idd-doctor` Warnings

`idd-doctor --strict` has reported the findings below as intentional,
explained divergences rather than unresolved defects. Both trace to the
import verification pass, issue #37. A third finding, added later after
a mid-session ruleset migration, was resolved and relocated to "v0.11.0
Re-import Notes" below -- see that section for its resolution evidence.
The v0.11.0 re-import verification pass (#110) re-ran `idd-doctor --strict`
and found **zero** warnings (see "v0.11.0 Re-import Notes" below for the
reproduced output); the two bullets below did not fire in that run either,
but remain recorded as still-live, currently-quiet mechanisms rather than
resolved findings -- see each bullet's own current-run note.

- **`post-merge cleanup backlog`** -- predates both the IDD import and the
  `post-merge-cleanup.yml` adoption below. The check scans a rolling
  recent-merge window (`idd-doctor`'s default: the last 14 days), so its
  example PRs and count shift over time rather than naming a fixed
  historical range; any PR that merged before the F4 cleanup-evidence
  marker convention existed in this repository (before #32) never carries
  it regardless. This repository has since adopted the optional
  server-side `post-merge-cleanup.yml` workflow (issue #67, PR #74, part of
  `idd-skill` v0.6.0's core template set -- no longer something upstream
  ships only in the `idd-skill` source repository itself), which
  server-side-posts the F4 cleanup-evidence comment whenever the merging
  agent's own F4 step does not. Adoption stops the backlog from growing
  further going forward; it does not by itself retroactively clear the
  pre-existing backlog -- someone would still need to run
  `idd-audit-pr-cleanup --pr <N> --apply --skip-claim-check` against each
  listed PR to close that out (re-run `idd-doctor --strict` for the current
  count and example PRs, rather than trusting a number recorded here). The
  v0.11.0 re-import verification pass (#110) re-ran the check -- the
  rolling 14-day window held 10 merged PRs on IDD branch patterns at that
  time (non-IDD merges in the same calendar window, such as Dependabot
  PRs, are excluded from this count by design) -- and found zero PRs
  currently missing evidence -- a transient zero-count consistent with
  the "shifts over time" behavior above, not a change to the mechanism
  itself.
- **`release-tag drift`** -- out of scope for the IDD import. Cutting a new
  release is roadmap #46's concern (`Roadmap: restore the release pipeline
  and the package's quality gates`), not #38's. This document does not track
  release cadence. This check compares `HEAD` against the latest
  **reachable** git tag only (`git describe --tags --abbrev=0`; commit
  count and tag-commit age), never `package.json`'s own `"version"`
  field -- it warns past 100 commits or 45 days since the tag.
  At v0.11.0 re-import verification time (#110), `HEAD` was 63 commits and
  about 32 days past the latest tag (`v0.6.0`), both under threshold, so no
  drift was observed -- also a transient zero-count, not a change to scope.

## v0.6.0 Re-import Notes

Recorded during the `idd-skill` v0.6.0 re-import (roadmap #64) so a future
pass does not need to re-investigate the same ground:

- **Pin reference**: `package.json` pins `@kurone-kito/idd-skill` to
  `github:kurone-kito/idd-skill#f16660486383ce710a0f33f49aa3331ddece93de`,
  which is the commit the `v0.6.0` tag resolves to. Future re-imports
  should target the next named tag rather than an arbitrary `main` commit.
- **`helperRuntime.packageSpec`** -- evaluated, not applicable. This flag
  only affects the `ephemeral-npx` profile; this repository uses
  `package-manager`.
- **`ciGate.trustSourcePinnedRequiredChecks`** -- evaluated: a
  source-pinned required check now does exist (`idd-advisory-convergence`,
  pinned to `integration_id: 15368` on the `main` branch-protection
  ruleset, id `20745987`, added after the mid-session migration from
  classic branch protection to GitHub rulesets -- see #75 for the full
  writeup). The flag itself stayed unset (fail-closed default `false`) at
  re-import time, pending out-of-band verification of the pinned
  integration's producer identity. That verification completed and the
  flag is now set to `true` (#87): `integration_id 15368` is GitHub's own
  built-in "GitHub Actions" app, and exactly one workflow file in this
  repository produces the `idd-advisory-convergence` check-run name, so
  `idd-pre-merge-readiness`/`idd-ci-wait-state` no longer downgrade that
  check once it is otherwise passing -- each helper's own fail-closed
  label is unchanged (`unknown` in `idd-pre-merge-readiness`,
  `"source-pinned"` in `idd-ci-wait-state`); only the downgrade itself
  stops firing for this check.
- **`ciGate.trustEmptyProtectionReads`** -- evaluated: the classic
  branch-protection endpoint
  (`GET /repos/{owner}/{repo}/branches/main/protection`) has been
  returning `404` with the specific body `"Branch not protected"` since
  `main`'s protection migrated from classic protection to the ruleset
  described above (see #75). Per this repository's fail-closed default,
  that ambiguous `404` blocked `idd-pre-merge-readiness`/
  `idd-merge-execute`'s own required-check read on every PR since the
  migration (confirmed live on #88's own merge-readiness evaluation,
  which needed a manual live-state override), reporting `cannot
  determine required checks: protection/ruleset unreadable` even when
  the actual required check was independently confirmed green.
  Out-of-band verification completed (#89): the `404` body is the
  genuine-absence shape, not a generic not-found; and the same
  automation token successfully reads the comparably-or-more-sensitive
  Rulesets endpoints (`rulesets/20745987`, `rules/branches/main`) for the
  same branch, with no permission-masking pattern observed anywhere. The
  flag is now set to `true`: per `fetchGovernanceJson`'s implementation
  (`idd-skill`'s `pre-merge-readiness.mjs`), the opt-in trusts **any**
  `404` -- regardless of response body -- from **all three** governance
  reads (`rules/branches/{base}`, each matched ruleset detail, and the
  classic `branches/{base}/protection` endpoint) as a genuinely-empty
  result, not narrowly the classic endpoint's exact observed shape; the
  verified `"Branch not protected"` response above is the
  repository-specific evidence that justified enabling this broader
  opt-in, not the boundary of what it trusts. This is independent of
  `trustSourcePinnedRequiredChecks` above -- that flag trusts a *named,
  present* required check's producer identity, while this one trusts a
  `404` read itself as genuinely-empty protection/ruleset configuration
  rather than a masked permission failure.

## v0.11.0 Re-import Notes

Recorded during the `idd-skill` v0.11.0 re-import -- roadmap #102, tracks
issue #103 through issue #109 inclusive, closed out by this
reconciliation issue #110 whose own acceptance scope is this policy
document only. The independent helper-wiring track #122 is already
applied to the assembled state below, but is neither blocked by nor
blocking #110. Recorded so a future pass does not need to
re-investigate the same ground:

- **Peeled release pin**: `package.json` pins `@kurone-kito/idd-skill` to
  `github:kurone-kito/idd-skill#1f90787ebf4021673ce6e5eb69741df331fd2037`
  -- the commit the `v0.11.0` tag resolves to (#103, PR #116).
- **Post-release `main` fix, ported manually**: upstream commit
  `adad8ae43c5a1b6fc3a100ce384c8a84a8d5139d` ("fix(ci): grant
  pull-requests:write to advisory self-waiver job") lands 13 commits after
  the pinned tag, so it is not carried by the dependency pin. Ported by
  hand into `.github/workflows/idd-advisory-convergence.yml` (#106, PR
  #120), independently verified against the GitHub API before being
  trusted.
- **`mergePolicyAck`**: `"fully_autonomous_merge"`, matching `mergePolicy`
  -- recorded in `.github/idd/config.json` (#103, PR #116).
- **`developmentBranch: "main"`**: confirmed live by the upstream hearing
  wizard (roadmap #102) and recorded in `.github/idd/config.json` (#103,
  PR #116).
- **Issue-mediated bootstrap choice**: the hearing wizard confirmed an
  issue-mediated re-import over a single blind bulk overwrite; roadmap
  #102 itself, decomposed into tracks #103-#109 (independent except
  #106's dependency on #103) plus this closing track (#110) and the later
  #122 helper-wiring gap-fix, is the concrete instance of that choice.
- **Confirmed helper/runtime/approval policies** (reconfirmed unchanged
  from the v0.6.0-era values already recorded above in this document):
  `helperRuntime.profile: "package-manager"`,
  `maintainerApprovalActorPolicy: "owners-and-maintainers-only"`,
  `reviewPolicy: "copilot-advisory"`.
- **Claude Code permission baseline** (#109, PR #114; narrowed by #115, PR
  #121): `.claude/settings.json` was added, based on upstream v0.11.0's
  opt-in template, with two authorized deltas over upstream -- allowing
  `Bash(gh pr merge*)` and dropping two `idd-merge-execute.mjs` deny
  entries (this repository's `fully_autonomous_merge` policy makes the
  upstream default-off denial inapplicable), and a rewritten `$comment`
  explaining that override. A follow-up (#115, PR #121) then narrowed
  three upstream-inherited Bash-prefix-matching gaps named in #115
  (`git diff*` vs. `difftool --extcmd`; `git branch -v*` vs. a `-D`
  bypass; `git fetch origin*` vs. `--upload-pack`). While fixing the
  third of those, PR #121's own review found a fourth, previously
  unnamed gap (`git fetch origin*` also prefix-matching an untrusted
  remote name merely starting with `origin`, e.g. `originEvil`), and
  further investigation surfaced additional untrusted-transport flags
  beyond `--upload-pack` (`--multiple`/`-m` and `--recurse-submodules`).
  Two separate fixes resulted: the `originEvil`-style remote-name gap is
  closed by narrowing the **allow** rule itself, from `git fetch origin*`
  to `git fetch origin *` (the same bare-inclusive shape used for `diff`,
  not a deny addition); the flag-based gaps are covered by one
  comprehensive **deny**, `Bash(git fetch origin -*)`, replacing the
  narrower per-flag denies. `.claude/settings.json`'s own `$comment`
  field and `docs/permissions.md` remain the owning, authoritative
  surfaces for the exact rule set -- not duplicated here.
- **`providerHealth` / `localValidationEvidence` / `providerOutage`**:
  evaluated during the v0.11.0 hearing; no repository-specific override was
  adopted for any of the three -- `.github/idd/config.json` sets none of
  `providerHealth.*`, `localValidationEvidence.*`, or `providerOutage.*`,
  so all three continue to operate on the distributed defaults (see
  `docs/policy-constants.md`'s "Provider Health Defaults", "Provider
  Outage Declaration Defaults", and "Local Validation Evidence Defaults"
  tables).
- **Live ruleset evidence**: see the corrected "Advisory-Convergence
  Required Check" section above (`strict_required_status_checks_policy:
  false`, `bypass_actors: []`, `current_user_can_bypass: "never"`) -- not
  repeated here.
- **`idd-doctor --strict` reproduction** (2026-09-14T16:08Z, against `main`
  at commit `7c686dee6ead8520578a80b5c0dc7c48b1dff609`, the merge-base
  after #103-#109 were assembled and before this issue's own commits):

  ```text
  PASS  required instruction and reference files are present
  PASS  profile artifacts are present
  PASS  no unresolved {{...}} placeholders in IDD-managed files
  PASS  marker prefix is valid and consistent (jsonresume-types)
  PASS  project commands table has non-empty command values
  PASS  merge policy signal found
  PASS  review policy signal found
  PASS  .github/idd/config.json declares helper runtime profile "package-manager"
  PASS  .github/idd/config.json validates against policy.schema.json
  PASS  AGENTS.md references docs/idd-workflow.md
  PASS  CLAUDE.md references docs/idd-workflow.md
  PASS  GEMINI.md references docs/idd-workflow.md
  PASS  template version signal found in .github/idd/config.json
  PASS  required status checks configured on main (4, strict=false)
  PASS  required pull request review policy is configured

  result: passed (0 warning(s))
  ```

  The `required status checks configured on main (4, strict=false)` line
  is also the resolution evidence for the `branch protection not readable`
  finding this document previously carried under "Known `idd-doctor`
  Warnings" (#75): the installed `idd-doctor` still queries both
  governance surfaces (the Rulesets endpoint and the classic
  branch-protection endpoint, which still 404s), but now trusts that
  classic 404 as genuinely-empty protection rather than an unreadable
  failure -- the `ciGate.trustEmptyProtectionReads: true` opt-in already
  recorded under "v0.6.0 Re-import Notes" above -- so the check no longer
  reports "not readable" once the Rulesets read alone succeeds, and it is
  that successful Rulesets read which powers the "required status
  checks" finding itself. Its bullet has accordingly been removed from
  that section. The other two previously-recorded warnings (post-merge
  cleanup backlog, release-tag drift) also did not fire in this run, but
  remain recorded there as still-live, currently-quiet
  mechanisms rather than resolved findings -- see that section for the
  current-run detail on each.
- **Named-gap import method and dual-mirror invariant**: the re-import
  used upstream's named-gap method -- importing named upstream files and
  sections individually against this repository's own deliberate
  customizations, rather than a blind directory overwrite, so recorded
  local decisions (ruleset-based policy fields, the `package-manager`
  helper profile, Actions v7/pnpm tooling, shared lint-config imports)
  survive un-reverted. Two skill bundles are now installed as
  byte-identical mirror pairs under `.claude/skills/` and
  `.github/skills/` -- `issue-authoring` (see "Issue-Authoring Companion"
  above) and, new in this cycle, `idd-spec-audit` (#108, PR #118) --
  re-verified byte-identical with `diff -r` during this reconciliation.
  Any future re-import must update **both** copies of **every** installed
  mirror bundle together, and must never silently overwrite a recorded
  local customization (this document's own record of them) without an
  explicit reconciliation pass such as this one.
- **Config field cross-check** against `.github/idd/config.json`, scoped
  to the fields this hearing touched or that this document's existing
  sections describe (not every key in the file -- several predate this
  cycle entirely, e.g. `issueScope`/`orphanFirstPolicy`/
  `workshop.exampleRepository`, added at initial import and unchanged
  since). `iddVersion: "0.11.0"` is recorded here for the first time as an
  explicit field:value pair (previously only implied by this section's own
  heading and the peeled-pin bullet above); `mergePolicyAck` and
  `developmentBranch` are newly recorded above, as field:value pairs, in
  this same section. `markerPrefix` was already correctly reflected by
  this document's existing sections (e.g. "Issue-Authoring Companion"'s
  prefix-first rule). `trustedMarkerActors` (`kurone-kito`) is not named by
  value anywhere else in this document, only by field name in the shared
  `.github/instructions/*.md` files -- recorded here for the first time as
  a value. `advisoryBotLogins` (`coderabbitai[bot]`) is likewise not named
  by value elsewhere in this document, only the field's general concept
  and the unrelated `exemptBotAuthoredPrs`/`convergenceScope` fields
  appear above (in "Advisory-Wait Bot Exemption"). The concept behind
  `autopilotSuitability.floor` (not this exact key path) is documented in
  the shared docs bundle (`docs/customization.md`,
  `docs/idd-helper-scripts.md`). No divergence found in any of them.

## IDD Labels

Distributed defaults: `roadmap`, `status:blocked-by-human`,
`status:needs-decision`.

## Machine-readable policy file

`.github/idd/config.json` is the machine-readable record of the same
decisions above and is the authoritative source if this document and
the config file ever disagree.
