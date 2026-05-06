---
id: two-chamber-governed-meeting
kind: rule
regulation: maintainability
---

# Two-Chamber Governed Meeting

Use this rule for governed harness rounds that need divergence before
convergence.

## Divergence Chamber

Required roles:

- `reuniao`: facilitator and owner of the meeting artifact;
- `questionador`: exposes hidden assumptions, scope and criteria;
- `chato`: attacks visual/process gaps and false-green risks;
- `adversario-codigo`: attacks executable behavior, edge cases and automation;
- `curioso`: clarifies real-use context and what is still unknown.

The divergence chamber must produce:

- `dominant_tension`;
- `questions_that_change_decision`;
- `false_green_risks`;
- `unknowns_or_assumptions`;
- `divergence_output`.

## Convergence Chamber

Required roles:

- `kant`: keeps the solution small, simple and verifiable;
- `akita-dev-raiz`: checks technical reality and tool/automation theater;
- `mapeador-implementacao`: maps the smallest executable implementation;
- `duda-dev`: owns the implementation cut when code changes are needed;
- `revisor-codigo`: reviews the diff or executable behavior;
- `validador-pronto`: gives the readiness verdict from evidence.

The convergence chamber must produce:

- `selected_strategy`;
- `implementation_map`;
- `review_plan`;
- `ready_evidence`;
- `verdict_gate`;
- `next_task_or_parking`.

## Automation Contract

The round may not move from meeting to patch unless both chambers are present.
The round may not move from patch to complete unless the convergence chamber
has evidence and a verdict gate.
