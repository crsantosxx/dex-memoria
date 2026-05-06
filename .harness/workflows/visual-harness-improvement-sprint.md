# Visual Harness Improvement Sprint

Use this workflow when parked visual-audit learnings are promoted into
dex-harness improvements.

## Goal

Reduce false positives in visual/browser audits before any new product layout
work starts.

## Gates

- Each parked item becomes one task with its own evidence.
- Reusable judges must be packaged as `<id>.md` plus `<id>.schema.json`.
- Reusable sensors must run against a real audit artifact before completion.
- Visual/deploy sensors must not keep stale date-stamped defaults. They should
  use explicit `TARGET`, argv, newest safe `04-after/manifest.json`, or fail
  loudly.
- A local project proof should run before promotion to the main `dex-harness`
  repository.
- Runtime package update is not project surface sync. If a promoted reusable
  workflow, guide, judge or sensor must be available in a child project, copy or
  sync the safe `.harness/` surface and prove it through MCP.
- Do not touch product frontend/backend/runtime code in this workflow.
- If a proposed improvement is useful but not executable yet, keep it parked
  with a clear trigger instead of calling it complete.

## Default Order

1. Judge package completeness.
2. Before/after pairing.
3. Public deploy commit gate.
4. Nested card/density judge.
5. First-fold operational density.
6. Mobile primary action reachability.
7. Round retrospective output gate.
8. OpenAI frontend prompt application gate.
9. Technical payload readability.
10. Harness drift guard.
11. Visual false-green overlap judge.
12. Dashboard specialist credit clarity.

## Round Review

Every post-round meeting should check whether the learning belongs in a
workflow, flow gate, contract task, guide, judge or sensor before the next
round starts. Chato should explicitly look for false green: a sensor passed,
but the current screenshot still shows overlap, icon mismatch, truncation,
alignment defects or omitted visual findings.

Garimpeiro should promote only recurring mechanisms, not every visual defect.
Estacionamento should keep a typed queue with trigger, owner and destination for
anything useful that is not executable in the current harness sprint.

Dashboard improvements must distinguish material credits from available
specialists. A specialist should appear as active because a session event names
their contribution, not because a workflow listed them in advance.

After a reusable artifact is promoted, prove a child project can see it from MCP:
list resources, call `judge_list`, call `sensor_list`, and confirm specific
artifacts such as `visual-false-green-overlap` when that judge is part of the
promotion. If a stale MCP window does not show the artifact, reload before
declaring sync complete.

## Done

- All selected tasks are completed or explicitly re-parked.
- Sensors pass against the latest real audit artifact.
- Judges include schemas.
- The dex-harness session records task evidence and final `complete_when`.
