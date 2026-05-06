---
id: practical-harness-completion-without-ritual-loop
kind: rule
regulation: maintainability
---

# Practical Harness Completion Without Ritual Loop

Use this rule when deciding whether an dex-harness run in a real project is
complete enough to trust.

## Rule

Completion means evidenced sufficiency for the prompt, not ritual completeness.

- Check the phases the prompt actually asked for.
- Do not require `contract_task_complete` in every round; use it when the round
  is explicitly managing contract tasks or lifecycle closure.
- Treat experimental judges as review lenses unless the project explicitly
  promotes them to gates.
- Count `judge_record` evidence from `.harness/.local/steering/log.jsonl` even
  when the session only captured the judge as a `tool_call`.
- Use the dashboard to help a human understand the run; do not make the
  dashboard itself a new mandatory gate.
- If an indicated phase is absent, record it as a real gap.
- If a phase was not indicated, mark it as not required instead of failing the
  run.

## Practical closeout

A good closeout says:

- what was requested;
- which evidence was actually produced;
- which sensors or judges were used;
- which gaps remain;
- what should happen next.

Avoid adding another loop just to make the trace look canonical.
