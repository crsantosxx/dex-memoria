const fs = require("fs");
const path = require("path");
const {
  missingTargetViolation,
  resolveRoundTarget,
} = require("./visual-target-utils.cjs");

const tool = "visual-result-provenance";
const regulation = "fitness";
const target = resolveRoundTarget();
const violations = [];
const allowed = new Set(["directional-pass", "material-pass", "ready-pass"]);

if (!target) {
  violations.push(missingTargetViolation("check-visual-result-provenance", "Run with TARGET pointing at the active visual audit folder."));
} else {
  const summaryFile = path.join(target, "summary.json");
  if (!fs.existsSync(summaryFile)) {
    violations.push({
      severity: "error",
      what: "Missing visual summary",
      why: "The round must declare whether evidence is directional, material or ready.",
      remediation: "Write summary.json with resultStatus and provenance.",
      filesAffected: [summaryFile],
      linesAffected: [],
    });
  } else {
    const summary = JSON.parse(fs.readFileSync(summaryFile, "utf8"));
    const status = String(summary.resultStatus || summary.status || "").toLowerCase();
    const provenance = String(summary.provenance || "").toLowerCase();
    if (!allowed.has(status)) {
      violations.push({
        severity: "error",
        what: "Missing typed visual result status",
        why: "Visual proof must distinguish directional-pass, material-pass and ready-pass.",
        remediation: "Set resultStatus to directional-pass, material-pass or ready-pass.",
        filesAffected: [summaryFile],
        linesAffected: [],
      });
    }
    if (provenance.includes("injected") && status === "ready-pass") {
      violations.push({
        severity: "error",
        what: "Injected CSS cannot be ready-pass",
        why: "Working-tree CSS injection proves direction or material behavior, not the delivered production path.",
        remediation: "Use directional-pass or material-pass until deploy/commit evidence proves the ready path.",
        filesAffected: [summaryFile],
        linesAffected: [],
      });
    }
  }
}

const errors = violations.filter((v) => v.severity === "error").length;
console.log(JSON.stringify({
  tool,
  regulation,
  passed: errors === 0,
  summary: errors ? `${errors} provenance issue(s)` : "visual result provenance is typed",
  inconclusive: false,
  violations,
}));
