# Bug-fix workflow

Use this prompt when a defect — not a new feature — is the unit of work. The objective is to land a regression-proof fix with the minimum surface area.

## 1. Reproduce
Capture the failing scenario as a minimal test or sensor invocation. If reproduction requires manual steps, document them in `session.append` so the next agent (or a CI bot) can replay. Don't move on until the failure is observable on demand.

## 2. Localize
Bisect or read the stack trace until you can name a single function whose contract is being violated. Pull the relevant rule guide via `harness://guides/rules/<id>` and any prior `harness.steer.suggest` notes that point to the area.

## 3. Fix
Make the smallest change that restores the function's contract. Avoid drive-by refactors; if you spot one, file a follow-up note via `session.append` instead of widening this fix.

## 4. Validate
Add or extend a test (or sensor) so the failing scenario is now permanent regression coverage. Run `sensor.run` on the relevant tools; for behavioural correctness, call `judge.review` with `spec-adherence` if the bug stems from a spec mismatch. Confirm the original reproduction now passes.

## 5. Close
Record evidence (test names, sensor outputs, PR URL) on the originating task or session. If the bug exposes a missing rule, ask `harness.steer.suggest` whether to encode it as a new guide or sensor — that's how the harness learns from this incident.
