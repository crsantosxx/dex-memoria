---
id: bad-loop-guard
kind: rule
regulation: maintainability
---

# Bad Loop Guard

Use this rule when an agent repeats a failing tactic during deploy, capture,
auth, visual validation, meeting, judge or sensor work.

Loops are normal in real work. The failure is not that a loop appeared; the
failure is continuing without a method.

## Trigger

A loop is suspected after either:

- the same command or tactic fails twice with the same reason;
- a gate returns to the same phase without a new hypothesis;
- a screenshot/capture is repeated while the page is still not materially
  ready;
- a meeting repeats the same specialist names without changing focus,
  evidence, parking or next gate.

## Required Exit

Before the next attempt, record a typed loop-control artifact with:

- `repeated_failure`;
- `attempts`;
- `detected_reason`;
- `strategy_shift`;
- `stop_rule`;
- `owner`;
- `next_gate`.

## Method

When the loop appears:

1. Name the repeated failure in one sentence.
2. Count the attempts that share the same tactic or assumption.
3. Extract the best current reason from evidence.
4. Choose exactly one of:
   - change strategy and run one new attempt;
   - park the item with what would unblock it;
   - ask for human action if the next step requires external access.
5. Register the next gate that will decide whether the new strategy worked.

If no strategy shift is available, park the item and stop the loop. Do not spend
more time by repeating the same command with different optimism.
