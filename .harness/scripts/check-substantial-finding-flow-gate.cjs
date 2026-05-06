const fs = require("fs");
const path = require("path");

const tool = "substantial-finding-flow-gate";
const regulation = "maintainability";
const target = process.env.TARGET || process.argv[2] || "";
const violations = [];

function add(severity, what, why, remediation, file = target) {
  violations.push({ severity, what, why, remediation, filesAffected: file ? [file] : [], linesAffected: [] });
}

function collectFiles(root) {
  const files = [];
  if (!fs.existsSync(root)) return files;
  const stat = fs.statSync(root);
  if (stat.isFile()) return [root];

  const preferred = [
    path.join(root, "09-meeting-contract", "substantial-finding-flow.yaml"),
    path.join(root, "09-meeting-contract", "micro-meeting.yaml"),
    path.join(root, "09-meeting-contract", "two-chamber-meeting.yaml")
  ].filter((file) => fs.existsSync(file));
  if (preferred.length) return preferred;

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/(substantial|review[-_]?finding|micro[-_]?meeting|flow[-_]?gate|two[-_]?chamber).*\\.(md|yaml|yml|json)$/i.test(entry.name)) files.push(full);
    }
  }
  walk(root);
  return files;
}

function hasRole(text, rolePatterns) {
  return rolePatterns.some((pattern) => pattern.test(text));
}

function hasMaterialOutput(text, rolePatterns) {
  return rolePatterns.some((pattern) => {
    const match = pattern.exec(text);
    if (!match) return false;
    const start = Math.max(0, match.index - 80);
    const end = Math.min(text.length, match.index + 500);
    const block = text.slice(start, end);
    return /(changed|mudou|expos|exigiu|bloqueou|clarificou|mapeou|validou|review|reprovou|park|mined|aprendizado|proposta|recommendation|recomendacao)/i.test(block);
  });
}

function requireRegex(text, regex, what, why, remediation, file) {
  if (!regex.test(text)) add("error", what, why, remediation, file);
}

