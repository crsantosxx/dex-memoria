const fs = require("fs");
const path = require("path");
const { missingTargetViolation, resolveAfterTarget } = require("./visual-target-utils.cjs");

const tool = "mobile-primary-action-reachability";
const regulation = "fitness";
const target = resolveAfterTarget();
const manifestPath = path.join(target, "manifest.json");
const violations = [];
const actions = {
  "painel-operacao": ["Atualizar", "Agenda", "Conversas"],
  "conversas-operacionais": ["Assumir", "responder", "Contexto"],
  "agenda-operacional": ["Marcar", "Atualizar agenda", "DATA"],
  "status-operacional": ["Mapa", "Atualizar", "Sistema"]
};

if (!target) {
  violations.push(missingTargetViolation("check-mobile-primary-action", "Run with TARGET or capture 04-after/manifest.json first."));
} else if (!fs.existsSync(manifestPath)) {
  violations.push({ severity: "error", what: "Missing manifest", why: "Cannot inspect mobile actions.", remediation: "Write manifest.", filesAffected: [manifestPath], linesAffected: [] });
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const mobileCaptures = (manifest.captures || []).filter((c) => c.viewport === "mobile" || c.viewport === "tablet");
  for (const c of mobileCaptures) {
    const label = `${c.slug}/${c.viewport}`;
    const text = String(c.state?.bodyTextSample || c.state?.bodyText || "").slice(0, 1400);
    const expected = actions[c.slug] || [];
    if (!expected.some((a) => text.toLowerCase().includes(a.toLowerCase()))) {
      violations.push({ severity: "warning", what: `Primary action not visible early for ${label}`, why: "Mobile may pass technically while hiding the work action.", remediation: "Review mobile first/second viewport.", filesAffected: [c.file || manifestPath], linesAffected: [] });
    }
    if (c.state?.overflow || c.state?.loginLike) {
      violations.push({ severity: "error", what: `Invalid mobile state for ${label}`, why: "Mobile primary action cannot be trusted with overflow/login state.", remediation: "Recapture valid mobile state.", filesAffected: [c.file || manifestPath], linesAffected: [] });
    }
  }
}

const errors = violations.filter((v) => v.severity === "error").length;
console.log(JSON.stringify({ tool, regulation, passed: errors === 0, summary: violations.length ? `${violations.length} mobile action note(s)` : "mobile primary actions are reachable", inconclusive: false, violations }));
