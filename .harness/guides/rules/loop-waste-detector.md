---
id: loop-waste-detector
kind: rule
regulation: maintainability
---

# Loop Waste Detector

Use this rule when a round repeats the same class of command, capture, deploy,
sensor, judge or patch attempt.

If an artifact records two or more failed attempts, the next attempt is blocked
until the round records:

- `detected_reason`;
- `strategy_shift`;
- `stop_rule`;
- `next_gate`.

The strategy shift must change the tactic, target, evidence path, gate or owner.
Retrying the same action with more confidence is not a strategy shift.
