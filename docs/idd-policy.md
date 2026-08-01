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

**Status**: `installed` (confirmed decision; physical installation into
`.claude/skills/` and `.github/skills/` is delivered by the sibling track #33,
not this import)

- **`issueAuthoring.maxClarificationRounds`**: `3` (default)

## IDD Labels

Distributed defaults: `roadmap`, `status:blocked-by-human`,
`status:needs-decision`.

## Machine-readable policy file

`.github/idd/config.json` is the machine-readable record of the same
decisions above and is the authoritative source if this document and
the config file ever disagree.
