# normalize-global-memory-write-policy inventory

Scope checked on 2026-05-06:

- `C:\CodexProjetos`
- `D:\Drive\SegundaMente\CrSantos\skills\dex-agent\skills`

Exclusions used:

- `.git`, `.env*`, `node_modules`, `dist`, `.cache`, `cache`, `logs`
- `.harness/.local`, `.harness/**/sessions`, `telemetry`

## Local dex-memoria copies

- `C:\CodexProjetos\AgendadorConsultasOticas\skills\dex-agent\skills\dex-memoria\SKILL.md`
- `C:\CodexProjetos\ConfiguracoesWindows\skills\dex-agent\skills\dex-memoria\SKILL.md`
- `C:\CodexProjetos\ControlePessoal\skills\dex-agent\skills\dex-memoria\SKILL.md`
- `C:\CodexProjetos\CriadorAgentico\skills\dex-agent\skills\dex-memoria\SKILL.md`
- `C:\CodexProjetos\dex-agent\skills\dex-memoria\SKILL.md`
- `C:\CodexProjetos\dex-harness\skills\dex-memoria\SKILL.md`
- `C:\CodexProjetos\dex-memoria\SKILL.md`
- `C:\CodexProjetos\PremierAgenda\skills\dex-agent\skills\dex-memoria\SKILL.md`
- `C:\CodexProjetos\PremierDashboard\skills\dex-agent\skills\dex-memoria\SKILL.md`
- `D:\Drive\SegundaMente\CrSantos\skills\dex-agent\skills\dex-memoria\SKILL.md`

## Memory-system directories

- `C:\CodexProjetos\AgendadorConsultasOticas\skills\dex-agent\docs\memory-system`
- `C:\CodexProjetos\ConfiguracoesWindows\CodexClaw\docs\memory-system`
- `C:\CodexProjetos\ConfiguracoesWindows\skills\dex-agent\docs\memory-system`
- `C:\CodexProjetos\ControlePessoal\skills\dex-agent\docs\memory-system`
- `C:\CodexProjetos\CriadorAgentico\skills\dex-agent\docs\memory-system`
- `C:\CodexProjetos\dex-agent\docs\memory-system`
- `C:\CodexProjetos\PremierAgenda\skills\dex-agent\docs\memory-system`
- `C:\CodexProjetos\PremierDashboard\skills\dex-agent\docs\memory-system`

## Active policy conflicts found

- `C:\CodexProjetos\dex-agent\docs\memory-system\README.md`
  - says not to write global Codex memory directly
  - says global memory remains read-only
- `C:\CodexProjetos\dex-agent\tests\projectMemoryService.test.ts`
  - fixtures and prompts assert global memory read-only
- `C:\CodexProjetos\ConfiguracoesWindows\skills\dex-agent\docs\memory-system\README.md`
  - same direct-write and read-only wording
- `C:\CodexProjetos\ConfiguracoesWindows\skills\dex-agent\tests\projectMemoryService.test.ts`
  - same read-only fixtures and prompts
- `C:\CodexProjetos\ControlePessoal\skills\dex-agent\docs\memory-system\README.md`
  - same direct-write and read-only wording
- `C:\CodexProjetos\ControlePessoal\skills\dex-agent\tests\projectMemoryService.test.ts`
  - same read-only fixtures and prompts
- `C:\CodexProjetos\PremierAgenda\skills\dex-agent\docs\memory-system\README.md`
  - same direct-write and read-only wording
- `C:\CodexProjetos\PremierAgenda\skills\dex-agent\tests\projectMemoryService.test.ts`
  - same read-only fixtures and prompts
- `C:\CodexProjetos\CriadorAgentico\skills\dex-agent\tests\projectMemoryService.test.ts`
  - already softened to consultation-only, but still contradicts explicit global pointer writes
- `C:\CodexProjetos\AgendadorConsultasOticas\README.md`
  - says global memory helper is read-only and writes nothing outside the workspace

## Runtime surfaces

Primary live runtime:

- `C:\CodexProjetos\dex-agent\src\orchestrator\memoryService.ts`
- `C:\CodexProjetos\dex-agent\src\orchestrator\memoryRecallEngine.ts`
- `C:\CodexProjetos\dex-agent\src\orchestrator\memorySurfaceMaintenance.ts`

Mirrored runtime copies:

- `C:\CodexProjetos\ConfiguracoesWindows\skills\dex-agent\src\orchestrator\memoryService.ts`
- `C:\CodexProjetos\ControlePessoal\skills\dex-agent\src\orchestrator\memoryService.ts`
- `C:\CodexProjetos\CriadorAgentico\skills\dex-agent\src\orchestrator\memoryService.ts`
- `C:\CodexProjetos\PremierAgenda\skills\dex-agent\src\orchestrator\memoryService.ts`

Observed current behavior:

- global markdown memory is read from `MEMORY.md` and `memory_summary.md`
- durable workspace memory is appended to `.agents/MEMORY.ndjson`
- no dedicated explicit-turn writer for short global pointers was found in the primary runtime

## Initial implementation guidance

1. Fix canonical wording in `dex-memoria` and local copies if any copy still lacks the explicit-write rule.
2. Fix Dex Agent memory docs so read-only applies only to recall adapters, not to explicit user-requested global pointer writes.
3. Add or contract a narrow writer for `C:\Users\crsan\.codex\memories\MEMORY.md` that appends only concise pointer entries.
4. Update tests to preserve "do not merge global memory into local ledger" while allowing explicit global pointer writes.
5. Apply the same policy to mirrored copies or mark them as legacy if not active.
