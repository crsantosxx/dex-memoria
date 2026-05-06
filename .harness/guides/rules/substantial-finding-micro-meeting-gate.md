---
id: substantial-finding-micro-meeting-gate
kind: rule
regulation: maintainability
---

# Substantial Finding Micro-Meeting Gate

Use this rule when a new substantial finding appears during an active governed
round. A substantial finding is a new issue that can change scope, patch order,
rollback/regression decision, evidence gates, or the ready verdict.

## Required Flow

1. Record the trigger as `substantial_finding` with `finding_id`, `summary`,
   `severity`, and `evidence`.
2. Run a fast micro-meeting with divergence and convergence chambers.
3. Record `review_finding.action` as one of:
   - `fix_now`
   - `park`
   - `judge`
4. Define `flow_gates`:
   - `advance_when`
   - `regress_when`
   - `stop_when`
5. Require subagent output with:
   - `proposal`
   - `files`
   - `tests`
   - `recommendation`: `keep`, `redo`, or `undo`
6. The principal agent may only close after validating the result with a sensor
   or judge and recording the evidence.

## Minimum Table

Divergence:

- `chato`
- `questionador`
- `adversario-codigo`
- `curioso`

Convergence:

- `akita-dev-raiz`
- `kant`
- `fowler-evolutivo`
- `mapeador` or `mapeador-implementacao`
- `revisor` or `revisor-codigo`
- `validador` or `validador-pronto`

Always required:

- `estacionamento`: parks non-active work or explicit no-parking decision.
- `garimpeiro`: mines reusable learning or explicit no-learning decision.

## Failure Condition

If the artifact only says that people agreed, or if it lacks action, flow gates,
subagent recommendation, or principal validation evidence, the round must not
advance as complete.
