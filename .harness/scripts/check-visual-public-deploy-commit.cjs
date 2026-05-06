const fs = require("fs");
const path = require("path");
const { missingTargetViolation, resolveAfterTarget } = require("./visual-target-utils.cjs");

const tool = "visual-public-deploy-commit-gate";
const regulation = "fitness";
const target = resolveAfterTarget();
let expectedCommit = process.env.EXPECTED_COMMIT || process.argv[3] || "";
const canonicalBase = process.env.CANONICAL_BASE_URL || "https://project-90mm6.vercel.app";
const manifestPath = path.join(target, "manifest.json");
const violations = [];

if (!target) {
  violations.push(missingTargetViolation("check-visual-public-deploy-commit", "Run with TARGET or capture 04-after/manifest.json first."));
} else if (!fs.existsSync(manifestPath)) {
  violations.push({ severity: "error", what: "Missing final manifest", why: "Cannot prove public deploy commit.", remediation: "Write after manifest.", filesAffected: [manifestPath], linesAffected: [] });
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  expectedCommit = expectedCommit || manifest.commit || manifest.sourceCommit || "";
  if (!expectedCommit) {
    violations.push({ severity: "error", what: "Missing expected commit", why: "Public evidence cannot be tied to a reviewed commit.", remediation: "Pass EXPECTED_COMMIT or write commit/sourceCommit in manifest.", filesAffected: [manifestPath], linesAffected: [] });
  } else if ((manifest.commit || manifest.sourceCommit) !== expectedCommit) {
    violations.push({ severity: "error", what: "Manifest commit does not match expected commit", why: "The public evidence may be stale.", remediation: "Recapture after the expected deployment is ready.", filesAffected: [manifestPath], linesAffected: [] });
  }
  for (const c of manifest.captures || []) {
    const label = `${c.slug || "screen"}/${c.viewport || "viewport"}`;
    const finalUrl = String(c.state?.finalUrl || "");
    if (!finalUrl.startsWith(canonicalBase)) {
      violations.push({ severity: "error", what: `Non-canonical URL for ${label}`, why: "Public proof is not from the canonical deployment.", remediation: "Capture from the canonical public base URL.", filesAffected: [manifestPath], linesAffected: [] });
    }
    if (expectedCommit && !finalUrl.includes(expectedCommit)) {
      violations.push({ severity: "error", what: `Commit marker missing from finalUrl for ${label}`, why: "The capture is not tied to the reviewed commit/cache-buster.", remediation: "Use a commit cache-buster or record asset proof.", filesAffected: [manifestPath], linesAffected: [] });
    }
    if (c.state?.loginLike || /login|signin|auth/i.test(finalUrl)) {
      violations.push({ severity: "error", what: `Login or auth URL for ${label}`, why: "Public deployment proof is not the target UI.", remediation: "Recapture authenticated/canonical target.", filesAffected: [manifestPath], linesAffected: [] });
    }
  }
}

const errors = violations.filter((v) => v.severity === "error").length;
console.log(JSON.stringify({ tool, regulation, passed: errors === 0, summary: errors ? `${errors} deploy proof issue(s)` : `public evidence is tied to ${expectedCommit}`, inconclusive: false, violations }));
