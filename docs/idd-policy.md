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
`integration_id: 15368`, with `strict_required_status_checks_policy: true`
and `bypass_actors: []` (the `enforce_admins: true` equivalent -- the check
applies to admin merges too, including a trusted merge-capable session's
own). Verify the pinned check and its strict-policy flag with:

```sh
gh api repos/kurone-kito/jsonresume-types/rules/branches/main \
  --jq '.[] | select(.type == "required_status_checks" and .ruleset_id ==
  20745987) | .parameters | {matches: (.required_status_checks |
  any(.context == "idd-advisory-convergence" and .integration_id ==
  15368)), strict: .strict_required_status_checks_policy}'
```

Confirm the response is `{"matches": true, "strict": true}`. This endpoint
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

`idd-doctor --strict` reports these findings as intentional, explained
divergences rather than unresolved defects. Most trace to the #37 import
verification pass; one was added later and is noted individually below.

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
  count and example PRs, rather than trusting a number recorded here).
- **`release-tag drift`** -- out of scope for the IDD import. Cutting a new
  release is roadmap #46's concern (`Roadmap: restore the release pipeline
  and the package's quality gates`), not #38's. This document does not track
  release cadence.
- **`branch protection not readable for kurone-kito/jsonresume-types:main`**
  -- added after the mid-session migration of `main`'s branch protection
  from classic protection to a GitHub ruleset (see #75 for the full
  writeup). `idd-doctor` v0.6.0's branch-protection check reads the classic
  `GET /repos/{owner}/{repo}/branches/main/protection` endpoint, which now
  404s (`"Branch not protected"`) because enforcement moved to the ruleset;
  `idd-doctor` v0.6.0 does not yet read rulesets for this check. The
  ruleset itself is enforced and readable via the rulesets API -- this
  bullet is narrowly about why `idd-doctor`'s own check reads stale, not
  about the ruleset's configuration. The "Advisory-Convergence Required
  Check" section above now documents verification via the Rulesets API
  (#75) instead of that now-404ing classic endpoint.

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
  check to unresolved (`"source-pinned"`) once it is otherwise passing.

## IDD Labels

Distributed defaults: `roadmap`, `status:blocked-by-human`,
`status:needs-decision`.

## Machine-readable policy file

`.github/idd/config.json` is the machine-readable record of the same
decisions above and is the authoritative source if this document and
the config file ever disagree.
