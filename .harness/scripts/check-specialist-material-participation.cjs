const fs = require("fs");
const path = require("path");

const tool = "specialist-material-participation-gate";
const regulation = "maintainability";
const target = process.env.TARGET || process.argv[2] || "";
const violations = [];

function add(severity, what, why, remediation, file = target) {
  violations.push({ severity, what, why, remediation, filesAffected: file ? [file] : [], linesAffected: [] });
}

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

function windowAround(text, index, before = 80, after = 520) {
  return text.slice(Math.max(0, index - before), Math.min(text.length, index + after));
}

function roleRegex(role) {
  const escaped = role.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const flexible = escaped.replace(/\\-/g, "[-_ ]");
  return new RegExp(`\\b${flexible}\\b`, "i");
}

function findRoleBlock(text, role) {
  const regex = roleRegex(role);
  const match = regex.exec(text);
  return match ? windowAround(text, match.index) : "";
}

function hasMaterialSignal(block) {
  return /(changed|mudou|bloqueou|exigiu|clarificou|mapeou|validou|reprovou|selecionou|rejeitou|proposal|proposta|decision|decisao|evidence|evidencia|gate|sensor|judge|test|teste|park|estacion|mined|garimp|learning|aprendizado|next|owner|comando tecnico)/i.test(block);
}

function hasField(text, field) {
  return new RegExp(`${field}\\s*:`, "i").test(text);
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

if (!target) {
  add("error", "Missing specialist materiality target", "The gate must inspect meeting/dashboard/subagent evidence.", "Run with TARGET or argv[2] pointing at the active artifact or round folder.", ".harness/scripts/check-specialist-material-participation.cjs");
} else if (!fs.existsSync(target)) {
  add("error", "Specialist materiality target missing", "Cannot inspect absent cooperation evidence.", "Pass an existing artifact or active round folder.", target);
} else {
  const files = collectFiles(path.resolve(target));
  if (!files.length) {
    add("error", "No inspectable artifact found", "The gate needs md/yaml/json evidence.", "Record a meeting, dashboard export, subagent output or flow artifact.", target);
  }

  const text = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  const lower = text.toLowerCase();
  const substantialFinding = /(substantial_finding|achado substancial|live-r2-002|layout-r2-003|dex-r2-002|conv-r2-001)/i.test(text);
  const readyPass = /(ready-pass|ready_pass|resultstatus\s*:\s*ready|verdict\s*:\s*passed|status\s*:\s*ready)/i.test(text);

  const roles = [
    "chato",
    "questionador",
    "curioso",
    "adversario-codigo",
    "akita-dev-raiz",
    "kant",
    "fowler-evolutivo",
    "mapeador-implementacao",
    "revisor-codigo",
    "validador-pronto",
    "estacionamento",
    "garimpeiro",
    "ancora-fluxo",
    "dex-harness-project-setup"
  ];

  for (const role of roles) {
    const block = findRoleBlock(text, role);
    if (!block) {
      add("error", `Missing material role ${role}`, "The required specialist table is incomplete.", `Add ${role} with a material changed/proposal/evidence output.`, target);
    } else if (!hasMaterialSignal(block)) {
      add("error", `Cosmetic specialist role ${role}`, "The role is named but does not show what it changed, validated, parked, mined or gated.", `Record material output for ${role}.`, target);
    }
  }

  if (!/akita[-_ ]dev[-_ ]raiz[\s\S]{0,160}(owner|technical_owner|comando tecnico|responsavel|responsável)|(?:owner|technical_owner|comando tecnico|responsavel|responsável)[\s\S]{0,160}akita[-_ ]dev[-_ ]raiz/i.test(text)) {
    add("error", "Akita Dev Raiz is not the technical owner", "The user required Akita as immediate technical owner for sanity and keep/redo/undo decision.", "Record akita-dev-raiz as owner or technical_owner with a sanity verdict.", target);
  }

  const requiredFields = [
    "review_finding",
    "flow_gates",
    "advance_when",
    "regress_when",
    "stop_when",
    "subagent_return",
    "proposal",
    "files",
    "tests",
    "recommendation",
    "principal_validation"
  ];
  for (const field of requiredFields) {
    if (!hasField(lower, field)) {
      add("error", `Missing ${field}`, "Substantial finding cooperation needs typed decision, gates, subagent return and validation.", `Add ${field}: to the artifact.`, target);
    }
  }

  if (!/(action\s*:\s*(fix_now|park|judge)|review_finding[\s\S]{0,240}(fix_now|park|judge))/i.test(text)) {
    add("error", "Missing review_finding action", "The finding must be classified as fix_now, park or judge.", "Add review_finding.action: fix_now|park|judge.", target);
  }

  if (!/(principal_validation[\s\S]{0,400}(sensor|judge)[\s\S]{0,400}(passed|failed|blocked)|sensor\s*:[\s\S]{0,120}(passed|failed)|judge\s*:[\s\S]{0,120}(passed|failed))/i.test(text)) {
    add("error", "Missing sensor/judge validation", "The principal agent cannot complete from specialist claims alone.", "Record a concrete sensor or judge validation result.", target);
  }

  if (substantialFinding && readyPass) {
    const hasMeeting = hasAny(lower, [/micro[-_ ]?meeting/, /divergence_chamber/, /convergence_chamber/, /micro[-_ ]?reuniao/, /micro[-_ ]?reunião/]);
    const hasOwnerGateTest =
      /akita[-_ ]dev[-_ ]raiz/.test(lower) &&
      /advance_when\s*:/.test(lower) &&
      /regress_when\s*:/.test(lower) &&
      /stop_when\s*:/.test(lower) &&
      /(tests\s*:|teste)/.test(lower) &&
      /principal_validation/.test(lower);
    if (!hasMeeting || !hasOwnerGateTest) {
      add(
        "error",
        "ready-pass is blocked by unresolved substantial finding",
        "A substantial visual finding cannot become ready-pass without meeting, Akita owner, gates, tests and validation.",
        "Downgrade to material/directional/blocked or record the required governance artifact.",
        target
      );
    }
  }
}

const errors = violations.filter((violation) => violation.severity === "error").length;
console.log(JSON.stringify({
  tool,
  regulation,
  passed: errors === 0,
  summary: errors ? `${errors} specialist materiality blocker(s)` : "specialist participation is material and ready-pass is governed",
  inconclusive: false,
  violations
}));
process.exitCode = errors === 0 ? 0 : 1;
