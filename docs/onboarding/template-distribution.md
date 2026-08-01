# Template Distribution Maintainer Reference

Use this page when maintaining the file distribution surface for
`idd-template/ONBOARDING.md`. The onboarding entry point remains the
operator-facing import path; this page explains how the file list and
fetch examples stay correct when the template gains, removes, or moves
files.

This is primarily a maintainer reference for the `idd-skill` source
repository. Adopters who receive it with the copied template can treat it
as background unless they intentionally customize their local template
distribution lists.

## Distribution surfaces

The template has three distribution surfaces:

1. **Core template files** copied from `idd-template/` into the adopter
   repository. These include `.github/idd/`, `.github/instructions/`,
   `docs/`, and `profiles/`.
2. **Optional issue-authoring companion files** copied from
   `skills/issue-authoring/` only when the operator explicitly opts into
   pre-execution issue drafting.
3. **Local-copy installs** where an agent copies the full
   `idd-template/` directory from a cloned `idd-skill` checkout instead
   of fetching individual files.

`idd-template/ONBOARDING.md` keeps the executable import snippets for
the first two surfaces so a raw-URL onboarding run can still complete
without opening this reference first.

## Generated file lists

The authoritative generated lists are configured in
`audit/sync-manifest.json`:

- `generatedBlocks[].id == "idd-template-core-files"` owns the core
  template file list.
- `generatedBlocks[].id == "issue-authoring-companion-files"` owns the
  optional issue-authoring companion list.
- `shellFileLists` ties each generated list to the `gh api` and `curl`
  loops in `idd-template/ONBOARDING.md`.

When adding a core template file, update both `sourceGlobs` and `paths`
for `idd-template-core-files` when the new path is not already covered.
The docs audit compares those entries with the repository files and
fails if the generated block or shell loops are stale.

When adding an optional issue-authoring companion file, update the
`issue-authoring-companion-files` block instead. Do not put optional
companion files in the core template list unless the execution loop
requires every adopter to receive them.

## Profile-conditional helper files (`vendored-node`)

`scripts/minimize-superseded-markers.mjs` (mirrored to
`idd-template/scripts/minimize-superseded-markers.mjs` by the
`minimize-superseded-markers-helper` syncPair) is invoked from template
instruction files, but it is deliberately **not** part of the
`idd-template-core-files` block or Option A's remote-fetch loops — every
`idd-template/**` doc and instruction file those instruction files
reference is core, but a `scripts/*.mjs` helper reference (this one
included) is not, since every helper script is `vendored-node`
profile-conditional. This is intentional, not an oversight:

- `idd-onboard.mjs`'s `resolveImportFiles` hard-fails with a "manifest
  drift: duplicate target path" error if a file's target path appears in
  both the always-shipped core set and the `vendored-node`
  profile-conditional helper bundle (`collectVendoredFiles` in
  `helper-runtime-manifest.mts`, which already vendors this file for
  that profile) — observed 2026-07-31, #1698, when adding this file to
  the core set tripped exactly that guard. The core set and the
  profile-conditional bundle must stay disjoint by construction.
- Putting it in the core set would also make `buildSwitchPlan` (used to
  compute add/remove diffs when an adopter switches profiles) list it
  under `removeFiles` on a `vendored-node` → non-`vendored-node` switch,
  deleting a file the adopter still needs — a real data-loss hazard, not
  just a manifest-consistency one (preventive; no observed incident
  yet).
- Every instruction-file call site degrades gracefully ("Skip entirely
  if … the helper is unavailable"), so the practical effect of the
  exclusion is bounded capability on some install paths, not breakage.

**What this means for adopters**: this helper is mirrored into
`idd-template/` (via the `minimize-superseded-markers-helper`
syncPair), but it is the only `vendored-node` helper a plain Option B
copy (copying the `idd-template/` tree) actually supplies — Option B
does **not** ship the rest of the `vendored-node` bundle, since none of
the other files `collectVendoredFiles` manages under the source
repository's own `scripts/` have an `idd-template/` mirror. Getting the
**complete** `vendored-node` bundle requires running this from the clone
(see
[CLI-assisted onboarding](../../ONBOARDING.md#cli-assisted-onboarding)):

```sh
node scripts/idd-onboard.mjs --import --source <path-to-a-cloned-idd-skill-tree> \
  --target <target-repo> --profile vendored-node
```

This reads from the clone's repository-root `scripts/`, not
`idd-template/scripts/` — a full `idd-skill` clone, not just the
`idd-template/` subtree. Neither path is available to a pure Option A
remote-fetch install with no local clone. An Option A adopter who
selected the `vendored-node` profile and wants this one self-contained
helper without cloning the repository can fetch it directly, the same
way Option A fetches every other file:

```sh
mkdir -p scripts
curl -fsSL \
  "https://raw.githubusercontent.com/kurone-kito/idd-skill/main/idd-template/scripts/minimize-superseded-markers.mjs" \
  -o scripts/minimize-superseded-markers.mjs
```

If a future change makes this helper (or another `vendored-node`
helper) a genuine cross-profile core dependency, resolve the
core/profile-conditional overlap in `idd-onboard.mts` and
`helper-runtime-manifest.mts` first — do not add it to
`idd-template-core-files` while the disjointness invariant above still
holds. `node scripts/audit-docs.mjs --check` (which `checkGeneratedBlocks`
backs) only compares this doc's generated file list against
`audit/sync-manifest.json`; it has no awareness of the `vendored-node`
bundle in `helper-runtime-manifest.mts`, so it will not catch the
overlap. `resolveImportFiles`'s `manifest drift: duplicate target path`
hard-fail does catch it (the same #1698 incident cited above), but only
under `pnpm run lint`'s full test suite (`node --test`), which
`pre-push-validate` does not run — so a change that only satisfies
`audit-docs.mjs --check` can still break `idd-onboard.mjs`. This needs a
maintainer decision, not a mechanical file-list edit.

## Remote fetch examples

The `gh api` and `curl` loops in `idd-template/ONBOARDING.md` intentionally
list every file instead of fetching directories. This keeps raw-content
imports deterministic and makes missing files visible during onboarding.

For a new core file, ensure that both loops include the path after the
generated list is updated. The audit checks the shell lists against the
same generated block, so a path that appears in one loop but not the
other is treated as stale documentation.

For nested documentation such as `docs/onboarding/*.md`, the existing
loop body creates parent directories with `mkdir -p "$(dirname
"${DEST}/${FILE}")"`. No extra top-level `mkdir -p` entry is required
for each nested docs directory.

## Local-copy installs

The local-copy path is intentionally broader than the remote-fetch path:
copy the contents of `idd-template/` while preserving relative paths.
That means new core files under `idd-template/` are automatically covered
by local-copy installs after they are committed.

Keep the local-copy prose in `idd-template/ONBOARDING.md` short. Use this
reference for maintenance details and the generated remote-fetch snippets
for exact file coverage.

## Maintenance checklist

Before merging a distribution-surface change, verify:

- `audit/sync-manifest.json` includes every required new core file.
- the generated core file block in `idd-template/ONBOARDING.md` includes
  the new path.
- the `gh api` and `curl` loops in `idd-template/ONBOARDING.md` include
  the same path.
- optional issue-authoring files remain in the optional companion list.
- `idd-template/README.md` mentions the new reference page when it is
  part of the exported template documentation set.
- `node scripts/audit-docs.mjs --check` passes.
