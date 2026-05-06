const fs = require("fs");
const path = require("path");

function explicitTarget(argvIndex = 2) {
  return process.env.TARGET || process.argv[argvIndex] || "";
}

function findLatestAfterManifest(root = path.join(process.cwd(), "output", "visual-layout-audit")) {
  const candidates = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name === "manifest.json" && isInsideAfterDir(full)) {
        candidates.push({ file: full, mtimeMs: fs.statSync(full).mtimeMs });
      }
    }
  }

  walk(root);
  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return candidates[0] ? candidates[0].file : "";
}

function resolveAfterTarget(argvIndex = 2) {
  const explicit = explicitTarget(argvIndex);
  if (explicit) return explicit;
  const manifest = findLatestAfterManifest();
  return manifest ? path.dirname(manifest) : "";
}

function resolveRoundTarget(argvIndex = 2) {
  const explicit = explicitTarget(argvIndex);
  if (explicit) return explicit;
  const after = resolveAfterTarget(argvIndex);
  return after ? roundRootFromAfterTarget(after) : "";
}

function isInsideAfterDir(filePath) {
  return filePath
    .split(/[\\/]+/)
    .some((part) => part === "04-after");
}

function roundRootFromAfterTarget(afterTarget) {
  const parts = path.resolve(afterTarget).split(path.sep);
  const idx = parts.lastIndexOf("04-after");
  if (idx > 0) return parts.slice(0, idx).join(path.sep);
  return path.dirname(afterTarget);
}

function findLatestManifest(root) {
  const candidates = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "manifest.json") {
        candidates.push({ file: full, mtimeMs: fs.statSync(full).mtimeMs });
      }
    }
  }
  walk(root);
  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return candidates[0] ? candidates[0].file : "";
}

function resolveAfterManifestForRound(roundTarget) {
  if (!roundTarget) return "";
  const directManifest = path.join(roundTarget, "manifest.json");
  if (fs.existsSync(directManifest) && isInsideAfterDir(directManifest)) {
    return directManifest;
  }
  const directAfter = path.join(roundTarget, "04-after", "manifest.json");
  if (fs.existsSync(directAfter)) return directAfter;
  return findLatestManifest(path.join(roundTarget, "04-after"));
}

function normalizeViewport(viewport) {
  if (typeof viewport === "string") return viewport;
  if (viewport && typeof viewport === "object") {
    return String(viewport.name || viewport.id || viewport.label || "").trim();
  }
  return "";
}

function normalizeSlug(capture, fallback = "") {
  return String(
    capture?.slug ||
      capture?.screen?.slug ||
      capture?.screenId ||
      capture?.id ||
      fallback ||
      "",
  ).trim();
}

function normalizeFinalUrl(capture) {
  return String(
    capture?.state?.finalUrl ||
      capture?.finalUrl ||
      capture?.metrics?.url ||
      capture?.url ||
      "",
  );
}

function normalizeBodyText(capture) {
  return String(
    capture?.state?.bodyTextSample ||
      capture?.state?.bodyText ||
      capture?.metrics?.bodyTextSample ||
      capture?.metrics?.bodyText ||
      "",
  );
}

function normalizeLoginLike(capture) {
  return Boolean(capture?.state?.loginLike || capture?.metrics?.loginLike);
}

function normalizeOverflow(capture) {
  const value = capture?.state?.overflow ?? capture?.metrics?.overflow ?? [];
  if (Array.isArray(value)) return value;
  if (value === true) return [{ tag: "unknown", className: "", id: "", rect: {} }];
  return [];
}

function normalizeCapture(capture, options = {}) {
  const slug = normalizeSlug(capture, options.fallbackSlug);
  const viewport = normalizeViewport(capture?.viewport);
  const screenshot = String(capture?.file || capture?.screenshot || "");
  return {
    raw: capture,
    slug,
    viewport,
    label: `${slug || "unknown"}/${viewport || "unknown"}`,
    file: screenshot,
    finalUrl: normalizeFinalUrl(capture),
    bodyText: normalizeBodyText(capture),
    loginLike: normalizeLoginLike(capture),
    overflow: normalizeOverflow(capture),
  };
}

function resolveMeetingsTarget(argvIndex = 2) {
  const explicit = explicitTarget(argvIndex);
  if (explicit) return explicit;
  const round = resolveRoundTarget(argvIndex);
  return round ? path.join(round, "06-meetings") : "";
}

function missingTargetViolation(scriptName, remediation) {
  return {
    severity: "error",
    what: "Missing visual audit target",
    why: "No explicit TARGET/argv target was provided and no recent 04-after/manifest.json could be discovered.",
    remediation,
    filesAffected: [`.harness/scripts/${scriptName}.cjs`],
    linesAffected: [],
  };
}

module.exports = {
  findLatestAfterManifest,
  normalizeCapture,
  missingTargetViolation,
  resolveAfterManifestForRound,
  resolveAfterTarget,
  resolveMeetingsTarget,
  resolveRoundTarget,
  roundRootFromAfterTarget,
};
