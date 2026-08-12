# Workflow Boundary

This bundle handles issue authoring end to end under the authoring
hold: drafting and publishing are one continuous stage with no
per-step approval, and release from the authoring hold is the single
approval boundary that hands off to IDD execution.

## Two-stage contract

### Stage 1: Author-and-publish (under the hold)

- Skill drafts issues in the target repository. Each candidate moves
  through the readiness buckets: `deferred` → `ready` or an escalation
  bucket (`needs-decision`, `blocked-by-human`, `out-of-scope`)
- Before publishing a `ready` body, bundled skill runs the mechanical
  `audit-authored-issue` gate and the critique pass (both unchanged
  and still mandatory)
- Bundled skill then publishes directly under the configured authoring
  label (`issueAuthoring.authoringLabelName`, defaulting to
  `status:authoring`) — **no prior user approval of the drafted body
  is required**. If the current request asked only for a preview
  (drafts to look at before anything is created), bundled skill stops
  after reporting the proposed set instead of publishing; publishing
  is otherwise the default outcome of drafting, not an opt-in step
- If the label does not exist in the target repository, bundled skill
  creates it with `gh label create` before first use; label creation or
  application failure blocks publishing
- For existing issues, bundled skill applies the authoring label before
  updating issue content
- For new issues, bundled skill creates the issue with the authoring label
  when the publication command supports that; otherwise it applies the
  label immediately after creation
- If post-create label application fails, bundled skill closes the created
  issue before stopping; deletion needs admin permission the authoring
  agent typically lacks (and `docs/permissions.md` forbids for normal IDD),
  so it is not the default path
- **The held issue IS the draft.** In-place body edits, roadmap
  relationship wiring (children first, then roadmaps once the real
  issue numbers exist), and re-lint of already-published bodies all
  happen on the published issue, under the same label — not in a
  session-local buffer that a later session cannot see
- **Interrupted-session guard.** If a Stage 1 session stops before the
  set is fully wired and stable, the authoring label stays on every
  issue it already published. The label alone is what keeps Discover
  from selecting an unfinished set, so a later session (or the same
  session, resumed) can find and finish the work with no extra
  bookkeeping

### Stage 2: Release (the single approval boundary)

- The user's explicit hold-release request is the only approval this
  bundle's workflow requires, and it authorizes IDD execution for the
  released issues
- Before removing the authoring label, bundled skill runs a release
  checklist that absorbs the rigor of the dropped middle step:
  - every child issue is referenced from its parent roadmap's
    `## Tracks` list
  - no unsubstituted placeholder (a leftover `#TBD`, template
    stand-in, or similar) remains in any published body
  - the `audit-authored-issue` linter (or its manual fallback under
    `instructions-only`) is green on every published body in the set
- Bundled skill removes the authoring label from all published issues
  only after the release checklist passes and the user's release
  request is explicit
- Release remains a human action; nothing in this bundle auto-releases
  a held issue set

## A4.5 Gate Timing

The IDD discover phase evaluates published issues through the A4.5
pre-claim suitability gate. This gate runs after an issue is published
but before it is claimed for work.

**Why A4.5 exists**: Issues drafted with incomplete information or from
assumptions that did not hold when published may fail A4.5 checks
(incoherent, unsafe, duplicate, etc.). A4.5 catches these before they
waste agent time during work.

**Prevention during drafting**: This bundle is where coherence, safety,
and uniqueness should be validated **before** publishing. A4.5 runs
seven suitability checks; the three that drafting can most directly
prevent (coherence, safety, uniqueness) correspond to bucket escalation
triggers during drafting:

- If an issue might be incoherent → escalate to `needs-decision` during
  drafting
- If an issue might contain untrusted input → escalate to `blocked-by-human`
  or fix during drafting
- If an issue might be a duplicate → run reuse-first checks during
  drafting before publishing

When these prevent-during-drafting checks are applied correctly, published
issues will pass A4.5; if they do not, A4.5 will catch them at discover
time and report the specific failure (unclear, invalid, duplicate).

## Use this bundle to

- prepare IDD-ready orphan issues when the target repository discovers
  orphans (`issue-scope: roadmap-first`, the default, via the orphan
  fallback, or `orphan-first`), including any required
  `orphan-first-policy` approval handoff
- prepare roadmap packages and child issues when work needs visible
  sequencing or parallel tracks
- surface non-ready buckets instead of guessing through blockers

## Do not use this bundle to

- start the Discover -> Claim -> Work loop implicitly
- treat bundled references as a replacement for repository execution
  instructions
- publish a body that has not passed the mechanical
  `audit-authored-issue` gate and the critique pass
- remove the authoring label from any issue without an explicit
  release request

## Handoff to execution

Once the user's explicit release request removes the authoring label
from every issue in the released set, execution is authorized: the
repository's normal entry file and routed
`.github/instructions/*.instructions.md` phase files (Discover, Claim,
Work) may pick up the released issues. This bundle does not itself
start that loop.
