const fs = require("fs");
const path = require("path");
const { missingTargetViolation, resolveRoundTarget } = require("./visual-target-utils.cjs");

const tool = "visual-audit-round-artifacts";
const regulation = "fitness";
const target = resolveRoundTarget();
const violations = [];
const required = [
  "00-manifest.json",
  "03-findings/findings.md",
  "03-findings/findings.json",
  "04-after/manifest.json",
  "05-comparison/README.md",
];

function countPngs(dir) {
  const root = path.join(target, dir);
  if (!fs.existsSync(root)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      count += fs.readdirSync(full).filter((name) => name.endsWith(".png")).length;
    } else if (entry.name.endsWith(".png")) {
      count += 1;
    }
  }
  return count;
}

if (!target) {
  violations.push(missingTargetViolation("check-visual-audit-round-artifacts", "Run with TARGET or capture 04-after/manifest.json first."));
} else {
  for (const rel of required) {
    if (!fs.existsSync(path.join(target, rel))) {
      violations.push({ severity: "error", what: `Missing ${rel}`, why: "Visual audit round cannot be reviewed or replayed without the required artifact.", remediation: `Create ${rel}.`, filesAffected: [target], linesAffected: [] });
    }
  }

  const before = countPngs("01-before");
  const annotated = countPngs("02-annotated");
  if (before < 1) {
    violations.push({ severity: "error", what: "No before screenshots found", why: "Before/after audit needs before evidence.", remediation: "Capture 01-before screenshots.", filesAffected: [path.join(target, "01-before")], linesAffected: [] });
  }
  if (annotated < before) {
    violations.push({ severity: "warning", what: "Annotated screenshots fewer than before screenshots", why: "Manual markup handoff is incomplete.", remediation: "Copy all before screenshots into 02-annotated.", filesAffected: [path.join(target, "02-annotated")], linesAffected: [] });
  }

  const manifestPath = path.join(target, "00-manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (manifest.authVerification && manifest.authVerification.passed === false) {
      violations.push({ severity: "error", what: "Auth/public gate failed in before manifest", why: "Visual evidence may be login/redirect/empty state.", remediation: "Use valid browser state and verify finalUrl/text before capture.", filesAffected: [manifestPath], linesAffected: [] });
    }
  }
}

const errors = violations.filter((v) => v.severity === "error").length;
console.log(JSON.stringify({ tool, regulation, passed: errors === 0, summary: violations.length ? `${violations.length} artifact issue(s)` : "visual audit artifacts complete", inconclusive: false, violations }));
