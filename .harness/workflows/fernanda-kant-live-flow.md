# Fernanda + Kant Live Flow

Use this workflow when the user asks to keep the visual dynamic flow active
while dex-harness records workflow decisions, review findings, flow gates,
judges and closeout evidence.

## 1. Preflight

Required before continuing:

- prove the project-named MCP tools are visible;
- start or reuse a dex-harness session;
- render the official session dashboard;
- check browser/CDP status before opening the dashboard;
- open or refresh the rendered dashboard in the browser;
- do not use the dashboard as a substitute for MCP proof.

Process rule:

- use render, not watch, unless the user explicitly asks for continuous watch;
- do not leave terminal, node, powershell or cmd processes open;
- when a helper process must be launched outside the shell tool, launch it
  hidden when it is terminal-like.

## 2. Active Owners

Kant commands the active cooperation of specialists. Fernanda coordinates the
visible phase and routing, but does not replace the owner of the technical
content.

Phase owners documented by `ancora-fluxo`:

- Pensamento: Rita Reuniao + Quele Questiona;
- Planejamento: Paula Planeja;
- Construir: Ivo Implementa, with Duda Dev when the patch is non-trivial;
- Revisar: Renata Review (`revisor-codigo`);
- Testar: Tereza Testa;
- Veredito: Vera Veredito (`validador-pronto`).

Immediate assessors:

- Chato: adversarial risk and hidden assumptions;
- Garimpeiro: reusable learning versus noise;
- Estacionamento: live residues outside the current focus;
- Akita Dev Raiz: tool, AI, automation and generated-code reality check;
- Atlas: final technical consolidation when results are spread out;
- Duda Dev: implementation executor after a safe construction cut;
- Mapeador Implementacao / Ivo: minimal technical cut, invariants and evidence.

## 2.1 Active Cooperation Routing

Fernanda must actively suggest the specialist that best reduces risk,
ambiguity or rework for the current phase.

Minimum routing rules:

- unclear premise, criterion or framing: back_to pensamento with Rita Reuniao
  and Quele Questiona;
- scope, order or sprint cut changed: back_to planejamento with Paula Planeja;
- implementation or integration issue: back_to construir with Ivo Implementa;
- real patch or multi-file edit: Duda Dev implements and returns changed files;
- changed files, diff or review target: next revisar with Renata Review;
- executable behaviour or UI evidence needed: next testar with Tereza Testa;
- readiness claim: next veredito with Vera Veredito;
- tool, automation, IA or generated-code risk: cooperate with Akita Dev Raiz;
- overengineering, weak criterion or inflated scope: cooperate with Kant;
- live residue outside the current cut: cooperate with Estacionamento;
- reusable learning: cooperate with Garimpeiro;
- scattered multi-specialist result: cooperate with Atlas.

When Duda Dev changes files, she must return:

- changed file list;
- evidence executed or not executed;
- residual risks;
- explicit review handoff to Renata Review before any test or verdict.

Current review target from this activation:

- `.harness/contracts/specs/fernanda-kant-live-flow.yaml`;
- `.harness/contracts/tasks/activate-fernanda-kant-live-flow.yaml`;
- `.harness/guides/skills/specialist-cooperation.md`;
- `.harness/workflows/fernanda-kant-live-flow.md`.

## 3. Phase Surface

Use `ancora-fluxo` as Fernanda do Fluxo in clean visual mode.

Required surface:

- phase emoji and owner names when useful in conversation;
- visible cooperators when they reduce ambiguity, risk or rework;
- direct actionable routing for small clear findings inside the current goal;
- `next:` for advancement;
- `back_to:` for regression;
- live checklist for progress;
- active credits when a specialist materially changed the result.

Live checklist should track:

- current phase;
- owner of the phase;
- active cooperators;
- direct actionable item, when any;
- changed files awaiting review;
- evidence already produced;
- next or back_to;
- credits earned by material cooperation.

Canonical phases:

1. pensamento
2. planejamento
3. construir
4. revisar
5. testar
6. veredito

## 4. Flow Gates

Every material transition should be recorded through dex-harness as
`kind=flow_gate`.

Recommended mapping:

- `advance_when`: evidence supports moving to the next phase;
- `regress_when`: a failed premise, scope, implementation or behaviour requires
  returning to the right phase;
- `stop_when`: the boundary is unsafe, unclear or outside authorization;
- `park_when`: the finding is real but outside the current focus;
- `complete_when`: the block, sprint, test, replay, contract or decision has
  evidence and can go to Vera Veredito.

Fernanda output and MCP event must agree on:

- current phase;
- gate reason;
- next or back_to;
- evidence;
- material cooperators.

Every material flow gate should include credit evidence when a specialist changed
the result, for example:

```text
Creditos Ativos: Kant reduced scope; Renata Review found missing review handoff;
Duda Dev listed changed files; Vera Veredito blocked readiness without evidence.
```

## 5. Quick-Test Rule

When the dynamic live flow is active, tests inside the live loop should be
quick or ultra quick. Medium or long tests become a planned QA block.

## 6. Vera Memory Gate

At the close of any block, sprint, test, replay, contract or decision,
Fernanda asks Vera Veredito:

```text
Isto criou, alterou ou confirmou algum contrato, regra recorrente, metodo de
execucao ou aprendizado que deve orientar pedidos futuros?
```

Before suggesting dex-memoria, read the canonical template in this order:

1. `skills/dex-agent/skills/dex-memoria/templates/memory-contract.md`
2. `skills/dex-memoria/templates/memory-contract.md`

When the subject is operational method, use the local example if it exists:

1. `.agents/CONTRATO_OPERACIONAL_CONDICAO_ACAO_EXECUCAO_RETORNO.md`
2. `skills/dex-memoria/contracts/CONTRATO_OPERACIONAL_CONDICAO_ACAO_EXECUCAO_RETORNO.md`

If memorization is recommended, Vera must use the canonical fields from the
template and prefer a short pointer over a long global memory. If memorization
is not recommended, Vera gives only the one-sentence reason.

Rules:

- do not memorize everything;
- do not invent a new format;
- global memory can be a short index pointer, not the whole contract;
- live source stays in the repo, skill, HANDOFF, ACTIVE, artifact or ledger;
- if there is conflict, the project live source wins;
- for next operational step, HANDOFF.md wins over MEMORY.ndjson;
- memoria viva must have an exit criterion.
