# IDD Template — AI Agent Onboarding

This document is the entry point for an AI agent tasked with importing
and configuring the IDD (Issue-Driven Development) workflow template into
a new repository.

> **Invoked via the trigger phrase?** If the operator told you to read
> this URL and onboard, you are in the right place. You do not need to
> clone the idd-skill repository — Step 2 Option A below provides the
> commands to download every template file directly from GitHub.
>
> Recognized trigger phrases:
>
> - Short form (Japanese):
>   _"`github:kurone-kito/idd-skill` の IDD をこのリポジトリにインポート＆オンボーディングして"_
> - Short form (English):
>   _"Import and onboard `github:kurone-kito/idd-skill`'s IDD into this
>   repository."_
> - Explicit form (works with any agent):
>   _"I want to use `github:idd-skill`'s Issue-Driven Development in this
>   repository. Read
>   `https://raw.githubusercontent.com/kurone-kito/idd-skill/main/idd-template/ONBOARDING.md`
>   and onboard me."_
>
> All forms lead here. Agents that received only a `github:owner/repo`
> reference and resolved this file by fetching the repository README are
> also in the right place.

## Upgrading from an earlier IDD version

> **Breaking change (2026-05-28):**
> `.github/instructions/idd-overview.instructions.md` was a thin
> redirect with no unique runtime content other than the **Project
> commands** table. That table now lives in
> `.github/instructions/idd-overview-core.instructions.md`, the
> redirect file has been removed from the template, and every script,
> test, and doc has been updated to read the table from core.
>
> If your target repository was set up from an earlier import, do the
> following once after pulling the new template files:
>
> 1. Move any local customizations (typically the `fix-validate`,
>    `pre-push-validate`, `post-fix-validate`, `install-deps`,
>    `issue-scope`, and `orphan-first-policy` rows you adjusted during
>    onboarding) from your old
>    `.github/instructions/idd-overview.instructions.md` into the
>    Project commands table in
>    `.github/instructions/idd-overview-core.instructions.md`. Per-row
>    overrides via `.github/idd/config.json` `commands.*` continue to
>    work unchanged.
> 2. Delete
>    `.github/instructions/idd-overview.instructions.md` from your
>    target repository. No machine consumer reads that path anymore.
>
> First-time adopters can ignore this section — the flow below already
> references the new file.

### Re-importing: import named gaps, not a blind resync

When you pull a newer upstream template into a repository that already adopted
IDD, treat the upgrade as a **named-gap import**, not a blind resync:

1. **Resolve placeholders first** so the new template carries your repository's
   real values, not upstream defaults.
2. **Reconcile only the enumerated gaps** — the specific changes between your
   current version and the new template — **against your recorded local policy**
   (the policy section from Step 3). Do not overwrite intentional local
   divergence with upstream defaults; a blind file-for-file resync silently
   reverts your customizations.
3. Re-apply the Step 2 file import for the changed files, then re-run the
   Step 6 verification checklist and `idd-doctor` after reconciling.

