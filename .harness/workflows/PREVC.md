# PREVC - Plan, Research, Execute, Validate, Commit

A five-step loop for landing changes safely against a contract. Tools used at
each step are listed inline; the agent should call them via MCP rather than
guessing.

## 0. Bootstrap

Immediately after `session_start(workflow: "PREVC")`, record the operational
bootstrap before doing implementation work:

1. Create or identify the PRD/plan artifact.
2. Create or identify the SPEC artifact.
3. Create or identify the execution LOG artifact.
4. If a contract is in scope, call `contract_task_next` or record the active
   task id.
5. Call `session_append` with `kind: "decision"`, `what: "PREVC bootstrap"`,
   and a `rationale` that names the plan/PRD, SPEC, LOG and task/contract.

Do not record `flow_gate: "advance_when"` until this bootstrap exists. The
runtime `operational-advance-gate` blocks PREVC advance when the session has no
plan/spec/log or equivalent contract task evidence.

## 1. Plan

Restate the goal in one paragraph. If a `spec_id` is in scope, fetch it via
`harness://contracts/specs/<id>` and call `contract_task_next(spec_id)` to
anchor on the next pending task. Note open questions; refuse to invent
acceptance criteria the spec does not state.

## 2. Research

Read the relevant guides (`harness://guides/rules/*`,
`harness://guides/skills/*`) and the surrounding code. Map every acceptance
criterion in the spec to a concrete file or interface. If something is missing,
surface it before writing code.

## 3. Execute

Make the smallest change that satisfies the current task. Stay inside files
mentioned in the spec or the chosen task. If you must touch code outside that
scope, record the rationale in `session_append`.

## 4. Validate

Run the cheapest sensors first via `sensor_run` (linter, type-check,
structural). If they pass, escalate to `judge_review` against `spec-adherence`
or another rubric the spec demands. Finally, call `contract_spec_validate` to
dispatch all spec-declared checks. Do not move on while any sensor or judge
reports an unresolved violation.

Before any `session_append` with `flow_gate: "advance_when"`, run:

```text
sensor_run(id: "operational-advance-gate", target: "<active session jsonl or project root>")
```

If the gate reports `meeting_required`, stop direct patching and record a
structured meeting or `flow_gate: "regress_when"` with:

- participants;
- causal_hypothesis;
- strategy_shift;
- advance_when;
- stop_when.

## 5. Commit

Capture evidence - sensor and judge outputs, PR link - and call
`contract_task_complete(task_id, evidence)`. Open the PR with a description that
quotes the spec section being satisfied and the validation summary.

If validation fails at any step, return to Plan or Research; never paper over a
failing sensor by editing the sensor itself.
