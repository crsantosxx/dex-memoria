---
id: governed-meeting-flow
kind: rule
regulation: maintainability
---

# Governed Meeting Flow

Use this rule when a Dex Harness session, dashboard, visual audit or subagent
claims that specialists participated in a material decision.

The visible method is:

1. `divergence`
2. `convergence`
3. `actionable`
4. `gate`

This method must appear in Dex Harness `Pensamento` and `Planejamento` surfaces
when a material decision is being made. Hidden session events are useful
evidence, but they do not replace visible coordination.

## Visible Thinking And Planning

`pensamento` should show:

- `owner`
- `cooperadores`
- why the meeting exists
- the method: `Divergence -> Convergence -> Actionable -> Gate`
- `next`
- `back_to`

`planejamento` should show:

- `owner`
- `material_credits`
- the recorded meeting id, when available
- current decision
- next actionable command or gate

## Evidence Folder Convention

Prefer storing governed meeting evidence under the active harness evidence
folder:

```text
.harness/evidence/<session-or-round-id>/governed-meeting-flow.yaml
```

This path keeps session evidence, round evidence and dashboard references
addressable without guessing which loose artifact belongs to the current run.
Existing loose meeting artifacts remain valid for compatibility, but new rounds
should write or copy the governed artifact into the folder above before claiming
`ready-pass`, `material-pass`, `synced`, `keep` or equivalent.

## Required Flow

`divergence` must record material output from:

- `chato`
- `questionador`
- `curioso`
- `adversario-codigo`

`convergence` must record material output from:

- `akita-dev-raiz`
- `kant`
- `fowler-evolutivo`

The transversal specialists below are conditional gates, not decorative required
names:

- `mapeador-implementacao` is required in `actionable` when there is
  implementation, patch, sync, script/scripts, spec, sensor, judge, workflow,
  contract, runtime or other surface change.
- `revisor-codigo` is required in `gate` when a diff, script/scripts, sensor, spec,
  workflow, contract, runtime or versioned surface changed.
- `validador-pronto` is required in `gate` when the artifact claims ready, done,
  synced, keep, passed, complete or equivalent.

`vivos` must record live operation output from:

- `estacionamento`
- `garimpeiro`
- `ancora-fluxo`
- `dex-harness-project-setup`
- `sentinela-llm`

`actionable` must include:

- `proposal`
- `files` or `surfaces`
- `tests`
- `recommendation`: `keep`, `redo`, or `undo`
- `micro_tasks`

Each `micro_tasks` item must include:

- `id`
- `owner`
- `meeting_id` or `decision_origin`
- `surface` or `file`
- `action`
- `test` or `gate`
- `ready_criteria`
- `recommendation`: `keep`, `redo`, or `undo`

Each implementable `micro_tasks` item must also carry the transversal delivery
rails:

- `implementation_owner`: `mapeador-implementacao`
- `review_owner`: `revisor-codigo`
- `validation_owner`: `validador-pronto`

If the task is explicitly no-code, state that in the task. Otherwise the gate
treats a file, script, sensor, runtime, patch, diff or changed surface as
implementable.

A material meeting that ends only in minutes, rationale or a decision is not
actionable enough for `material-pass` or `ready-pass`.

When `visual-regression-loop-stop` fires after three same-finding regressions,
the meeting output must also include a strategy change trail:

- `causal_hypothesis`
- `single_proposal` or `strategy_shift`
- `measurable_gate`

`gate` must include:

- `advance_when`
- `regress_when`
- `stop_when`
- `principal_validation`: sensor or judge evidence

## Dashboard Credits

Dashboard credits should display a specialist as material only when the artifact
records:

- phase: divergence, convergence, actionable, gate or vivos;
- contribution: what changed, blocked, validated, parked or mined;
- evidence: file, sensor, judge, decision or flow gate.

If a role is named without contribution and evidence, display it as `cited`, not
as `credited`.

## Security Boundary

`sentinela-llm` must be present whenever the flow uses MCP, browser, external
messages, files from users, dashboards or generated artifacts. Its output should
name the trust boundary and whether the artifact is trusted instruction,
untrusted data, private data or external action.
