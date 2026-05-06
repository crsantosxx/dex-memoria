const fs = require("fs");
const path = require("path");
const { missingTargetViolation, resolveAfterTarget } = require("./visual-target-utils.cjs");

const tool = "technical-payload-readability";
const regulation = "fitness";
const target = resolveAfterTarget();
const manifestPath = path.join(target, "manifest.json");
const violations = [];

if (!target) {
  violations.push(missingTargetViolation("check-technical-payload-readability", "Run with TARGET or capture 04-after/manifest.json first."));
} else if (!fs.existsSync(manifestPath)) {
  violations.push({ severity: "error", what: "Missing manifest", why: "Cannot inspect technical payload readability.", remediation: "Write manifest.", filesAffected: [manifestPath], linesAffected: [] });
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const c of manifest.captures || []) {
    const text = String(c.state?.bodyTextSample || c.state?.bodyText || "");
    const longTokens = text.split(/\s+/).filter((t) => t.length > 90 && /[{}:_\-]/.test(t));
    if (longTokens.length) {
      violations.push({ severity: "warning", what: `Possible narrow technical payload in ${c.slug}/${c.viewport}`, why: "Long structured tokens should render in pre/code/details surfaces, not cramped cards.", remediation: "Review technical payload containers.", filesAffected: [c.file || manifestPath], linesAffected: [] });
    }
  }
}

const errors = violations.filter((v) => v.severity === "error").length;
console.log(JSON.stringify({ tool, regulation, passed: errors === 0, summary: violations.length ? `${violations.length} payload readability note(s)` : "technical payload samples are readable", inconclusive: false, violations }));
