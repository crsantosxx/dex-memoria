# Source Of Truth Coherence

SPEC.md is the canonical contract. README.md, AGENTS.md, ADRs, tests, and code
comments must not contradict it.

Before claiming the harness is stable:

- Check that README.md and AGENTS.md point to SPEC.md as source-of-truth.
- Keep protocol-visible MCP tool IDs aligned with `src/server/registry.ts`.
- When an ADR is superseded, say so explicitly instead of deleting history.
- Do not use experimental rubrics as MVP gates unless a new decision promotes
  them.
