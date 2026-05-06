---
id: governed-meeting-flow
kind: workflow
regulation: maintainability
---

# Governed Meeting Flow

Use this workflow when a material finding, visual audit, dashboard decision or
subagent output needs specialist participation.

The flow is visible and ordered:

```text
Divergence -> Convergence -> Actionable -> Gate
```

## Phase Plan

1. Detect material finding
   - record `review_finding` or equivalent typed finding;
   - classify action as `fix_now`, `park` or `judge`.
2. Open `divergence`
   - Chato asks what is paid space, risk or complexity without utility;
   - Questionador pressures hidden assumptions and false positives;
   - Curioso maps unknown real-use context;
   - Adversario Codigo attacks executable edge cases.
3. Open `convergence`
   - Akita Dev Raiz owns technical sanity and metric choice;
   - Kant cuts scope to the smallest verifiable action;
   - Fowler Evolutivo keeps the path incremental;
4. Produce `actionable`
   - proposal;
   - files or surfaces;
   - tests;
   - recommendation: keep, redo or undo.
   - Mapeador Implementacao is required when the action changes implementation,
     patch, sync, script/scripts, spec, sensor, judge, workflow, contract,
     runtime or another governed surface.
5. Register `gate`
   - `advance_when`;
   - `regress_when`;
   - `stop_when`;
   - `principal_validation` by sensor or judge.
   - Revisor Codigo is required when a diff or versioned/executable surface
     changed.
   - Validador Pronto is required when the flow claims ready, done, synced,
     keep, passed or complete.
6. Park and mine residues
   - Estacionamento records live residues;
   - Garimpeiro records reusable learning;
   - Ancora Fluxo records `next` and `back_to`;
   - Dex Harness Project Setup records root/local sync evidence;
   - Sentinela LLM records trust boundary when MCP, files, dashboard or external actions are involved.

## Visible Surfaces

`Pensamento` and `Planejamento` must show enough governance for the user to see
that participation is material:

- owner;
- cooperators;
- material credits;
- current decision;
- `next`;
- `back_to`.

## Gate

Run:

```powershell
node .harness/scripts/check-governed-meeting-flow.cjs <artifact-or-folder>
```

The gate must pass before a material decision becomes `ready-pass` or equivalent.
