const fs = require("fs");
const path = require("path");

const tool = "governed-meeting-flow-gate";
const regulation = "maintainability";
const target = process.env.TARGET || process.argv[2] || "";
const violations = [];

const phases = ["divergence", "convergence", "actionable", "gate"];
const divergenceRoles = ["chato", "questionador", "curioso", "adversario-codigo"];
const convergenceRoles = [
  "akita-dev-raiz",
  "kant",
  "fowler-evolutivo",
];
const liveRoles = [
  "estacionamento",
  "garimpeiro",
  "ancora-fluxo",
  "dex-harness-project-setup",
  "sentinela-llm",
];

if (!target) {
  add("error", "Missing governed meeting target", "The flow gate needs a meeting, dashboard or subagent artifact.", "Run with TARGET or argv[2] pointing at the artifact.", ".harness/scripts/check-governed-meeting-flow.cjs");
} else if (!fs.existsSync(target)) {
  add("error", "Governed meeting target missing", "Cannot inspect absent flow evidence.", "Pass an existing artifact or folder.", target);
} else {
  const files = collectFiles(path.resolve(target));
  if (!files.length) {
    add("error", "No inspectable governed meeting artifact found", "The flow gate needs md/yaml/json evidence.", "Record a governed meeting artifact before claiming material participation.", target);
  }

  const text = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  const lower = text.toLowerCase();

  requireVisibleMethodBlocks(lower);
  requireOrderedPhases(lower);
  requireRoles(text, divergenceRoles, "divergence");
  requireRoles(text, convergenceRoles, "convergence");
  requireRoles(text, liveRoles, "vivos");
  requireTriggeredTransversalRoles(text, lower);
  requireFields(lower, ["proposal", "tests", "recommendation"], "actionable");
  if (!/(files\s*:|surfaces\s*:)/i.test(text)) {
    add("error", "Missing actionable files or surfaces", "The actionable output must name the affected surface.", "Add files: or surfaces: with concrete paths/surfaces.", target);
  }
  requireMicroTasks(text, lower);
  requireFields(lower, ["advance_when", "regress_when", "stop_when", "principal_validation"], "gate");
  if (!/(principal_validation[\s\S]{0,320}(sensor|judge)[\s\S]{0,320}(passed|failed|blocked)|sensor\s*:[\s\S]{0,160}(passed|failed)|judge\s*:[\s\S]{0,160}(passed|failed))/i.test(text)) {
    add("error", "Missing executable validation evidence", "The principal validation must name a sensor or judge result.", "Record sensor/judge id and passed/failed/blocked result.", target);
  }
  if (/(ready-pass|ready_pass|material ready|status\s*:\s*ready)/i.test(text) && violations.length > 0) {
    add("error", "Ready decision blocked by incomplete governed flow", "A material ready decision cannot stand while divergence/convergence/actionable/gate evidence is incomplete.", "Downgrade the decision or complete the governed flow artifact.", target);
  }
}

const errors = violations.filter((violation) => violation.severity === "error").length;
console.log(JSON.stringify({
  tool,
  regulation,
  passed: errors === 0,
  summary: errors ? `${errors} governed meeting flow blocker(s)` : "governed meeting flow is material and gated",
  inconclusive: false,
  violations,
}));
process.exitCode = errors === 0 ? 0 : 1;

function collectFiles(root) {
  if (!root || !fs.existsSync(root)) return [];
  if (fs.statSync(root).isFile()) return [root];
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(md|yaml|yml|json)$/i.test(entry.name)) files.push(full);
    }
  }
  walk(root);
  return files;
}

function requireOrderedPhases(lower) {
  let cursor = -1;
  for (const phase of phases) {
    const idx = lower.indexOf(`${phase}:`);
    if (idx === -1) {
      add("error", `Missing ${phase} phase`, "The visible method must be divergence -> convergence -> actionable -> gate.", `Add ${phase}: to the governed artifact.`, target);
      continue;
    }
    if (idx < cursor) {
      add("error", `Phase ${phase} is out of order`, "The visible method must be readable in order.", "Reorder the artifact to divergence -> convergence -> actionable -> gate.", target);
    }
    cursor = idx;
  }
}

