---
id: specialist-material-credit
kind: rule
regulation: maintainability
---

# Specialist Material Credit

Use this rule whenever a workflow, meeting, dashboard or session claims that a
specialist participated.

## Rule

A specialist is materially credited only when the contribution changes at least
one of these:

- decision;
- risk classification;
- patch scope;
- flow gate;
- task status;
- sensor or judge requirement;
- evidence accepted or rejected;
- parking-lot item;
- memory or reusable rule.

If a specialist was only mentioned, mark it as cited, not credited.

## Required Fields

Every material credit should name:

- specialist;
- phase;
- provocation or lens applied;
- artifact or event affected;
- concrete change produced.

## Failure Condition

Do not close a governed visual round when named specialists were required but no
material contribution event exists for them.