if (!target) {
  add("error", "Missing substantial finding target", "The gate must inspect the active finding/micro-meeting artifact.", "Run with TARGET or argv[2] pointing at the finding flow artifact.", ".harness/scripts/check-substantial-finding-flow-gate.cjs");
} else if (!fs.existsSync(target)) {
  add("error", "Substantial finding target missing", "Cannot inspect absent governance evidence.", "Pass an existing artifact or active round folder.", target);
} else {
  const files = collectFiles(path.resolve(target));
  if (!files.length) {
    add("error", "Missing substantial finding artifact", "A substantial finding needs typed micro-meeting and flow-gate evidence.", "Create a substantial-finding-flow or micro-meeting artifact for this finding.", target);
  }

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const lower = text.toLowerCase();

    requireRegex(lower, /substantial_finding|finding_id|review_finding|achado substancial/, "Missing substantial finding trigger", "The artifact must state which new finding triggered the micro-meeting.", "Add substantial_finding with finding_id, summary, severity and evidence.", file);
    requireRegex(lower, /divergence_chamber|divergencia|divergence/, "Missing divergence chamber", "Substantial findings need pressure before convergence.", "Add a divergence chamber with the minimum table roles.", file);
    requireRegex(lower, /convergence_chamber|convergencia|convergence/, "Missing convergence chamber", "The artifact must choose an implementation/regression decision.", "Add a convergence chamber with decision roles.", file);
    requireRegex(lower, /review_finding[\s\S]*action\s*:\s*(fix_now|park|judge)|action\s*:\s*(fix_now|park|judge)/, "Missing review_finding action", "The finding must be classified as fix_now, park or judge.", "Record review_finding.action as fix_now, park or judge.", file);
    requireRegex(lower, /advance_when\s*:/, "Missing advance_when", "The principal agent needs a condition for moving forward.", "Add flow_gates.advance_when.", file);
    requireRegex(lower, /regress_when\s*:/, "Missing regress_when", "The flow needs a condition for returning to implementation or investigation.", "Add flow_gates.regress_when.", file);
    requireRegex(lower, /stop_when\s*:/, "Missing stop_when", "Bad loops need an explicit stop condition.", "Add flow_gates.stop_when.", file);
    requireRegex(lower, /subagent[\s\S]*(proposal|proposta)/, "Missing subagent proposal", "The subagent must return what it proposes, not only a verdict.", "Add subagent_return.proposal.", file);
    requireRegex(lower, /subagent[\s\S]*files\s*:/, "Missing subagent files", "The principal agent needs the intended or touched file list.", "Add subagent_return.files.", file);
    requireRegex(lower, /subagent[\s\S]*tests\s*:/, "Missing subagent tests", "The proposal needs verification steps.", "Add subagent_return.tests.", file);
    requireRegex(lower, /recommendation\s*:\s*(keep|redo|undo)|recomendacao\s*:\s*(manter|refazer|desfazer)/, "Missing subagent recommendation", "The subagent must recommend keep, redo or undo.", "Add subagent_return.recommendation.", file);
    requireRegex(lower, /principal_validation|agent[e]? principal[\s\S]*(sensor|judge)|sensor\s*:[\s\S]*(passed|failed)|judge\s*:[\s\S]*(passed|failed)/, "Missing principal validation", "The principal agent may not close on subagent opinion alone.", "Record principal validation by sensor or judge before concluding.", file);

    const divergenceRoles = {
      chato: [/role\s*:\s*chato/i, /\bchato\b/i],
      questionador: [/role\s*:\s*questionador/i, /\bquestionador\b/i],
      "adversario-codigo": [/role\s*:\s*adversario-codigo/i, /\badversario[-_ ]codigo\b/i],
      curioso: [/role\s*:\s*curioso/i, /\bcurioso\b/i]
    };
    const convergenceRoles = {
      "akita-dev-raiz": [/role\s*:\s*akita-dev-raiz/i, /\bakita[-_ ]dev[-_ ]raiz\b/i],
      kant: [/role\s*:\s*kant/i, /\bkant\b/i],
      "fowler-evolutivo": [/role\s*:\s*fowler-evolutivo/i, /\bfowler[-_ ]evolutivo\b/i],
      mapeador: [/role\s*:\s*mapeador(?:-implementacao)?/i, /\bmapeador(?:[-_ ]implementacao)?\b/i],
      revisor: [/role\s*:\s*revisor(?:-codigo)?/i, /\brevisor(?:[-_ ]codigo)?\b/i],
      validador: [/role\s*:\s*validador(?:-pronto)?/i, /\bvalidador(?:[-_ ]pronto)?\b/i]
    };
    const requiredAlways = {
      estacionamento: [/role\s*:\s*estacionamento/i, /\bestacionamento\b/i],
      garimpeiro: [/role\s*:\s*garimpeiro/i, /\bgarimpeiro\b/i]
    };

    for (const [role, patterns] of Object.entries(divergenceRoles)) {
      if (!hasRole(text, patterns)) add("error", `Missing divergence role ${role}`, "The minimum divergence table is required for substantial findings.", `Add ${role} with material output.`, file);
      else if (!hasMaterialOutput(text, patterns)) add("warning", `Weak output for ${role}`, "Role presence without a changed/proposed/blocked output can become ritual.", `Record what ${role} changed in the decision.`, file);
    }
    for (const [role, patterns] of Object.entries(convergenceRoles)) {
      if (!hasRole(text, patterns)) add("error", `Missing convergence role ${role}`, "The minimum convergence table is required for implementation/regression decisions.", `Add ${role} with material output.`, file);
      else if (!hasMaterialOutput(text, patterns)) add("warning", `Weak output for ${role}`, "Role presence without a changed/proposed/validated output can become ritual.", `Record what ${role} changed in the decision.`, file);
    }
    for (const [role, patterns] of Object.entries(requiredAlways)) {
      if (!hasRole(text, patterns)) add("error", `Missing required ${role}`, "Parking and learning are mandatory for substantial finding flow.", `Add ${role} with parked items, no-parking decision, mined learning or no-learning decision.`, file);
      else if (!hasMaterialOutput(text, patterns)) add("warning", `Weak output for ${role}`, "Parking/mining must produce a decision, not only attendance.", `Record ${role} output.`, file);
    }
  }
}

const errors = violations.filter((violation) => violation.severity === "error").length;
console.log(JSON.stringify({
  tool,
  regulation,
  passed: errors === 0,
  summary: errors ? `${errors} substantial finding flow blocker(s)` : "substantial finding flow gate is satisfied",
  inconclusive: false,
  violations
}));
process.exitCode = errors === 0 ? 0 : 1;