function requireVisibleMethodBlocks(lower) {
  for (const field of ["pensamento", "planejamento"]) {
    if (!lower.includes(`${field}:`)) {
      add("error", `Missing visible ${field} block`, "The governed method must be visible in Dex Harness thinking/planning surfaces, not only hidden in session events.", `Add ${field}: with owner, material credits, next and back_to.`, target);
    }
  }
  for (const field of ["owner", "material_credits", "next", "back_to"]) {
    if (!lower.includes(`${field}:`)) {
      add("error", `Missing visible flow field ${field}`, "Pensamento/Planejamento must expose owner, credits and routing.", `Add ${field}: to the visible governed flow artifact.`, target);
    }
  }
}

function requireRoles(text, roles, phase) {
  for (const role of roles) {
    const blocks = findRoleBlocks(text, role);
    if (!blocks.length) {
      add("error", `Missing ${phase} role ${role}`, "Required specialist participation is absent.", `Add ${role} with material output in ${phase}.`, target);
    } else if (!blocks.some(hasMaterialSignal)) {
      add("error", `Cosmetic ${phase} role ${role}`, "The role is named without a contribution that changed, blocked, validated, parked or mined something.", `Record material contribution and evidence for ${role}.`, target);
    }
  }
}

function requireTriggeredTransversalRoles(text, lower) {
  const triggerText = governedSurfaceText(text).toLowerCase();
  const requiresMapeador = hasAny(triggerText, [
    /\bimplementation\b/,
    /\bimplementacao\b/,
    /\bimplementar\b/,
    /\bpatch\b/,
    /\bsync\b/,
    /\bsincroniz/,
    /\bscripts?\b/,
    /\bspec\b/,
    /\bsensor\b/,
    /\bjudge\b/,
    /\bworkflow\b/,
    /\bcontract\b/,
    /\bcontrato\b/,
    /\bruntime\b/,
    /\bsurface\b/,
    /\bsuperficie\b/,
    /\bsuperfície\b/,
  ]);
  const requiresRevisor = hasAny(triggerText, [
    /\bdiff\b/,
    /\bchanged\b/,
    /\balterad/,
    /\bscripts?\b/,
    /\bsensor\b/,
    /\bspec\b/,
    /\bworkflow\b/,
    /\bcontract\b/,
    /\bcontrato\b/,
    /\bruntime\b/,
    /\bagents\.md\b/,
    /\bversionad/,
  ]);
  const requiresValidador = hasAny(lower, [
    /\bready-pass\b/,
    /\bready_pass\b/,
    /\bready\b/,
    /\bpronto\b/,
    /\bdone\b/,
    /\bcomplete\b/,
    /\bcompleted\b/,
    /\bconcluid/,
    /\bsynced\b/,
    /\bsincronizad/,
    /\bkeep\b/,
    /\bmanter\b/,
    /\bpassou\b/,
    /\bpassed\b/,
  ]);

  if (requiresMapeador) {
    requireRoles(text, ["mapeador-implementacao"], "actionable");
  }
  if (requiresRevisor) {
    requireRoles(text, ["revisor-codigo"], "gate");
  }
  if (requiresValidador) {
    requireRoles(text, ["validador-pronto"], "gate");
  }
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function governedSurfaceText(text) {
  const lines = text.split(/\r?\n/);
  return lines
    .filter((line) => /^\s*(files|surfaces|changed_surface|changed_surfaces|surface_change|surface_changes|changed_files|diff)\s*:/i.test(line))
    .join("\n");
}

function requireFields(lower, fields, phase) {
  for (const field of fields) {
    if (!lower.includes(`${field}:`)) {
      add("error", `Missing ${phase} field ${field}`, `The ${phase} phase is incomplete.`, `Add ${field}: to ${phase}.`, target);
    }
  }
}

function requireMicroTasks(text, lower) {
  if (!/micro_tasks\s*:/i.test(text)) {
    add("error", "Missing micro_tasks", "A material meeting must end in immediately applicable micro tasks, not only minutes or a decision.", "Add micro_tasks: with id, owner, meeting_id, surface/file, action, test/gate, ready_criteria and recommendation.", target);
    return;
  }
  const blockMatch = /micro_tasks\s*:\s*([\s\S]*?)(?:\n[a-z_]+:|$)/i.exec(text);
  const block = blockMatch ? blockMatch[1] : "";
  const fields = [
    ["id", /\bid\s*:/i],
    ["owner", /\bowner\s*:/i],
    ["meeting_id", /\b(?:meeting_id|decision_origin|origem_decisao)\s*:/i],
    ["surface or file", /\b(?:surface|surfaces|file|files|arquivo|superficie|superfície)\s*:/i],
    ["action", /\b(?:action|acao|ação)\s*:/i],
    ["test or gate", /\b(?:test|tests|gate|sensor|judge)\s*:/i],
    ["ready_criteria", /\b(?:ready_criteria|criterio_pronto|critério_pronto|done_when)\s*:/i],
    ["recommendation", /\brecommendation\s*:\s*(keep|redo|undo)\b/i],
  ];
  for (const [name, pattern] of fields) {
    if (!pattern.test(block)) {
      add("error", `Missing micro_task field ${name}`, "Each material meeting output needs a concrete task that can be applied and checked immediately.", `Add ${name} to micro_tasks.`, target);
    }
  }
  if (isImplementableMicroTask(block)) {
    for (const [name, pattern] of [
      ["implementation_owner mapeador-implementacao", /\b(?:implementation_owner|implementacao_owner|implementação_owner)\s*:\s*(?:mapeador-implementacao|ivo|mapeador)|\bmapeador-implementacao\b/i],
      ["review_owner revisor-codigo", /\b(?:review_owner|revisao_owner|revisão_owner)\s*:\s*(?:revisor-codigo|revisor)|\brevisor-codigo\b/i],
      ["validation_owner validador-pronto", /\b(?:validation_owner|validacao_owner|validação_owner)\s*:\s*(?:validador-pronto|validador)|\bvalidador-pronto\b/i],
    ]) {
      if (!pattern.test(block)) {
        add("error", `Missing transversal micro_task trail ${name}`, "Implementable meeting outputs must carry implementation, review and validation rails.", `Add ${name} to each implementable micro_task.`, target);
      }
    }
  }
  if (/(three consecutive visual regressions|3\s+falhas|3\s+regress|topchromegap|visual-regression-loop-stop)/i.test(lower)) {
    for (const [name, pattern] of [
      ["causal_hypothesis", /causal_hypothesis|hip[oó]tese causal|detected_reason/i],
      ["strategy shift", /strategy_shift|single_proposal|proposta [uú]nica|selected_strategy/i],
      ["measurable gate", /measurable_gate|gate mensur[aá]vel|next_gate/i],
    ]) {
      if (!pattern.test(text)) {
        add("error", `Missing loop micro_task ${name}`, "A three-regression visual stop must produce strategy change tasks, not another generic patch.", `Add ${name} to the meeting/actionable output.`, target);
      }
    }
  }
}

function isImplementableMicroTask(block) {
  if (/\b(no-code|no code|sem codigo|sem código|do not patch|nao patch|não patch|no implementation|sem implementacao|sem implementação)\b/i.test(block)) {
    return false;
  }
  return /\b(file|files|arquivo|script|sensor|judge|workflow|contract|runtime|patch|diff|css|js|ts|tsx|cjs|implementar|implementation|alterar|change|sync|sincroniz|surface|superficie|superfície)\b/i.test(block);
}

function findRoleBlocks(text, role) {
  const escaped = role.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\-/g, "[-_ ]");
  const regex = new RegExp(`\\b${escaped}\\b`, "gi");
  const blocks = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const lineStart = text.lastIndexOf("\n", match.index) + 1;
    const nextLine = text.indexOf("\n", match.index);
    if (nextLine === -1) {
      blocks.push(text.slice(lineStart));
      continue;
    }
    const secondNext = text.indexOf("\n", nextLine + 1);
    blocks.push(text.slice(lineStart, secondNext === -1 ? text.length : secondNext));
  }
  return blocks;
}

function hasMaterialSignal(block) {
  return /(changed|mudou|blocked|bloqueou|exigiu|clarified|clarificou|mapped|mapeou|validated|validou|rejected|rejeitou|decision|decisao|evidence|evidencia|gate|sensor|judge|test|teste|park|estacion|mined|garimp|learning|aprendizado|owner|proposal|proposta|trust boundary|fronteira)/i.test(block);
}

function add(severity, what, why, remediation, file) {
  violations.push({ severity, what, why, remediation, filesAffected: file ? [file] : [], linesAffected: [] });
}
