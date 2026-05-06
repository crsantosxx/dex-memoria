const fs = require("fs");
const path = require("path");
const { missingTargetViolation, resolveMeetingsTarget } = require("./visual-target-utils.cjs");

const tool = "round-retro-output-gate";
const regulation = "maintainability";
const target = resolveMeetingsTarget();
const violations = [];
const allowed = ["sem mudanca", "sensor", "judge", "workflow", "contract", "guide", "park_when", "memory", "discard", "estacion"];

if (!target) {
  violations.push(missingTargetViolation("check-round-retro-output", "Run with TARGET or capture 04-after/manifest.json first."));
} else if (!fs.existsSync(target)) {
  violations.push({ severity: "error", what: "Missing meetings folder", why: "Cannot verify round retrospectives.", remediation: "Create meeting artifacts.", filesAffected: [target], linesAffected: [] });
} else {
  const files = fs.readdirSync(target).filter((f) => f.endsWith(".md"));
  if (!files.length) {
    violations.push({ severity: "error", what: "No retrospective artifacts", why: "Round learning cannot be audited.", remediation: "Write at least one meeting note.", filesAffected: [target], linesAffected: [] });
  }
  for (const file of files) {
    const full = path.join(target, file);
    const text = fs.readFileSync(full, "utf8").toLowerCase();
    if (!allowed.some((token) => text.includes(token))) {
      violations.push({ severity: "warning", what: `No typed output found in ${file}`, why: "Meeting may be ritual rather than actionable.", remediation: "End retro with typed output or explicit no-change decision.", filesAffected: [full], linesAffected: [] });
    }
  }
}

const errors = violations.filter((v) => v.severity === "error").length;
console.log(JSON.stringify({ tool, regulation, passed: errors === 0, summary: violations.length ? `${violations.length} retro note(s)` : "retrospectives have typed outputs", inconclusive: false, violations }));
