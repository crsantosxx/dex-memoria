const fs = require("fs");
const path = require("path");
const {
  missingTargetViolation,
  normalizeCapture,
  resolveAfterTarget,
} = require("./visual-target-utils.cjs");

const tool = "visual-first-fold-operational-density";
const regulation = "fitness";
const target = resolveAfterTarget();
const manifestPath = path.join(target, "manifest.json");
const violations = [];
const anchors = {
  "painel-operacao": ["Atendimentos", "Alertas", "Agenda"],
  "conversas-operacionais": ["Paciente", "Assumir", "Mel"],
  "agenda-operacional": ["Agenda semanal", "Marcar", "UNIDADE"],
  "status-operacional": ["Status", "Sistema", "diagnostico"]
};

if (!target) {
  violations.push(missingTargetViolation("check-visual-first-fold-density", "Run with TARGET or capture 04-after/manifest.json first."));
} else if (!fs.existsSync(manifestPath)) {
  violations.push({ severity: "error", what: "Missing manifest", why: "Cannot inspect first fold text.", remediation: "Write manifest with bodyTextSample.", filesAffected: [manifestPath], linesAffected: [] });
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const c of manifest.captures || []) {
    const capture = normalizeCapture(c);
    const label = capture.label;
    const text = capture.bodyText.slice(0, 900);
    const expected = anchors[capture.slug] || [];
    const found = expected.some((a) => text.toLowerCase().includes(a.toLowerCase()));
    if (!found) {
      violations.push({ severity: "warning", what: `Primary operational anchor appears late or missing for ${label}`, why: "The first fold may be dominated by auxiliary chrome.", remediation: "Review first fold hierarchy for this screen.", filesAffected: [c.file || manifestPath], linesAffected: [] });
    }
    const realOverflow = capture.overflow.filter((item) => !isBenignOffcanvas(item));
    if (realOverflow.length > 0) {
      violations.push({ severity: "error", what: `Horizontal overflow for ${label}`, why: "First fold cannot be considered operationally stable.", remediation: "Fix responsive constraints.", filesAffected: [c.file || manifestPath], linesAffected: [] });
    }
  }
}

const errors = violations.filter((v) => v.severity === "error").length;
console.log(JSON.stringify({ tool, regulation, passed: errors === 0, summary: violations.length ? `${violations.length} first-fold note(s)` : "first-fold anchors are present", inconclusive: false, violations }));

function isBenignOffcanvas(item) {
  const className = String(item?.className || "").toLowerCase();
  const id = String(item?.id || "").toLowerCase();
  const tag = String(item?.tag || "").toLowerCase();
  const rect = item?.rect || {};
  const right = Number(rect.right ?? 0);
  const left = Number(rect.left ?? 0);
  const offLeft = right <= 0 || left < -24;
  const looksLikeSidebar =
    className.includes("sidebar") ||
    id.includes("sidebar") ||
    tag === "aside";
  return offLeft && looksLikeSidebar;
}
