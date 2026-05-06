---
id: specialist-material-participation-gate
kind: rule
regulation: maintainability
---

# Specialist Material Participation Gate

Use this rule when a Dex Harness dashboard, meeting, visual round, or subagent
result claims specialist cooperation.

Specialists are material only when each credited role changes or validates at
least one decision, risk, gate, patch, evidence, parking item, test, judge,
sensor, or next action.

## Required For Substantial Visual Findings

When a substantial visual finding is present, a `ready-pass` is blocked unless
the artifact has:

- `review_finding.action`: `fix_now`, `park`, or `judge`;
- a micro-meeting with divergence and convergence roles;
- `akita-dev-raiz` as immediate technical owner;
- `flow_gates.advance_when`, `flow_gates.regress_when`, and
  `flow_gates.stop_when`;
- `subagent_return.proposal`, `files`, `tests`, and `recommendation`;
- `principal_validation` by sensor or judge;
- `estacionamento` and `garimpeiro` outputs.

## Minimum Material Table

Divergence:

- `chato`
- `questionador`
- `curioso`
- `adversario-codigo`

Convergence:

- `akita-dev-raiz` as `owner` or `technical_owner`
- `kant`
- `fowler-evolutivo`
- `mapeador-implementacao`
- `revisor-codigo`
- `validador-pronto`

Operation:

- `estacionamento`
- `garimpeiro`
- `ancora-fluxo`
- `dex-harness-project-setup`

## Failure Condition

If the artifact lists names without `changed`, `proposal`, `evidence`,
`decision`, `gate`, `test`, `parked`, or `mined` output, the cooperation is
cosmetic and must not appear as material on the dashboard.
