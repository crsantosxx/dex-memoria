# Project setup workflow

Use this workflow when `dex-harness` is being installed, proven, or dogfooded in
an external project. The goal is to turn a short briefing into a contract-guided
delivery without asking the human to spell out every operational step.

## 1. Prove MCP before work

Confirm the expected project-named MCP server is visible in the current client.
List tools, resources, and prompts when the client exposes those surfaces.

Gates:

- If MCP tools are not visible, stop.
- If `cwd` is not the target project, stop.
- If `HARNESS_ROOT` is not the target project's `.harness`, stop.
- Shell commands may support preflight, but shell output is not MCP proof.

## 2. Inspect harness shape

If the target project already has `.context/`, use it as feedforward context for
the diagnosis. If it does not exist, do not block setup and do not install
`@dotcontext/cli` automatically.

For a fresh installation, follow `docs/installation.md` before treating the
setup as repeatable.

Package runtime update is not local harness surface sync. Updating
`.harness/.local/runtime/node_modules/dex-harness` changes the server package,
but it does not by itself copy new reusable workflows, guides, judges or sensors
into the target project's versionable `.harness/` tree.

When the package was installed or updated and the project should receive new
reusable harness artifacts, run the safe surface sync from the installed package
or from a local checkout:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".harness\.local\runtime\node_modules\dex-harness\tools\sync-project-harness-surface.ps1" `
  -ProjectRoot "<target-project>"
```

This sync is allowed to copy only:

```text
.harness/workflows/
.harness/guides/rules/
.harness/guides/skills/
.harness/judges/        # .md plus .schema.json pairs
.harness/sensors/
.harness/scripts/       # reusable sensor scripts only; never .local runtime
```

It must not touch `.harness/.local/`.

After syncing, MCP proof is mandatory:

- list resources and confirm expected workflows/guides are visible;
- call `judge_list` and confirm expected judges, for example
  `visual-false-green-overlap`;
- call `sensor_list` and confirm expected sensors;
- if the MCP window does not reflect the copied files, reload/open a new MCP
  client window before declaring the project updated.

Check whether the target `HARNESS_ROOT` has useful project harness content
outside `.local/`.

If it is empty, create the smallest useful bootstrap before the main task:

```text
.harness/
  guides/rules/
  guides/skills/
  sensors/
  judges/
  contracts/specs/
  contracts/tasks/
  workflows/
```

Add only project-specific guides, workflows, sensors, specs, or tasks that are
needed for the current delivery. Do not create a broad framework.

Load `harness://guides/skills/specialist-cooperation` when review, flow control
or closeout needs specialist cooperation.

## 3. Open a session

Call `session_start` before the main work. Then call `session_append` with:

- the target project;
- the current goal;
- the safety boundaries;
- the reason this delivery is allowed to proceed.

Gate: without `session_id`, there is no dogfood.

## 4. Scan project memory

Before deciding the project's harness shape, look for safe project memory
surfaces:

- `INDEX.md`
- `AGENTS.md`
- `.agents/PROJECT.md`
- `.agents/ACTIVE.md`
- `.agents/HANDOFF.md`
- `.agents/MEMORY.ndjson`
- `.codex/napkin.md`

If the project has `memory-bank/`, read it only when there is evidence that the
project explicitly adopted that experimental or legacy local layer. Do not treat
`memory-bank/` as the universal default memory surface.

Do not read `.env`, secrets, logs, caches, `.harness/.local`, `node_modules`, or
raw runtime state.

Exception: the official session dashboard renderer is allowed to read the
session and steering files it renders under `.harness/.local/`. This exception
does not allow manual inspection of raw logs, secrets, runtime internals,
telemetry dumps, caches, or arbitrary `.harness/.local` contents.

Separate live memory from historical ledger. `HANDOFF.md` wins for the next
operational step; historical memory informs diagnosis but does not become a live
queue.

Record either the memory summary or the explicit absence of memory surfaces with
`session_append`.

## 5. Create the minimal contract

Create or update one spec under `.harness/contracts/specs/` for the real
delivery. The spec should contain objective acceptance criteria and task refs.

Keep it small:

- what must exist at the end;
- what must not be touched;
- what validation proves the result;
- where the agent must stop.

Run `contract_spec_validate`. If checks are intentionally empty, record that the
validation only proves contract plumbing, not behavioural quality.

## 6. Execute through tasks

Call `contract_task_next` for the spec. Execute the returned task until the
acceptance criteria are satisfied or a gate fails.

Use `session_append` for material milestones:

- files created or adapted;
- validation performed;
- review findings with `kind: "review_finding"`;
- flow decisions with `kind: "flow_gate"`;
- blockers;
- safety decisions;
- final verdict.

When the task is truly satisfied, call `contract_task_complete` with evidence.

## 7. Validate proportionally

Run only validations that match the delivery:

- docs-only: tree, forbidden-file scan, required-file check, and relevant render
  checks;
- runtime/code: typecheck, tests, integration tests, or sensors;
- behavioural ambiguity: judge review only when the spec asks for it.

Do not make sensors or judges ceremonial gates.

When creating, editing, copying, or promoting a judge rubric, apply
`harness://guides/rules/judge-package-completeness` and run
`judge-package-completeness` before declaring the judge ready. A judge is not a
complete artifact unless both `.harness/judges/<id>.md` and
`.harness/judges/<id>.schema.json` exist, the schema parses as JSON, and the
markdown `id` / `regulation` match the schema `tool.const` / `regulation.const`.

## 8. Review, gate and close

Before calling a delivery done, separate:

- Review: achados, riscos e lacunas;
- Flow Gate: avancar, regressar, parar, estacionar ou concluir;
- Judge: veredito estruturado quando houver rubric;
- Complete: fechamento de task apenas com evidencia.

Use `review_finding` for material findings and `flow_gate` for the transition
decision.

When a material finding concerns harness boundaries, run the seeded
`harness-boundary` judge after Review and Flow Gate:

```text
review_finding -> flow_gate -> judge_review(harness-boundary) -> judge_record
```

Use this only when the judge can change the setup verdict. Do not run it as a
ceremonial gate for every project.

For Vercel projects, run `sensor_run` with `vercel-harness-boundary` when
`.vercelignore` exists or when deploy pollution is a risk.

## 9. Observe and close

Render or watch the session dashboard with the official dashboard tool.
Dashboard evidence is observability; it does not replace MCP proof. A prompt
that forbids reading `.harness/.local` still permits this official rendering
unless it explicitly says not to render the dashboard.

Close with:

- spec used or created;
- task executed;
- delivery made;
- validation;
- git status;
- evidence recorded;
- what was intentionally not done;
- next safe step.

Stop before destructive or publishing actions such as push, global config edits,
or deleting source material unless the human explicitly authorized them.
