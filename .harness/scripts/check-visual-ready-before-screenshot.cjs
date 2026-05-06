const fs = require("fs");
const path = require("path");
const { missingTargetViolation, normalizeCapture, resolveAfterTarget } = require("./visual-target-utils.cjs");

const tool = "visual-ready-before-screenshot-gate";
const regulation = "fitness";
const target = resolveAfterTarget();
const manifestPath = path.join(target, "manifest.json");
const violations = [];

if (!target) {
  violations.push(missingTargetViolation("check-visual-ready-before-screenshot", "Run with TARGET or capture 04-after/manifest.json first."));
} else if (!fs.existsSync(manifestPath)) {
  violations.push({ severity: "error", what: "Missing manifest.json", why: "Cannot prove page-ready state before screenshots.", remediation: "Recapture and write manifest with capture state.", filesAffected: [target], linesAffected: [] });
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const captures = manifest.captures || [];
  if (!captures.length) {
    violations.push({ severity: "error", what: "No captures in manifest", why: "No screenshot can be validated.", remediation: "Capture screenshots after the ready gate.", filesAffected: [manifestPath], linesAffected: [] });
  }

  for (const c of captures) {
    const s = c.state || {};
    const normalized = normalizeCapture(c);
    const label = normalized.label;
    if (s.readyState !== "complete") {
      violations.push({ severity: "error", what: `readyState not complete for ${label}`, why: "Screenshot may have been taken before full page load.", remediation: "Wait for document.readyState === complete and recapture.", filesAffected: [c.file || manifestPath], linesAffected: [] });
    }
    if (c.requiresAuthReady !== false && s.authReady !== true) {
      violations.push({ severity: "error", what: `authReady missing for ${label}`, why: "Protected/internal screen may not be loaded as operational UI.", remediation: "Require authReady only for captures that need authentication, or mark public captures with requiresAuthReady: false.", filesAffected: [c.file || manifestPath], linesAffected: [] });
    }
    if (!s.finalUrl || /login|signin|auth/i.test(String(s.finalUrl))) {
      violations.push({ severity: "error", what: `Invalid finalUrl for ${label}`, why: "Capture may be login/redirect instead of target screen.", remediation: "Open the target state and record finalUrl.", filesAffected: [c.file || manifestPath], linesAffected: [] });
    }
    if (s.loginLike) {
      violations.push({ severity: "error", what: `Login-like capture for ${label}`, why: "Evidence is not the target screen.", remediation: "Use the right browser/session state and recapture.", filesAffected: [c.file || manifestPath], linesAffected: [] });
    }
    if (s.loadingCount !== undefined && s.loadingCount !== 0) {
      violations.push({ severity: "error", what: `loadingCount not zero for ${label}`, why: "Capture may be half-loaded.", remediation: "Wait for loading indicators to disappear and stable metrics.", filesAffected: [c.file || manifestPath], linesAffected: [] });
    }
    if (normalized.overflow.length > 0) {
      violations.push({ severity: "error", what: `Horizontal overflow for ${label}`, why: "Layout has width/overlap risk.", remediation: "Fix responsive constraints and recapture.", filesAffected: [c.file || manifestPath], linesAffected: [] });
    }
    if (s.hasExpected === false) {
      violations.push({ severity: "warning", what: `Expected operational anchor missing for ${label}`, why: "Capture may be on the wrong state or incomplete.", remediation: "Validate state-aware anchors for this breakpoint.", filesAffected: [c.file || manifestPath], linesAffected: [] });
    }
  }
}

const errors = violations.filter((v) => v.severity === "error").length;
console.log(JSON.stringify({ tool, regulation, passed: errors === 0, summary: violations.length ? `${violations.length} ready-gate issue(s)` : "ready gate passed", inconclusive: false, violations }));
