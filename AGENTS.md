# Guidelines for AI Agents

This repository publishes `@kurone-kito/jsonresume-types`, a TypeScript
type-definition package for [JSON Resume](https://jsonresume.org/). Its
single public artifact, `index.d.ts`, is generated at build time from
`@jsonresume/schema` and is **not** committed — a build-time artifact,
not source.

`AGENTS.md` exists so Codex can receive the minimum project rules
immediately, without depending on a redirect.

## Setup commands

- Install dependencies: `corepack enable && pnpm install`
- Build (regenerates `index.d.ts`): `pnpm run build`
- Lint: `pnpm run lint`
- Lint and auto-fix: `pnpm run lint:fix`
- Test (type-checks the generated `index.d.ts`): `pnpm run test`
- Clean: `pnpm run clean`

## Immediate rules

- Match the conversational language to the user's language.
- Write comments and documentation in English unless there is a clear
  project-specific reason otherwise.
- **Always** run `pnpm run lint:fix` after any change, no matter how
  small. Then verify with `pnpm run lint` before committing.
- After a schema-affecting change, run `pnpm run build` before
  `pnpm run test` — the test command type-checks the regenerated
  `index.d.ts`, so a stale build hides real failures.
- Never commit `index.d.ts`; it is generated, not source.
- If uncertainty, hidden risk, or missing context blocks a safe change,
  stop and ask a concise question before proceeding.
- Keep changes small and reviewable. If you create commits, follow the
  project's Conventional Commits rules and keep each commit atomic.
- Do not modify community documents (`CODE_OF_CONDUCT*`,
  `CONTRIBUTING*`) without explicit approval.

## Boundaries

- **Always do**: run lint:fix, follow Conventional Commits, use LF
  line endings, keep commits atomic, write docs in English
- **Ask first**: adding/removing dependencies, changing architecture,
  modifying CI workflows, altering `@kurone-kito/*-config` packages,
  changing the JSON Resume schema source (`@jsonresume/schema`)
- **Never do**: commit secrets or credentials, commit the generated
  `index.d.ts`, modify community documents without approval, disable
  linter rules without justification, skip review of AI-generated code

## Project standards

- **Indentation**: 2 spaces
- **Line endings**: LF only
- **Trailing whitespace**: trimmed except in Markdown
- **Final newline**: always present
- **File naming**: lowercase with hyphens unless a platform convention
  requires otherwise

## Commit rules

This project follows
[Conventional Commits](https://www.conventionalcommits.org/).
A `.gitmessage` template is available at the repository root.
Write user-facing, lowercase subjects, keep them under 72 characters,
and split unrelated changes into separate atomic commits.

## Canonical reference

The full, Copilot-first project guidance lives in
[.github/copilot-instructions.md](.github/copilot-instructions.md).
When that file uses Copilot-specific workflow names, apply the intent
in Codex using Codex's own interaction model rather than following the
product terms literally.
