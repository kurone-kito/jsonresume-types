# AI tooling strategy

This repository's AI guidance is split into a canonical guide and
per-tool compatibility entry points, following the upstream
[pnpm-project-template](https://github.com/kurone-kito/pnpm-project-template)
convention.

## Canonical guidance

- [.github/copilot-instructions.md](../.github/copilot-instructions.md)
  is the canonical, fully detailed AI guide. Keep it complete enough
  for GitHub Copilot CLI and VS Code Copilot Chat.
- [AGENTS.md](../AGENTS.md) is a Codex compatibility entry point. It
  must stay self-contained for the rules that Codex needs immediately,
  then point to the canonical Copilot guide for the remaining detail.
- [CLAUDE.md](../CLAUDE.md) is a Claude Code compatibility entry point
  with the same role.
- [GEMINI.md](../GEMINI.md) is a Gemini CLI compatibility entry point
  with the same role.

## Change policy

- Prefer preserving existing Copilot behavior over abstracting too
  early.
- Duplicate only the minimum guidance needed for non-Copilot agents to
  act safely and predictably.
- When a rule uses a Copilot-specific feature name, document the
  underlying intent so other agents can map it to their own interaction
  model.
- The rule that `index.d.ts` is a generated, non-committed artifact is
  load-bearing across every entry file — keep it in sync everywhere it
  appears if the build output ever changes shape.

## Maintenance notes

- Treat this file as a human-facing strategy note, not as the primary
  instruction file for any agent.
- When updating AI guidance, review `README.md`,
  `.github/copilot-instructions.md`, `AGENTS.md`, `CLAUDE.md`, and
  `GEMINI.md` together.
