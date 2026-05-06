# Visual Layout Before/After

Use this workflow when a project needs a visual layout audit with before
screenshots, findings, small approved patches, after evidence and a review
loop that can be replayed.

## Gates

Before product code changes:

- create one round folder under `output/visual-layout-audit/YYYY-MM-DD-HHMM/`;
- record `00-manifest.json` with target URLs, viewports, auth/public state and
  expected operational anchors;
- capture `01-before` screenshots and copy them to `02-annotated` for markup;
- write `03-findings/findings.md` and `03-findings/findings.json`;
- if findings look too shallow or the user flags omissions, regress to Chato
  adversarial review before writing `PLAN.md`;
- stop for human approval before implementation unless the user explicitly
  pre-approves automatic rounds.

After approval:

- execute small patches only inside the approved scope;
- write after evidence as `04-after/manifest.json` plus screenshots;
- update `05-comparison/README.md`;
- run visual sensors against the current round or current `04-after` evidence;
- never let sensor defaults validate an old audit silently.

## Target Rule

Visual/deploy sensors that validate a specific capture must resolve targets in
this order:

1. explicit `TARGET`;
2. command argv target;
3. newest safe `output/visual-layout-audit/**/04-after/manifest.json`;
4. clear failure.

Do not ship date-stamped fallback paths in reusable sensors.

## Multi-Round Review

After every automatic round, review whether the next round needs changes to:

- workflow;
- flow gates;
- contract tasks;
- guides;
- judges;
- sensors.

Chato must look specifically for false green: a sensor passed, but the current
screenshot still shows overlap, icon mismatch, broken alignment, truncation,
bad spacing, card nesting, omitted findings or hidden mobile actions.

If the user pre-approves automatic visual corrections, keep the loop moving
without stopping for a new approval, but still record each round separately:
before/after evidence, findings, patch scope, gates, judges, meeting output and
parked residue. Three-round runs must not collapse into one generic closeout.

When user-marked screenshots arrive during a run, treat them as manual inbox
evidence for the next findings pass. Chato reviews the marks for icons, badges,
cuts, overlap, alignment and empty lanes; Kant limits fixes to the smallest
verifiable patch; Garimpeiro and Estacionamento decide whether leftovers become
product backlog or harness improvement.

Run `visual-false-green-overlap` when all structural gates are green but current
screenshots, user marks or review notes still show visual defects. A green
sensor does not override current visual evidence.

## Ready/Auth Rule

`authReady` is required only when the capture needs authentication. Public
screens must set or imply `requiresAuthReady: false` and should still prove
`readyState`, `finalUrl`, no login-like state, no loading residue and no
horizontal overflow.

## Done

- current round artifacts exist;
- after evidence is tied to the intended target/deploy;
- sensors and judges were run against current evidence;
- meeting output records changes, parked items or explicit no-change;
- material specialist credits are recorded in session events;
- no product code is changed by harness promotion work.
