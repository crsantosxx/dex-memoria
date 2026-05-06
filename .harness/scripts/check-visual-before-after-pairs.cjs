const fs = require("fs");
const path = require("path");
const {
  missingTargetViolation,
  normalizeCapture,
  resolveAfterManifestForRound,
  resolveRoundTarget,
} = require("./visual-target-utils.cjs");

const tool = "visual-before-after-pairing-gate";
const regulation = "fitness";
const target = resolveRoundTarget();
const violations = [];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const beforeManifestPath = path.join(target, "00-manifest.json");
const finalManifestPath = resolveAfterManifestForRound(target);

if (!target) {
  violations.push(missingTargetViolation("check-visual-before-after-pairs", "Run with TARGET or capture 04-after/manifest.json first."));
} else if (!fs.existsSync(beforeManifestPath)) {
  violations.push({ severity: "error", what: "Missing before manifest", why: "Cannot know expected screens and viewports.", remediation: "Create 00-manifest.json.", filesAffected: [beforeManifestPath], linesAffected: [] });
}
if (target && (!finalManifestPath || !fs.existsSync(finalManifestPath))) {
  violations.push({ severity: "error", what: "Missing final after manifest", why: "Cannot compare final after screenshots with before evidence.", remediation: "Create 04-after/manifest.json.", filesAffected: [finalManifestPath], linesAffected: [] });
}

if (!violations.length) {
  const before = readJson(beforeManifestPath);
  const after = readJson(finalManifestPath);
  const screens = (before.screens || []).map((s) => s.slug).filter(Boolean);
  const viewports = (before.viewports || []).map((v) => v.name).filter(Boolean);
  const expected = new Set(screens.flatMap((slug) => viewports.map((viewport) => `${slug}/${viewport}`)));
  const captures = after.captures || [];
  const normalizedCaptures = captures.map((c) =>
    normalizeCapture(c, { fallbackSlug: screens.length === 1 ? screens[0] : "" }),
  );
  const actual = new Set(normalizedCaptures.map((c) => c.label));

  for (const c of normalizedCaptures) {
    if (!c.slug || !c.viewport) {
      violations.push({
        severity: "error",
        what: "Capture manifest is not pairable",
        why: "Every after capture must expose a slug and viewport, or an equivalent normalized shape.",
        remediation: "Write slug/viewport or use a manifest shape supported by visual-target-utils.",
        filesAffected: [finalManifestPath],
        linesAffected: [],
      });
    }
  }

  for (const pair of expected) {
    if (!actual.has(pair)) {
      violations.push({ severity: "error", what: `Missing final after pair ${pair}`, why: "Before/after comparison is incomplete.", remediation: "Recapture or remove the screen from before manifest.", filesAffected: [finalManifestPath], linesAffected: [] });
    }
  }

  for (const c of normalizedCaptures) {
    const label = c.label;
    const file = resolveCaptureFile(target, c.file || "");
    if (!expected.has(label)) {
      violations.push({ severity: "warning", what: `Unexpected after pair ${label}`, why: "After evidence is not declared in before manifest.", remediation: "Update before manifest or remove unrelated capture.", filesAffected: [finalManifestPath], linesAffected: [] });
    }
    if (!c.file || !fs.existsSync(file)) {
      violations.push({ severity: "error", what: `Missing screenshot file for ${label}`, why: "Manifest points to evidence that does not exist.", remediation: "Write the screenshot file or fix manifest path.", filesAffected: [c.file || finalManifestPath], linesAffected: [] });
    }
    const finalUrl = c.finalUrl;
    if (!finalUrl.startsWith(before.baseUrl || "")) {
      violations.push({ severity: "error", what: `Non-canonical finalUrl for ${label}`, why: "After capture may be from the wrong deployment or environment.", remediation: "Use the canonical base URL from 00-manifest.json.", filesAffected: [finalManifestPath], linesAffected: [] });
    }
    if (c.loginLike) {
      violations.push({ severity: "error", what: `Login-like capture for ${label}`, why: "Protected screen evidence is not comparable.", remediation: "Use shared authenticated browser and recapture.", filesAffected: [c.file || finalManifestPath], linesAffected: [] });
    }
  }

  const beforePngs = walk(path.join(target, "01-before")).filter((f) => f.endsWith(".png"));
  if (beforePngs.length < expected.size) {
    violations.push({ severity: "error", what: "Before screenshots fewer than expected pairs", why: "The audit cannot prove all before states.", remediation: "Capture missing before screenshots.", filesAffected: [path.join(target, "01-before")], linesAffected: [] });
  }
}

const errors = violations.filter((v) => v.severity === "error").length;
console.log(JSON.stringify({ tool, regulation, passed: errors === 0, summary: errors ? `${errors} blocking pairing issue(s)` : "before/after pairs are comparable", inconclusive: false, violations }));

function resolveCaptureFile(roundTarget, file) {
  if (!file) return "";
  if (path.isAbsolute(file)) return file;
  const roundRelative = path.join(roundTarget, file);
  if (fs.existsSync(roundRelative)) return roundRelative;
  return path.join(roundTarget, "04-after", file);
}
