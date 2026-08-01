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

## IDD Labels

Distributed defaults: `roadmap`, `status:blocked-by-human`,
`status:needs-decision`.

## Machine-readable policy file

`.github/idd/config.json` is the machine-readable record of the same
decisions above and is the authoritative source if this document and
the config file ever disagree.
