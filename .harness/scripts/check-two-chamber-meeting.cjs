const fs = require("fs");
const path = require("path");

const tool = "two-chamber-governed-meeting";
const regulation = "maintainability";
const target = process.env.TARGET || process.argv[2] || "";
const violations = [];

function add(severity, what, why, remediation, file) {
  violations.push({ severity, what, why, remediation, filesAffected: file ? [file] : [], linesAffected: [] });
}

function collectFiles(root) {
  const files = [];
  const canonical = path.join(root, "09-meeting-contract", "two-chamber-meeting.yaml");
  if (fs.existsSync(canonical)) return [canonical];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/(meeting|reuniao|convergence|divergence|chamber).*\.(md|yaml|yml|json)$/i.test(entry.name)) files.push(full);
    }
  }
  if (!fs.existsSync(root)) return files;
  const stat = fs.statSync(root);
  if (stat.isDirectory()) walk(root);
  else files.push(root);
  return files;
}

function roleBlock(text, chamber, role) {
  const chamberMatch = new RegExp(`${chamber}:\\s*([\\s\\S]*?)(?:\\n[a-z_]+:|$)`, "i").exec(text);
  if (!chamberMatch) return "";
  const rolesMatch = /\n\s{2}roles:\s*([\s\S]*?)(?:\n\s{2}[a-z_]+:|\n[a-z_]+:|$)/i.exec(chamberMatch[1]);
  const source = rolesMatch ? rolesMatch[1] : chamberMatch[1];
  const roleMatch = new RegExp(`-\\s*role:\\s*${role.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n([\\s\\S]*?)(?=\\n\\s*-\\s*role:|$)`, "i").exec(source);
  return roleMatch ? roleMatch[1] : "";
}

function hasMaterialChange(block) {
  const changed = /changed:\s*(.+)/i.exec(block);
  if (!changed || changed[1].trim().length < 24) return false;
  const action = /(blocked|clarified|required|exposed|selected|rejected|mapped|owns|review|requires|changed|bloqueou|clarificou|exigiu|expos|selecionou|rejeitou|mapeou|validou|reprovou|promoveu)/i.test(changed[1]);
  const effect = /(focus|risk|gate|evidence|sensor|judge|task|parking|strategy|implementation|artifact|decision|patch|workflow|framing|next experiment|foco|risco|evidencia|tarefa|decisao|estrategia)/i.test(changed[1]);
  return action && effect;
}

function hasConcreteReadyEvidence(text) {
  const match = /ready_evidence:\s*([\s\S]*?)(?:\n\s+[a-z_]+:|\n[a-z_]+:|$)/i.exec(text);
  if (!match) return false;
  const items = match[1].split(/\n/).filter((line) => /^\s*-\s+/.test(line));
  return items.length >= 2 && items.every((line) => (
    /(sensor|judge):\s*[a-z0-9_-]+/i.test(line) &&
    /status:\s*(passed|failed|parked|reviewed)/i.test(line) &&
    /(artifact|report|manifest|event):\s*[^ ]+\.(json|yaml|yml|md)|event:\s*[a-z0-9_-]+/i.test(line)
  ));
}

if (!target) {
  add("error", "Missing meeting target", "The meeting gate must inspect the active round.", "Run with TARGET or argv[2] pointing at the current audit folder.", ".harness/scripts/check-two-chamber-meeting.cjs");
} else if (!fs.existsSync(target)) {
  add("error", "Meeting target missing", "Cannot inspect absent two-chamber evidence.", "Pass an existing audit folder or meeting artifact.", target);
} else {
  const files = collectFiles(path.resolve(target));
  if (files.length === 0) {
    add("error", "Missing meeting artifact", "The meeting gate needs a canonical two-chamber artifact.", "Create 09-meeting-contract/two-chamber-meeting.yaml for the active round.", target);
  }
  for (const file of files) {
    const normalized = file.replace(/\\/g, "/").toLowerCase();
    if (!normalized.endsWith("/09-meeting-contract/two-chamber-meeting.yaml")) {
      add("error", "Non-canonical meeting artifact", "The two-chamber gate must validate the active canonical artifact, not a decorative side file.", "Point the target at the active round folder or 09-meeting-contract/two-chamber-meeting.yaml.", file);
    }
  }
  const text = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  const lower = text.toLowerCase();
  const divergenceRoles = ["questionador", "chato", "adversario-codigo", "curioso"];
  const convergenceRoles = ["kant", "akita-dev-raiz", "mapeador-implementacao", "duda-dev", "revisor-codigo", "validador-pronto"];
  const requiredFields = [
    "divergence_chamber:",
    "convergence_chamber:",
    "dominant_tension:",
    "questions_that_change_decision:",
    "false_green_risks:",
    "unknowns_or_assumptions:",
    "divergence_output:",
    "selected_strategy:",
    "implementation_map:",
    "review_plan:",
    "ready_evidence:",
    "verdict_gate:",
    "next_task_or_parking:"
  ];
  if (!/owner:\s*reuniao/i.test(text)) {
    add("error", "Missing Reuniao owner", "The meeting must be owned by Reuniao so divergence/convergence is a governed artifact.", "Set owner: reuniao at the meeting root or divergence owner.", target);
  }
  for (const role of divergenceRoles) {
    const block = roleBlock(text, "divergence_chamber", role);
    if (!block) add("error", `Missing divergence role ${role}`, "Divergence roles must be inside divergence_chamber.roles, not only mentioned elsewhere.", "Add the role with material changed output.", target);
    else if (!hasMaterialChange(block)) add("error", `Decorative divergence role ${role}`, "Each divergence role must state what it changed in the decision.", "Add a concrete changed: sentence for this role.", target);
    else if (role === "curioso" && !/(clarified|unknown|assumption|lacuna|pergunta|what|why|para que|uso real|context)/i.test(block)) {
      add("error", "Curioso lacks curiosity signal", "Curioso must clarify an unknown, assumption, question or real-use context, not only attend.", "Add a Curioso changed output tied to a question, unknown or usage context.", target);
    }
  }
  for (const role of convergenceRoles) {
    const block = roleBlock(text, "convergence_chamber", role);
    if (!block) add("error", `Missing convergence role ${role}`, "Convergence roles must be inside convergence_chamber.roles, not only mentioned elsewhere.", "Add the role with material changed output.", target);
    else if (!hasMaterialChange(block)) add("error", `Decorative convergence role ${role}`, "Each convergence role must state what it changed in the decision.", "Add a concrete changed: sentence for this role.", target);
  }
  for (const field of requiredFields) {
    if (!lower.includes(field)) add("error", `Missing ${field}`, "The two-chamber meeting must produce typed divergence and convergence outputs.", "Add the required field to the meeting artifact.", target);
  }
  if (!hasConcreteReadyEvidence(text)) {
    add("error", "Weak ready_evidence", "Readiness evidence must point to concrete sensors, artifacts, manifests, MCP events or judge reports.", "Replace prose-only readiness with concrete evidence items.", target);
  }
}

const errors = violations.filter((violation) => violation.severity === "error").length;
console.log(JSON.stringify({
  tool,
  regulation,
  passed: errors === 0,
  summary: errors ? `${errors} two-chamber meeting blocker(s)` : "two-chamber governed meeting is present",
  inconclusive: false,
  violations
}));
process.exitCode = errors === 0 ? 0 : 1;