**Anatomy of a helper re-import (`vendored-node` profile).** If you vendor
the shared helper bundle, a new leaf helper is rarely a standalone file
drop — see
[Anatomy of a helper re-import](docs/onboarding/template-distribution.md#anatomy-of-a-helper-re-import-vendored-node-profile)
for the shared-core diff, additive-reconciliation, and silent-revert
checks to run before trusting a green build.

**Named gap: `.markdownlint.yml` / `.markdownlint-cli2.yaml` /
`.cspell.config.yml`.** A repository onboarded before these files were
added to the template's core file set gets an intentional, non-silent
behavior change on the next re-import: `--verify`'s `manifestCompleteness`
now reports them missing (blocking) until you re-run Step 2 for them, and
`--import` reports a `blockedOverwrites` finding instead of silently
skipping them if you already created same-named files of your own by
then — merge the template's rule overrides / word list into your existing
file by hand in that case, following the Step 2 file-list note on these
files.

**Named gap: `mergePolicy` on a forced re-import.** `--import` without
`--force` already reports `blockedOverwrites` for an existing
`.github/idd/config.json` (it differs from the source template like any
other tracked file). `--force` overwrites that file byte-for-byte from
the source template, including `mergePolicy` — an operator who
previously opted in to `fully_autonomous_merge` (or
`separate_merge_agent`) must re-record that choice after a forced
re-import, since the file reverts to the shipped `human_merge` default
along with it. This rule is preventive; no observed incident yet.

When you then audit whether re-imported roadmap work is actually done, judge
**completion by auditing the implementation against the acceptance criteria**,
not by a child issue's closed state — a skeleton or scaffold PR can merge and
close a child while leaving its acceptance criteria unimplemented. See the
roadmap-audit rule in
`.github/instructions/idd-roadmap-audit.instructions.md` (compare the roadmap
success criteria against the merged PRs; do not infer completion from
checkbox state alone).

## What you are setting up

IDD is a multi-agent GitHub automation workflow. Agents work through a
pipeline of phases (Discover → Claim → Work → PR Submit → CI Wait →
Review Triage → Review Fix → Merge → Loop) driven by GitHub Issues.
The instruction files in `.github/instructions/` encode every rule for
every phase. GitHub is IDD's only implemented provider today; see
[Provider Portability](docs/customization.md#provider-portability)
for the staged, provider-neutral adapter boundary this onboarding path
does not depend on.

Important: the distributed default workflow is cross-agent for
execution, but its later PR phases still include a GitHub Copilot
advisory review step by default. If the operator does not want that PR
policy, choose another profile in `docs/idd-review-policy-profiles.md`
and apply the matching artifact from `profiles/`. The artifact records
the complete edit surface, adopter-owned values, and verification
evidence for the selected non-default profile.

Also choose a review-thread resolution policy before treating the import
as complete. The distributed default is `fast-agent-resolve`, where an
agent may resolve review threads after it has acted on accepted,
rejected, or advisory feedback. Repositories that require reviewer
acknowledgement should choose `hybrid-reviewer-ack` or
`strict-reviewer-resolve` from `docs/idd-review-policy-profiles.md` and
customize the listed phase files before running unattended PR review
loops.

Before granting credentials to unattended or merge-capable agents, read
`docs/permissions.md` and choose the narrowest access profile that can
complete the intended phase.
Also choose a merge policy before the first unattended run:
`human_merge`, `separate_merge_agent`, or `fully_autonomous_merge`.
The distributed default is `human_merge`, where normal worker sessions
stop at the merge-policy handoff gate for a human maintainer. Ask
whether the operator wants to opt in to `fully_autonomous_merge`, which
gives one trusted agent session merge authority to continue through
merge execution in F3, or prefers `separate_merge_agent` as a
non-default split-authority handoff profile. For production
repositories that want an unattended merge loop, confirm the operator
understands the consequences before recording an explicit opt-in to
`fully_autonomous_merge`. Normal worker sessions stop before merge under
`human_merge` and `separate_merge_agent`; only the trusted merge-capable
session configured for `separate_merge_agent` continues past the
default F2.5/F3 gates after the required customization. Record
the selected policy in repository
documentation that future IDD sessions read. Missing policy defaults to
`human_merge`; unknown recorded policy values must stop with
a maintainer hold until corrected.

If you keep the distributed advisory/CI defaults, record that choice
alongside the merge policy and point operators to
[IDD policy constants](docs/policy-constants.md) so the named values
such as `ciWait.runningTimeout`, `ciWait.generationTimeout`, and
`ciWait.rerunPolicy` are easy to find later.

Also consider the AI model used for the IDD execution session. Large and
premium reasoning models are more likely to trigger frequent context
compaction when the full instruction file set is loaded, which can
interrupt unattended IDD loops. For day-to-day execution, standard models
(for example, models in the Sonnet class) handle the instruction overhead
more efficiently and are the recommended choice. Reserve large or premium
reasoning models for tasks that genuinely benefit from their extended
reasoning depth, not for routine IDD loop execution.

## Your task

1. Read this document before changing files.
2. Confirm the `gh` CLI is installed and authenticated.
3. Auto-derive candidate placeholder values from repository evidence.
4. Confirm policy decisions with the operator.
5. Fetch or copy the template files.
6. Replace placeholders with the confirmed values.
7. Record the selected policies where future IDD sessions will read them.
8. Update the repository's agent entry files.
9. Verify the imported result with the checklist at the bottom.

---

## Helper-assisted path

**Requires a local clone of `kurone-kito/idd-skill`** (Step 2 Option B
below) — `scripts/idd-onboard.mjs` exists only in that checkout, not in
a target repository fetched via Option A alone. If this session has
such a clone plus a working Node.js/`npx` helper runtime, this run
order replaces the manual Steps 0-4 and 6 procedures below and
[Onboarding Reference — Policy Decisions](docs/onboarding/policy-decisions.md) /
[Onboarding Reference — Placeholder Values](docs/onboarding/placeholders.md)
— open those two companions only if one of the steps below fails.
Step 5 (agent-entry files) and the
[Project Tuning](docs/onboarding/project-tuning.md) companion in step
6 below still need reading; this path does not automate them. Without
a clone, use the [Instructions-only path](#instructions-only-path)
below instead.

1. Read-only propose: catalog items with any derived candidate and
   documented default, Step 0 evidence, and helper-runtime evidence.
   Relay each **non-`check`-kind** item's `prompt` and `explanation` to
   the operator and collect their confirmed answers for `<answers-file>`
   below — inspect the three `check`-kind items (Step 0's
   `gh`/host/execution-environment evidence) yourself instead of asking
   the operator, and do not add them to `<answers-file>`:
   `--hear --apply` treats any id it does not recognize as unresolved
   and exits `1`. `--propose` is required even when also running the
   TTY wizard next — the wizard alone skips every `check`-kind item and
   never gathers helper-runtime evidence.

   ```sh
   node scripts/idd-onboard.mjs --hear --propose --target <target-repo>
   node scripts/idd-onboard.mjs --hear --target <target-repo>  # optional TTY wizard, after propose
   ```

2. Validate the operator's answers against the catalog and print the
   confirmed transcript. Save that transcript to a file.

   ```sh
   node scripts/idd-onboard.mjs --hear --apply \
     --answers <answers-file> --target <target-repo>
   ```

   **Check the transcript's `bootstrap-execution-mode` answer before
   continuing.** If it is `issue-mediated`, stop here — switch to
   [Onboarding Reference — Issue-Mediated
   Bootstrap](docs/onboarding/issue-mediated-bootstrap.md) instead of
   running steps 3-5 below, which write the template with a direct,
   unreviewed commit (the `direct-import` default only).

3. Import the core template file set (add `--profile vendored-node`
   when that profile was confirmed).

   ```sh
   node scripts/idd-onboard.mjs --import \
     --source <idd-skill-clone> --target <target-repo>
   ```

4. Replace the seven placeholders from the confirmed transcript.

   ```sh
   node scripts/idd-onboard.mjs --substitute \
     --from-transcript <transcript-file> --target <target-repo>
   ```

5. Record the confirmed policy decisions. Always pass
   `--write-policy-doc <path>`: several confirmed answers (credential
   scope, critique-loop profile, issue-authoring companion status, the
   up-to-date-head ruleset check, and bootstrap execution mode) are
   docs-only and exist **only** in this filled Markdown template, not
   in `.github/idd/config.json` — dropping the flag loses them. Root
   `<path>` under `<target-repo>` explicitly — `--record-policy`
   resolves a relative path against the current working directory, not
   `--target`, so a bare relative path run from this clone silently
   writes into the clone instead of the target repository. Link the
   written file from the repository's agent entry files (Step 5 below)
   so future sessions can find it.

   ```sh
   node scripts/idd-onboard.mjs --record-policy \
     --transcript <transcript-file> --target <target-repo> \
     --apply --write-policy-doc <target-repo>/<policy-doc-path>
   ```

6. Read
   [Onboarding Reference — Project Tuning](docs/onboarding/project-tuning.md)
   for the judgment calls the CLI does not automate.
7. Verify the imported result. Pass the same `--profile` used for
   `--import` in step 3 (if any) — `--verify` resolves
   `manifestCompleteness` from `--source` and `--profile` together, so
   omitting a non-default profile here hides a missing or
   failed-to-copy profile-conditional file.

   ```sh
   node scripts/idd-onboard.mjs --verify \
     --source <idd-skill-clone> --target <target-repo> [--profile <name>]
   ```

If any step reports a blocking finding, open the referenced companion
doc — Step 1B below documents every policy decision in full, and
[Placeholder Values](docs/onboarding/placeholders.md) documents every
placeholder — to resolve it, then resume from that step.

## Instructions-only path

Without a helper runtime, fetch the hearing catalog
(`docs/onboarding/hearing-catalog.json`) from the same raw GitHub tree
as this file. For each **non-`check`-kind** catalog item, present its
`prompt` and `explanation` to the operator and record their confirmed
value. Execute and inspect the three `check`-kind items yourself
instead of asking the operator for a value (Step 0's `gh`/host/
execution-environment checks) — do not skip them and proceed to Step 2
on unauthenticated `gh` or an unsupported shell.

**Check the operator's `bootstrap-execution-mode` answer before Step
2.** If it is `issue-mediated`, switch to
[Onboarding Reference — Issue-Mediated
Bootstrap](docs/onboarding/issue-mediated-bootstrap.md) instead of
continuing below — Steps 2, 4, and 5 write the template with a direct,
unreviewed commit (the `direct-import` default only).

Otherwise continue with the Step 2 file list and Option A (or Option B
for a local clone) below to fetch the template, apply the confirmed
placeholder and policy values by hand (Steps 1A-1C, 3, and 4 below
spell out the same items the catalog just asked), and finish with
Steps 5 and 6.

---

## Step 0 — Prerequisite check

Before Step 1A, confirm the `gh` CLI is installed and authenticated.
IDD depends on `gh` throughout its own lifetime -- claim markers, PR
submission, review-thread disposition, merge execution, and every
later IDD phase -- independent of whatever tech stack the target
repository itself uses. This is the operator's own local `gh` session
used interactively during onboarding, distinct from the CI-side
`GH_TOKEN`/`GH_ENTERPRISE_TOKEN` wiring a hosted `idd-doctor` workflow
needs (see [Optional — run idd-doctor as a CI health gate](#optional--run-idd-doctor-as-a-ci-health-gate)).

Run:

```sh
gh --version
git remote get-url origin
gh auth status --hostname <derived-host>
```

Bare `gh auth status` (no `--hostname`) reports on every host `gh`
already knows about, not the repository being onboarded: it exits
successfully only when **every** known host is authenticated, so an
unrelated stale credential for some other project's host can fail this
check even though the target repository's own host is fine (confirmed
against a real `gh` binary) -- and, if the target host itself was
never configured at all, the bare form silently omits it instead of
reporting it missing. Both failure directions require scoping to the
target host specifically, always -- unlike `gh api`'s own `--hostname`
convention, `gh auth status` has no case where omitting it is correct,
not even for `github.com` (confirmed: `gh auth status --hostname
github.com` behaves identically to a clean bare invocation, so there
is no cost to always passing it). Derive `<derived-host>` from `git
remote get-url origin`'s URL (parse the host portion; a
`github.com` URL yields `github.com` itself).

- On success, continue to Step 1A without further comment.
- On failure (not installed, or not authenticated to the target
  repository's own host), report the exact remediation to the operator
  -- the CLI install command, or `gh auth login --hostname
  <derived-host>` -- and ask whether to proceed anyway before
  continuing. This is a one-time setup conversation the operator stays
  in control of, not a silent skip and not an unconditional hard stop.

This check is scoped to `gh` only. IDD does not require Node.js or
pnpm for the default instructions-only profile (see
[Tooling boundary](docs/onboarding/placeholders.md#tooling-boundary));
a Node.js check tied to the helper-runtime-profile choice belongs at
Step 1B's helper-runtime-profile item instead, not here.

**Execution-environment prerequisites.** Separately from the `gh`
check above, the distributed workflow's `sh`/`bash` fenced blocks
assume a POSIX shell and common Unix utilities (`grep`, `sed`, `mkdir`,
`dirname`, `tr`, `head`, `sort`, `curl`). On Windows, get one from Git
for Windows (Git Bash, which bundles those utilities) or WSL — native
`cmd.exe`/PowerShell cannot run these blocks unmodified. The
`instructions-only` profile's advisory-wait shell fallback additionally
needs a standalone `jq` binary on `PATH` (see
[Advisory-Wait Shell Fallback](docs/idd-advisory-wait-shell-fallback.md));
`gh api --jq` is built into `gh` and covers other call sites, but not
this fallback's own commands piping into `jq -r`/`jq -s`, and neither
`gh` nor Git for Windows installs a standalone `jq`.

Native-Windows adopters should also set
`git config --global core.longpaths true` (a one-time host-level
setting, not a repository change): B1's sibling-worktree layout
(`<repo>.<branch-with-slashes-dashed>` beside the primary worktree)
combined with this repository's deep `.github/instructions/` paths can
approach Windows' 260-character path limit.

---

## Dry-run — Readiness assessment

Before making any file changes, run
`node scripts/idd-onboard.mjs --hear --propose --target <target-repo>`
for a read-only readiness pass over the target repository — see
[Helper-assisted path](#helper-assisted-path) above. Its JSON payload
approximates this shape:

```md
## IDD readiness report

- Detected package manager:
- Detected test commands:
- Suggested marker prefix:
- Suggested merge policy:
- Branch protection visible:
- Required checks visible:
- CODEOWNERS present:
- Missing prerequisites:
- Files that would be created:
- Files that would be modified:
```

`Missing prerequisites:` reports the same host-scoped `gh --version`/
`gh auth status --hostname <derived-host>` check as Step 0 above, plus
any other missing tooling this dry-run pass observes -- both surfaces
agree on the `gh` check itself.

For a session with no helper runtime, use this prompt instead and
return the report in the same format:

```md
Assess this repository for IDD readiness. Do not modify any files.
Produce a readiness report with the following fields.
```

This dry-run is for evaluators who want a quick import readiness summary
before starting Step 1A.

---

> **Relay explanations, not just labels.** For each item you present
> across Steps 1A, 1B, and 1C, pull its matching explanation from the
> companion reference doc and relay it to the operator in plain
> language before asking for confirmation or a choice — do not only
> quote the terse item text. Draw from
> [Onboarding Reference — Placeholder Values](docs/onboarding/placeholders.md)
> for Steps 1A and 1C, and
> [Onboarding Reference — Policy Decisions](docs/onboarding/policy-decisions.md)
> for Step 1B. Also define, in plain language on first use, any term
> already covered in [Core IDD Concepts](docs/concepts.md).

## Step 1A — Auto-derive candidate values

Inspect the target repository and propose candidate values for all seven
placeholders: `jsonresume-types`, `jsonresume-types`, `kurone-kito`,
`pnpm run lint:fix && pnpm run lint`,
`pnpm run lint && pnpm run build && pnpm run test`,
`pnpm run lint:fix && pnpm run lint && pnpm run build && pnpm run test`, and
`corepack enable && pnpm install --frozen-lockfile`.

Use
[Onboarding Reference — Placeholder Values](docs/onboarding/placeholders.md)
for the detailed derivation rules, fallback order, and marker-prefix
notes.

Present the proposed values to the operator for confirmation or
correction, then carry the confirmed values into Steps 1C and 4.

---

## Step 1B — Confirm policy decisions

These choices **cannot be safely inferred** from repository evidence and
require explicit operator confirmation:

1. merge policy (`fully_autonomous_merge`, `human_merge`, or
   `separate_merge_agent`)
2. PR review policy profile (`copilot-advisory` by default, or a
   non-default profile)
3. review-thread resolution policy (`fast-agent-resolve` by default, or
   a stricter profile)
4. critique-loop profile (distributed defaults, or a documented
   repository override)
5. credential scope for worker and merge-capable sessions
6. claim-timing defaults (`claim-stale-age` and
   `claim-heartbeat-interval`)
7. CI wait policy defaults (`ciWait.runningTimeout`,
   `ciWait.generationTimeout`, `ciWait.rerunPolicy`)
8. issue-author approval gate (`enabled-by-default` by default, or
   explicit config opt-out via `skipIssueAuthorApprovalGate: true`)
9. maintainer approval actor policy (`owners-and-maintainers-only` by
   default, or `all-write-permission-actors`)
10. issue-authoring companion status (`installed` or `not installed`); when
    installed, the selected native destination (`.agents/skills/`,
    `.claude/skills/`, or `.opencode/skills/`)
11. helper runtime profile (`instructions-only` by default, or an
    evidence-based helper profile recommendation that still requires
    explicit operator confirmation)
12. IDD label names (`labels.roadmapLabelName`,
    `labels.blockedByHumanLabelName`, and
    `labels.needsDecisionLabelName` — distributed defaults `roadmap`,
    `status:blocked-by-human`, and `status:needs-decision`, or an
    existing local label taxonomy). A semantic issue auto-labeler (for
    example, CodeRabbit's issue enrichment) can auto-apply any of these
    three configured label names to an ordinary issue with no error,
    dropping it from execution candidates or parking it behind a hold;
    omitting a label from the labeler's own instruction list does not
    restrict which labels it may apply. When that risk applies, also
    confirm `labels.untrustedLabelerLogins`: declaring it lets a helper
    runtime generate the matching guard workflow automatically instead
    of requiring the manual recipe. See
    [IDD label names](docs/onboarding/policy-decisions.md#idd-label-names)
    for the field evidence and the guard recipe.
13. up-to-date-head ruleset check
    (`required_status_checks.strict_required_status_checks_policy`,
    recommended disabled — enabling it can force a `main`-sync merge on
    every merely-`BEHIND` PR and multiplies advisory-review rounds
    without review value; a before/after sample measured the sync-merge
    share fall from ~27% to ~3.7%, kurone-kito/idd-skill#1817)
14. bootstrap execution mode (`direct-import` default, or
    `issue-mediated`)
15. development branch (`developmentBranch`) that receives IDD feature
    pull requests — proposed from the repository's live GitHub default
    branch, verified against the configured remote before recording;
    absent resolves the live default branch
16. path-scoped domain guidance reach: does any repository-specific
    domain guidance the repository relies on (for example, "these `.cs`
    files are UdonSharp, not standard C#") reach every configured
    advisory bot the merge gate depends on, not only whichever bot owns
    the config file the guidance happens to be written in? Under
    `copilot-advisory` combined with `fully_autonomous_merge`, the
    primary bot's review is an autonomous merge gate, so domain
    guidance it never sees cannot inform that gate.

Use
[Onboarding Reference — Policy Decisions](docs/onboarding/policy-decisions.md)
for the detailed option descriptions, default guidance, and the Step 3
policy-recording template.

---

## Step 1C — Collect placeholder values

Use the operator-confirmed values from Step 1A for these seven
placeholders:

- `jsonresume-types`
- `jsonresume-types`
- `kurone-kito`
- `pnpm run lint:fix && pnpm run lint`
- `pnpm run lint && pnpm run build && pnpm run test`
- `pnpm run lint:fix && pnpm run lint && pnpm run build && pnpm run test`
- `corepack enable && pnpm install --frozen-lockfile`

If the operator provided no corrections in Step 1A, use the proposed
values directly.

For the placeholder meanings, no-op substitution rules, marker-prefix
notes, and `blocked-by` guidance, see
[Onboarding Reference — Placeholder Values](docs/onboarding/placeholders.md).

---

## Alternate: issue-mediated bootstrap

By default, Steps 2, 4, 5, and 6 below import the template with a direct,
unreviewed commit ("theirs-flow"). An operator may instead opt into
**issue-mediated bootstrap**, which runs that same import through a
reviewable issue -> branch -> PR -> merge cycle using the values already
confirmed above. See
[Onboarding Reference — Issue-Mediated Bootstrap](docs/onboarding/issue-mediated-bootstrap.md)
for when to choose it and the full procedure.

---

## CLI-assisted onboarding

If you have a local clone of `kurone-kito/idd-skill` (Step 2 Option B
below), the `idd-onboard` CLI shipped in that clone
(`scripts/idd-onboard.mjs`) can automate Steps 0, 1A, 1B, and 1C (via
`--hear`), Step 2 (via `--import`), Step 3 (via `--record-policy`),
Step 4 (via `--substitute`), and Step 6 (via `--verify`). **The manual
steps remain canonical**; this CLI is a mechanical, optional shortcut
for the same steps. See
[Helper-assisted path](#helper-assisted-path) above for the full
run order. `--import` and `--verify` both require
`--source <path-to-a-cloned-idd-skill-tree>` and therefore only replace
the Option B local-clone flow, never Option A's remote fetch;
`--substitute` takes no `--source` at all (it only rewrites an already-
imported `--target` tree) and works the same regardless of how that tree
was populated. `--hear` and `--record-policy` also take no `--source`.
Each mode prints a JSON verdict and exits `0` (converged), `1` (a
blocking or residue finding — nothing is written), or `2` (a usage
error), so an agent can gate on the exit code without parsing prose.

- **Steps 0, 1A, 1B, 1C (the hearing) → `--hear`**: derives candidates for
  the catalog's answerable items by reusing `--substitute`'s own
  derivation hooks and reports Step 0 evidence and helper-runtime
  evidence. `--hear --propose --target <dir>` prints that JSON
  read-only; `--hear --apply --answers <file> --target <dir>` validates
  a confirmed answers file against the catalog and transcript schema
  and prints the confirmed transcript; bare
  `--hear --target <dir>` runs an interactive TTY wizard over the same
  catalog and prints the same transcript shape. Never edits
  `ONBOARDING.md`, never writes `.github/idd/config.json`, never
  requires `--source`.

  ```sh
  node scripts/idd-onboard.mjs --hear --propose --target <target-repo>
  node scripts/idd-onboard.mjs --hear --apply --answers <answers-file> \
    --target <target-repo>
  node scripts/idd-onboard.mjs --hear --target <target-repo>
  ```

- **Step 2 (fetch or copy) → `--import`**: copies the core template file
  set from `--source` into `--target`. The file set it copies is the same
  `idd-template-core-files` generated block Step 2's file list below
  renders from, so this command and that list can never drift apart into
  two independently hand-copied file sets. Add `--profile vendored-node`
  to also copy the profile-conditional helper bundle (every other
  `--profile` value copies no extra files); add `--force` to allow
  overwriting an existing target file whose content differs (refused by
  default); add `--dry-run` to print the plan without writing.

  ```sh
  node scripts/idd-onboard.mjs --import --source <idd-skill-clone> \
    --target <target-repo> [--profile <name>] [--force] [--dry-run]
  ```

- **Step 4 (replace placeholders) → `--substitute`**: resolves the seven
  placeholders using Step 1A's auto-derivation rules, a confirmed
  `--hear` transcript (`--from-transcript <file>`), or explicit
  overrides (`--repo-name`, `--marker-prefix`, `--trusted-marker-actor`,
  `--fix-validate-commands`, `--pre-push-validate-commands`,
  `--post-fix-validate-commands`, `--install-deps-command`, which always
  win over a transcript value when both are present), then rewrites
  the target tree in place. Add `--dry-run` to print the plan without
  writing; apply mode refuses to write anything while any placeholder
  would remain unresolved.

  ```sh
  node scripts/idd-onboard.mjs --substitute --target <target-repo> \
    [--from-transcript <transcript-file>] [--dry-run] [--repo-name <value> ...]
  ```

  The `--substitute` shortcut resolves placeholders only; it does not
  select or persist `helperRuntime.profile`. If Step 1B selected a
  non-default helper runtime, apply the manual Step 4 configuration
  instruction after running this command. The `--profile` option on
  `--import` and `--verify` controls profile-conditional file selection and
  completeness, not policy recording.

- **Step 3 (record policy decisions) → `--record-policy`**: consumes a
  confirmed `--hear` transcript's policy-kind answers. Post-import
  only — `--target` must already contain `.github/idd/config.json`.
  Default is dry-run (prints the config-patch and filled Markdown
  policy-decisions template without writing); `--apply` merges the
  patch into `.github/idd/config.json` (omitting `helperRuntime` for a
  confirmed `instructions-only` profile, and writing
  `skipIssueAuthorApprovalGate` only when the operator opted out); add
  `--write-policy-doc <path>` (with `--apply` — it has no effect during
  the dry-run default) to also write the filled template to that path.
  Never edits `ONBOARDING.md`, `CLAUDE.md`, `AGENTS.md`, or `GEMINI.md`.

  ```sh
  node scripts/idd-onboard.mjs --record-policy --transcript <transcript-file> \
    --target <target-repo> [--apply] [--write-policy-doc <path>]
  ```

- **Step 6 (verification checklist) → `--verify`**: a mechanical pass/fail
  check for a target tree after `--import` and `--substitute` have run,
  replacing a manual walkthrough of the checklist below with three check
  groups: manifest completeness (reusing `--import`'s own file-set
  resolution), placeholder residue (reusing `--substitute`'s scanner), and
  an informational stale-import signal. A missing manifest file or a
  leftover onboarding placeholder is blocking; the stale-import signal
  never is.

  ```sh
  node scripts/idd-onboard.mjs --verify --source <idd-skill-clone> \
    --target <target-repo> [--profile <name>]
  ```

Run `node scripts/idd-onboard.mjs --help` for the full flag reference —
this section documents only the flags relevant to Steps 0, 1A-1C, 2, 3,
4, and 6, not every accepted argument.

---

## Step 2 — Fetch or copy template files

> **CLI shortcut**: `node scripts/idd-onboard.mjs --import` automates this
> step from a local idd-skill clone — see
> [CLI-assisted onboarding](#cli-assisted-onboarding) above.

You need the following core execution and profile artifact files in the
target repository. Use whichever method applies to your situation.
This file list is identical across every helper runtime profile; it does
not include the `vendored-node` profile's profile-conditional helper
script bundle (for example `scripts/minimize-superseded-markers.mjs`) —
see
[Profile-conditional helper files](docs/onboarding/template-distribution.md#profile-conditional-helper-files-vendored-node)
for why that bundle is out of scope here and how to get it anyway. If
you selected the `vendored-node` profile, also see
[`.gitattributes` linguist-generated convention](docs/onboarding/template-distribution.md#gitattributes-linguist-generated-convention-vendored-node)
to avoid review bots duplicating findings across a vendored `.mts`
source and its generated `.mjs` output.
For `idd-skill` maintainers working on this generated file list and the
remote-fetch examples, see
[Template distribution maintainer reference](docs/onboarding/template-distribution.md).

The issue-authoring skill is available as an optional companion artifact
from `skills/issue-authoring/` in the idd-skill source repository. That path is
the canonical source bundle, not the target repository's discovery path.
When you install it in a target repository, choose one agent-specific native
skill directory that the selected runtime reads, such as `.agents/skills/`
for Codex CLI or OpenCode, `.claude/skills/` for Claude Code, OpenCode,
and Grok Build, or `.opencode/skills/` for OpenCode. Do not add a
`.grok/skills/` install root. The examples below use the Codex destination
`.agents/skills/issue-authoring/`; change `SKILL_DEST` to the one selected
destination before running any example. Do not install the same skill ID in
multiple roots unless the operator explicitly accepts identical duplicates
(preventive; no observed incident yet).
Install it only when the operator explicitly wants pre-execution issue
drafting or roadmap decomposition support.

Before importing files, re-check the policy choices confirmed in Step 1B:
merge policy, PR review profile, review-thread resolution policy,
critique-loop profile, credential scope, claim-timing defaults, CI wait
policy defaults, issue-author approval gate, maintainer approval actor
policy, issue-authoring companion status, helper runtime profile, IDD
label names, the up-to-date-head ruleset check, and bootstrap execution
mode.

Use
[Onboarding Reference — Policy Decisions](docs/onboarding/policy-decisions.md)
for the detailed defaults, non-default consequences, and the policy
recording template you will apply in Step 3.

The pristine `.github/idd/config.json` intentionally leaves
`helperRuntime` absent. Do not add that key during the import when the
confirmed profile is `instructions-only`; Step 4 records the key only for
an explicitly selected helper profile.
This rule is preventive; no observed incident yet. Issue `#2229` tracks the
configuration inconsistency that prompted the correction.

### File list

This list includes `docs/index.md`, the entry point and topic map for
the imported `docs/` bundle — see
[Customizing IDD § Docs Bundle Frontmatter Convention (OKF)](docs/customization.md#docs-bundle-frontmatter-convention-okf)
for the frontmatter convention its generated table follows.

<!-- audit:generated id=idd-template-core-files -->

```text
.github/idd/config.json
.github/workflows/post-merge-cleanup.yml
.githooks/_idd-worktree-guard.sh
.githooks/pre-commit
.githooks/pre-push
.cspell.config.yml
.markdownlint.yml
.markdownlint-cli2.yaml
.github/instructions/idd-overview-core.instructions.md
.github/instructions/idd-overview-appendix.instructions.md
.github/instructions/idd-discover.instructions.md
.github/instructions/idd-roadmap-audit.instructions.md
.github/instructions/idd-suitability.instructions.md
.github/instructions/idd-claim.instructions.md
.github/instructions/idd-work.instructions.md
.github/instructions/idd-pr-submit.instructions.md
.github/instructions/idd-ci.instructions.md
.github/instructions/idd-advisory-wait.instructions.md
.github/instructions/idd-review-snapshot.instructions.md
.github/instructions/idd-review-triage.instructions.md
.github/instructions/idd-review-fix.instructions.md
.github/instructions/idd-pre-merge.instructions.md
.github/instructions/idd-merge-handoff.instructions.md
.github/instructions/idd-merge.instructions.md
.github/instructions/idd-resume.instructions.md
.github/instructions/idd-resume-stall.instructions.md
.github/instructions/lite/idd-claim-lite.instructions.md
.github/instructions/lite/idd-work-lite.instructions.md
.github/instructions/lite/idd-pr-submit-lite.instructions.md
.github/instructions/lite/idd-review-snapshot-lite.instructions.md
.github/instructions/lite/idd-pre-merge-lite.instructions.md
.github/instructions/lite/idd-merge-handoff-lite.instructions.md
.github/instructions/lite/idd-review-fix-lite.instructions.md
.github/instructions/lite/idd-resume-lite.instructions.md
.github/instructions/lite/idd-resume-stall-lite.instructions.md
.github/instructions/lite/idd-ci-lite.instructions.md
.github/instructions/lite/idd-advisory-wait-lite.instructions.md
docs/index.md
docs/idd-workflow.md
docs/idd-review-policy-profiles.md
docs/idd-helper-scripts.md
docs/idd-autonomy-contract.md
docs/idd-comment-minimization.md
docs/idd-resume-detail.md
docs/idd-advisory-wait-shell-fallback.md
docs/idd-design-rationale.md
docs/idd-concept-ownership.md
docs/permissions.md
docs/getting-started.md
docs/concepts.md
docs/customization.md
docs/policy-constants.md
docs/reference.md
docs/onboarding/agent-entry-and-verification.md
docs/onboarding/issue-mediated-bootstrap.md
docs/onboarding/optional-host-setup.md
docs/onboarding/placeholders.md
docs/onboarding/policy-decisions.md
docs/onboarding/project-tuning.md
docs/onboarding/template-distribution.md
profiles/README.md
profiles/human-required/README.md
profiles/no-advisory/README.md
profiles/external-bot/README.md
```

<!-- /audit:generated -->

This file list includes `.markdownlint.yml`, `.markdownlint-cli2.yaml`, and
`.cspell.config.yml`. They exist because a target repository with no
pre-existing documentation-lint configuration can otherwise import a
clean, verified tree and still fail its own ordinary
`markdownlint-cli2`/`cspell` jobs on the imported files: an early adopter
onboarding validation found real findings across a small set of repeated
rule patterns (line length, table-column style, single-title, and
duplicate-heading for `markdownlint`; unrecognized IDD/tooling
vocabulary and upstream `kurone-kito/idd-skill` cross-references for
`cspell`) against the imported files with no lint config present at all.
These files close that gap out of the box; `.cspell.config.yml`'s
`enableGlobDot: true` in particular is required for `cspell lint "**"` to
scan `.github/instructions/**` at all — without it, that command
silently skips those files rather than reporting them clean. If the
target repository already has its own `.markdownlint.yml`,
`.markdownlint-cli2.yaml`, or `.cspell.config.yml` with different
content, `--import` refuses to overwrite it (reported under
`blockedOverwrites`, same as any other differing file) — merge the
relevant rule overrides or word list from the template's copy into the
existing file by hand rather than forcing an overwrite or skipping the
import for that file. This also means a **re-import** into an
already-onboarded repository that predates these files is a named,
intentional gap under
[Re-importing](#re-importing-import-named-gaps-not-a-blind-resync)
below, not a regression: `--verify` now expects them, and `--import`
blocks instead of silently skipping them if a same-named file already
exists with different content.

Optional companion files:

<!-- audit:generated id=issue-authoring-companion-files -->

```text
skills/issue-authoring/SKILL.md
skills/issue-authoring/references/contract.md
skills/issue-authoring/references/draft-patterns.md
skills/issue-authoring/references/workflow-boundary.md
```

<!-- /audit:generated -->

<!-- audit:generated id=idd-spec-audit-companion-files -->

```text
skills/idd-spec-audit/SKILL.md
skills/idd-spec-audit/references/report-template.md
```

<!-- /audit:generated -->

Create the target directories if they do not exist.

### Option A — Remote fetch (no local clone required)

Use `gh api` or `curl` to download each file from the raw-content
endpoint. See
[Remote fetch examples](docs/onboarding/template-distribution.md#remote-fetch-examples)
for the exact `gh api` and `curl` loops (core files and the optional
`issue-authoring` and `idd-spec-audit` companions), including the Codex
`SKILL_DEST` examples.

### Option B — Local copy (idd-skill cloned)

If you have cloned `https://github.com/kurone-kito/idd-skill`, copy
the files from `idd-template/` into the target repository preserving
their relative paths. See
[Local-copy installs](docs/onboarding/template-distribution.md#local-copy-installs)
for the optional issue-authoring companion copy example and the
do-not-duplicate-native-roots rule.

### Optional companion boundary

The issue-authoring companion drafts or refines IDD-ready issues,
roadmaps, and sub-issues before execution starts. It does not authorize
publishing issues, editing GitHub issues, or starting the Discover →
Claim → Work loop unless the operator explicitly asks for that next
step.

Keep the companion separate from the execution instructions and distinguish
its source from its installed destination:

- `skills/issue-authoring/` is the canonical source helper for drafting issue
  sets.
- The selected native `SKILL_DEST` is the target repository's installed
  destination; it is not another canonical source.
- `.github/instructions/*.instructions.md` execute approved issues
  through the IDD loop.
- In the source `idd-skill` repository, maintainers must keep
  `skills/issue-authoring/` and its bundled references aligned with
  `docs/issue-authoring-skill.md`.

The `idd-spec-audit` companion is read-only: it audits the installed
instruction corpus for semantic drift. When the `issue-authoring`
companion is also installed, it routes every finding back through
that flow for revision; otherwise it routes findings through the
installation's normal manual issue-filing process instead (see the
installed companion's own `SKILL.md`, Scope section). It never edits
files or mutates issues on its own.

### Optional — enable the local worktree guard

See [Optional — enable the local worktree guard](docs/onboarding/optional-host-setup.md#optional--enable-the-local-worktree-guard)
in the optional host-setup reference.

### Optional — run idd-doctor as a CI health gate

See [Optional — run idd-doctor as a CI health gate](docs/onboarding/optional-host-setup.md#optional--run-idd-doctor-as-a-ci-health-gate)
in the optional host-setup reference.

### Optional — host idd-advisory-convergence as a required-check CI workflow

See [Optional — host idd-advisory-convergence as a required-check CI workflow](docs/onboarding/optional-host-setup.md#optional--host-idd-advisory-convergence-as-a-required-check-ci-workflow)
in the optional host-setup reference.

### Optional — mark the vendored helper bundle `linguist-vendored`

See [Optional — mark the vendored helper bundle `linguist-vendored`](docs/onboarding/optional-host-setup.md#optional--mark-the-vendored-helper-bundle-linguist-vendored)
in the optional host-setup reference.

---

## Step 3 — Record policy decisions

Create a local policy section in the target repository's documentation
and record the Step 1B decisions there. Use the detailed template,
machine-readable policy-file notes, and helper-runtime recording rules in
[Onboarding Reference — Policy Decisions](docs/onboarding/policy-decisions.md).

Make the policy section discoverable and point to it from any entry files
(`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md`)
that mention IDD workflow.

---

## Step 4 — Replace placeholders

> **CLI shortcut**: `node scripts/idd-onboard.mjs --substitute` automates
> this step — see [CLI-assisted onboarding](#cli-assisted-onboarding)
> above.

In the copied files, perform a global replacement for: `jsonresume-types`,
`jsonresume-types`, `kurone-kito`, `pnpm run lint:fix && pnpm run lint`,
`pnpm run lint && pnpm run build && pnpm run test`,
`pnpm run lint:fix && pnpm run lint && pnpm run build && pnpm run test`, and
`corepack enable && pnpm install --frozen-lockfile`.

Use
[Onboarding Reference — Placeholder Values](docs/onboarding/placeholders.md)
for the detailed placeholder meanings, no-op substitution rules, and
marker-prefix guidance.

**Three meta-docs stay literal on purpose**:
`docs/onboarding/placeholders.md`, `docs/customization.md`, and
`docs/onboarding/policy-decisions.md` document the seven placeholders
with worked `{{...}}` examples rather than consuming them, so
`--substitute` skips all three by path and never rewrites them (#1924).
`--verify`'s placeholder-residue check applies the same skip, so their
surviving tokens are expected and not reported as unresolved.

After replacing, verify that no `{{...}}` placeholder strings remain in
any copied file other than those three meta-docs.

Apply the confirmed helper runtime profile after placeholder replacement:
leave `helperRuntime` absent from `.github/idd/config.json` for the
`instructions-only` default, which means no helper command is configured.
Only when the operator explicitly selects another supported profile should
you add the object below, replacing the example value with
`package-manager`, `vendored-node`, or `ephemeral-npx` as appropriate.
Merge it into the top-level object in `.github/idd/config.json` and keep the
surrounding member commas valid.

```json
{
  "helperRuntime": {
    "profile": "package-manager"
  }
}
```

Keep this object aligned with the confirmed profile recorded in the local
policy section; do not add it merely to record the `instructions-only`
default.

---

## Step 5 — Update agent entry files

By default, leave the repository with root entry files for every
manually-routed non-Copilot agent named in `docs/idd-workflow.md`:
`CLAUDE.md`, `AGENTS.md`, and `GEMINI.md`. `AGENTS.md` is the shared
agents.md-standard entry for Codex CLI, OpenCode, and Grok Build —
each auto-loads it natively, so no dedicated root file is needed for
OpenCode or Grok Build. Operators must not create `GROK.md`.

- If the file already exists, append or adapt an IDD section without
  replacing unrelated repository guidance.
- If the file is missing, create a minimal stub — and when a sibling
  entry file or an existing `.github/copilot-instructions.md` already
  carries repository-specific guidance, point the new file at the
  file(s) that own it instead of copying that guidance in.
- Only skip creating a missing root agent entry file when the operator
  explicitly opts out of adding new files.

Use
[Onboarding Reference — Agent Entry and Verification](docs/onboarding/agent-entry-and-verification.md)
for the per-file examples, create-from-scratch stubs, and expanded
verification guidance for this step.

The minimal IDD workflow section should tell agents to:

```markdown
## IDD Workflow

This project uses Issue-Driven Development (IDD) with parallel AI
agents. Start with [docs/idd-workflow.md](docs/idd-workflow.md) for the
cross-agent entry path and phase routing.

Before starting IDD work, open
`.github/instructions/idd-overview-core.instructions.md`. Open the routed
phase file manually when the current step changes.

Doing ad-hoc engineering outside a formal IDD claim (a direct fix, a PR,
a review reply)? The "Wake-up discipline" section of
`.github/instructions/idd-ci.instructions.md` (no self-polling while
waiting on CI or bot review) still applies — open it whenever a commit
you pushed is waiting on either.
```

- point to `docs/idd-workflow.md` as the cross-agent entry path
- open `.github/instructions/idd-overview-core.instructions.md` before
  starting IDD work
- manually open the routed phase file when the current step changes
- give ad-hoc engineering (no formal claim) an on-ramp to
  `idd-ci.instructions.md`'s Wake-up discipline section, since it has no
  other trigger to load a phase file (`#2464`)

Apply this section to `CLAUDE.md`, `AGENTS.md`, and `GEMINI.md`,
adapting the surrounding wording to each tool while preserving the same
workflow references and the same opt-out rule.

If `.github/copilot-instructions.md` already exists, add a parallel IDD
workflow section there as well. Keep the
`excludeAgent: "code-review"` behavior in
`.github/instructions/idd-overview-core.instructions.md`; repository-wide
Copilot guidance may still apply to reviews.

---

## Step 6 — Verification checklist

> **CLI shortcut**: `node scripts/idd-onboard.mjs --verify` automates this
> checklist — see [CLI-assisted onboarding](#cli-assisted-onboarding)
> above.

Use
[Onboarding Reference — Agent Entry and Verification](docs/onboarding/agent-entry-and-verification.md)
for the expanded verification details and evidence expectations.

After completing the steps above, confirm each item:

- [ ] Every core execution file, supporting doc, and profile artifact
      listed in Step 2 is present in the imported repository.
- [ ] `.markdownlint.yml`, `.markdownlint-cli2.yaml`, and
      `.cspell.config.yml` are present, or — if `--import` reported a
      `blockedOverwrites` finding for any of them because the target
      already had its own differing file — the template's rule
      overrides / word list were merged into the existing file by hand
      rather than skipped, so the documented `markdownlint-cli2`/`cspell`
      commands in the `Project commands` table still pass against the
      imported documentation.
- [ ] The selected PR review profile is recorded, and any non-default
      profile artifact and phase-file edits are complete.
- [ ] The selected review-thread resolution policy and critique-loop
      profile are recorded, and any non-default phase-file
      customizations are complete.
- [ ] The selected CI wait policy values, merge policy, credential
      scope, claim timing values, issue-author approval gate decision,
      maintainer approval actor policy, helper runtime profile, and
      bootstrap execution mode are explicitly recorded.
- [ ] If the operator opted into issue authoring, the companion skill
      files are present under the native destination recorded in the policy.
- [ ] No `{{...}}` placeholders remain, the `Project commands` table is
      correct, and any `orphan-first` scope choice has a valid policy
      value.
- [ ] `.github/instructions/idd-overview-core.instructions.md` keeps
      `applyTo: "**"` and `excludeAgent: "code-review"` in its
      frontmatter.
- [ ] `CLAUDE.md`, `AGENTS.md`, and `GEMINI.md` exist and reference
      `docs/idd-workflow.md`, unless the operator explicitly opted out
      of creating them.
- [ ] Among the entry files the operator did not opt out of creating,
      they agree on repository-specific engineering guidance — each
      carries it directly or points to the file(s) that own it; no
      newly created file silently drops it (observed 2026-07-27,
      kurone-kito/idd-skill#1717). Manual check: `--verify` below does
      not cover this item.
- [ ] If `.github/copilot-instructions.md` existed before onboarding,
      it now includes the IDD workflow reference as well.
- [ ] The `jsonresume-types-roadmap-id` and
      `jsonresume-types-blocked-by` marker names match the
      selected prefix, and `.github/idd/config.json` stays aligned when
      the repository uses it.

Once all items are checked, the IDD workflow is ready for use. Point the
operator to `docs/idd-workflow.md` as the starting guide.
