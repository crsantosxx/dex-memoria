const fs = require("fs");
const path = require("path");
const { missingTargetViolation, resolveRoundTarget } = require("./visual-target-utils.cjs");

const tool = "openai-frontend-prompt-application-gate";
const regulation = "fitness";
const target = resolveRoundTarget();
const url = "https://developers.openai.com/api/docs/guides/frontend-prompt";
const requiredFiles = ["03-findings/findings.md", "PLAN.md"];
const violations = [];

if (!target) {
  violations.push(missingTargetViolation("check-openai-frontend-prompt-application", "Run with TARGET or capture 04-after/manifest.json first."));
}

for (const rel of target ? requiredFiles : []) {
  const full = path.join(target, rel);
  if (!fs.existsSync(full)) {
    violations.push({ severity: "error", what: `Missing ${rel}`, why: "Cannot prove frontend prompt baseline was considered.", remediation: "Write the audit artifact.", filesAffected: [full], linesAffected: [] });
    continue;
  }
  const text = fs.readFileSync(full, "utf8");
  if (!text.includes(url)) {
    violations.push({ severity: "error", what: `OpenAI frontend prompt URL missing in ${rel}`, why: "The baseline can drift or be forgotten.", remediation: "Reference the live baseline URL.", filesAffected: [full], linesAffected: [] });
  }
  if (!/operacional|operational|cards|mobile|hierarquia|density|densidade/i.test(text)) {
    violations.push({ severity: "warning", what: `No applied UI criterion found in ${rel}`, why: "The reference may be cited but not applied.", remediation: "Record the concrete frontend criterion used.", filesAffected: [full], linesAffected: [] });
  }
}

const errors = violations.filter((v) => v.severity === "error").length;
console.log(JSON.stringify({ tool, regulation, passed: errors === 0, summary: errors ? `${errors} frontend baseline issue(s)` : "OpenAI frontend baseline is cited and applied", inconclusive: false, violations }));
