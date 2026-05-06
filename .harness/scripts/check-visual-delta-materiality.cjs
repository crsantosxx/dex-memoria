const fs = require("fs");
const path = require("path");
const {
  missingTargetViolation,
  resolveRoundTarget,
} = require("./visual-target-utils.cjs");

const tool = "visual-delta-materiality";
const regulation = "fitness";
const target = resolveRoundTarget();
const violations = [];

if (!target) {
  violations.push(missingTargetViolation("check-visual-delta-materiality", "Run with TARGET pointing at the active visual audit folder."));
} else {
  const comparisonFile = resolveComparisonFile(target);
  if (!comparisonFile) {
    violations.push({
      severity: "error",
      what: "Missing visual comparison",
      why: "A before/after round cannot prove material improvement without a comparison artifact.",
      remediation: "Write 05-comparison/<round>-comparison.json or summary.json with metrics.",
      filesAffected: [path.join(target, "05-comparison")],
      linesAffected: [],
    });
  } else {
    const comparison = JSON.parse(fs.readFileSync(comparisonFile, "utf8"));
    const checks = materialityChecks(comparison);
    if (checks.length === 0) {
      violations.push({
        severity: "error",
        what: "No materiality threshold declared",
        why: "Positive delta alone can create false green. The round must declare a threshold or use a supported metric default.",
        remediation: "Add materiality.thresholds or a supported delta metric such as liveGridTop, queueColumnTop, chatThreadHeight or composerTop.",
        filesAffected: [comparisonFile],
        linesAffected: [],
      });
    }

    for (const check of checks) {
      if (!check.passed) {
        violations.push({
          severity: "error",
          what: `Material delta too small for ${check.metric}`,
          why: `Observed ${check.actual}px, but the minimum material change is ${check.threshold}px.`,
          remediation: "Keep iterating or explicitly park the change as directional-pass instead of material-pass.",
          filesAffected: [comparisonFile],
          linesAffected: [],
        });
      }
    }

    const verdict = String(comparison.verdict || comparison.status || "").toLowerCase();
    if (verdict === "passed" && checks.some((check) => !check.passed)) {
      violations.push({
        severity: "error",
        what: "Comparison declares passed despite insufficient material delta",
        why: "A passed verdict must not override a failed materiality threshold.",
        remediation: "Change verdict to review/directional-pass or produce a material delta.",
        filesAffected: [comparisonFile],
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
  summary: errors ? `${errors} materiality issue(s)` : "visual deltas meet materiality thresholds",
  inconclusive: false,
  violations,
}));

function resolveComparisonFile(roundTarget) {
  const summary = path.join(roundTarget, "summary.json");
  const comparisonsDir = path.join(roundTarget, "05-comparison");
  const candidates = [];
  if (fs.existsSync(summary)) candidates.push(summary);
  if (fs.existsSync(comparisonsDir)) {
    for (const entry of fs.readdirSync(comparisonsDir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith(".json")) {
        const full = path.join(comparisonsDir, entry.name);
        candidates.push(full);
      }
    }
  }
  candidates.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return candidates[0] || "";
}

function materialityChecks(comparison) {
  const source = comparison.metrics || comparison;
  const delta = source.delta || {};
  const thresholds = {
    liveGridTop: -80,
    queueColumnTop: -80,
    conversationColumnTop: -80,
    stateColumnTop: -80,
    chatThreadHeight: -120,
    composerTop: -120,
    ...(source.materiality?.thresholds || comparison.materiality?.thresholds || {}),
  };
  const checks = [];
  for (const [metric, threshold] of Object.entries(thresholds)) {
    if (typeof delta[metric] !== "number") continue;
    const actual = delta[metric];
    const expected = Number(threshold);
    if (!Number.isFinite(expected) || expected === 0) continue;
    const passed = expected < 0 ? actual <= expected : actual >= expected;
    checks.push({ metric, actual, threshold: expected, passed });
  }
  return checks;
}
