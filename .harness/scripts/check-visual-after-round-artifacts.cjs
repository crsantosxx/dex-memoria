const fs = require("fs");
const path = require("path");
const { normalizeCapture } = require("./visual-target-utils.cjs");

const tool = "visual-after-round-artifacts";
const regulation = "fitness";
const target = process.env.TARGET || process.argv[2] || "";
const violations = [];

function add(severity, what, why, remediation, file) {
  violations.push({ severity, what, why, remediation, filesAffected: file ? [file] : [], linesAffected: [] });
}

if (!target) {
  add("error", "Missing after target", "Date-stamped defaults can validate stale after artifacts.", "Run with TARGET or argv[2] pointing at current after evidence.", ".harness/scripts/check-visual-after-round-artifacts.cjs");
} else {
  const resolved = path.resolve(target);
  if (!fs.existsSync(resolved)) {
    add("error", "After target missing", "Cannot inspect missing after evidence.", "Pass an existing after directory or report.", resolved);
  } else {
    const isDirectory = fs.statSync(resolved).isDirectory();
    const manifest = isDirectory ? path.join(resolved, "manifest.json") : "";
    const file = isDirectory
      ? ["manifest.json", "report.json", "summary.json"].map((name) => path.join(resolved, name)).find((candidate) => fs.existsSync(candidate))
      : resolved;
    if (!file) {
      add("error", "After evidence lacks manifest/report/summary", "After artifacts need machine-readable evidence.", "Write manifest.json, report.json or summary.json.", resolved);
    } else {
      const json = JSON.parse(fs.readFileSync(file, "utf8"));
      const failed = Number(json.failed || json.totals?.failed || 0);
      if (failed > 0) add("error", "After report has failed checks", "After evidence is not acceptable while checks fail.", "Fix after capture or keep round blocked.", file);
      const captures = json.captures || [];
      if (isDirectory && captures.length && path.basename(file) !== "manifest.json" && !fs.existsSync(manifest)) {
        add("warning", "Legacy after evidence without manifest", "New screenshot rounds should keep capture state in 04-after/manifest.json.", "Write manifest.json next to screenshots; legacy report/summary remains inspectable.", resolved);
      }
      if (captures.length) {
        const normalizedCaptures = captures.map((capture) => normalizeCapture(capture));
        const viewports = new Set(normalizedCaptures.map((capture) => capture.viewport.toLowerCase()).filter(Boolean));
        for (const capture of normalizedCaptures) {
          if (!capture.slug || !capture.viewport) {
            add("error", "After capture lacks slug or viewport", "Round artifacts cannot prove which surface and breakpoint were captured.", "Record slug and viewport for every after capture.", file);
          }
          if (!capture.finalUrl) {
            add("error", `Missing finalUrl for ${capture.label}`, "After artifacts need canonical URL provenance.", "Record finalUrl for every capture.", file);
          }
          if (!capture.file || !screenshotExists(path.dirname(file), capture.file)) {
            add("error", `Missing screenshot ${capture.file || capture.label}`, "Manifest points to absent screenshot evidence.", "Fix capture file path or recapture.", file);
          }
        }
        for (const requiredViewport of ["desktop", "wide", "mobile"]) {
          if (!viewports.has(requiredViewport)) {
            add("error", `Missing ${requiredViewport} after viewport`, "Layout after evidence must cover desktop, wide and mobile before ready claims.", "Capture the missing viewport or split the round with an explicit non-layout scope.", file);
          }
        }
      }
    }
  }
}

const errors = violations.filter((violation) => violation.severity === "error").length;
console.log(JSON.stringify({ tool, regulation, passed: errors === 0, summary: errors ? `${errors} after artifact blocker(s)` : "after artifacts are inspectable", inconclusive: false, violations }));
process.exitCode = errors === 0 ? 0 : 1;

function screenshotExists(baseDir, file) {
  if (!file) return false;
  if (path.isAbsolute(file)) return fs.existsSync(file);
  return fs.existsSync(path.resolve(baseDir, file));
}
