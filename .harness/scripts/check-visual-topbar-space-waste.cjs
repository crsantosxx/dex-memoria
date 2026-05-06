const fs = require("fs");
const path = require("path");
const {
  missingTargetViolation,
  normalizeCapture,
  resolveAfterTarget,
} = require("./visual-target-utils.cjs");

const tool = "visual-topbar-space-waste";
const regulation = "fitness";
const target = resolveAfterTarget();
const manifestPath = path.join(target, "manifest.json");
const violations = [];

const OPERATIONAL_RECT_NAMES = [
  "conversation",
  "queue",
  "state",
  "thread",
  "list",
  "table",
  "board",
  "dashboard",
  "grid",
];

const CONTAINER_RECT_NAMES = [
  "main",
  "content",
];

const CHROME_RECT_NAMES = [
  "topbar",
  "chrome",
  "navbar",
  "nav",
  "masthead",
  "header",
  "toolbar",
];

if (!target) {
  violations.push(missingTargetViolation("check-visual-topbar-space-waste", "Run with TARGET or capture 04-after/manifest.json first."));
} else if (!fs.existsSync(manifestPath)) {
  violations.push({
    severity: "error",
    what: "Missing manifest",
    why: "Cannot measure topbar/chrome space waste without visual capture metadata.",
    remediation: "Pass an after folder with manifest.json.",
    filesAffected: [manifestPath],
    linesAffected: [],
  });
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const rawCapture of manifest.captures || []) {
    inspectCapture(rawCapture);
  }
}

const errors = violations.filter((violation) => violation.severity === "error").length;
console.log(JSON.stringify({
  tool,
  regulation,
  passed: errors === 0,
  summary: errors ? `${errors} topbar/chrome space waste blocker(s)` : "topbar/chrome space usage is within thresholds",
  inconclusive: false,
  violations,
}));
process.exitCode = errors === 0 ? 0 : 1;

function inspectCapture(rawCapture) {
  const capture = normalizeCapture(rawCapture);
  const state = rawCapture.state || rawCapture.metrics || {};
  const viewport = state.viewport || rawCapture.viewport || {};
  const viewportWidth = numberOr(rawCapture.width, viewport.width, 0);
  const viewportHeight = numberOr(rawCapture.height, viewport.height, 0);
  const label = capture.label;
  const sourceFile = capture.file || manifestPath;

  if (!viewportWidth || !viewportHeight) {
    add("warning", `Missing viewport size for ${label}`, "The sensor cannot compute first-fold ratios.", "Record viewport width and height in the manifest.", sourceFile);
    return;
  }

  const rectEntries = Object.entries(state.rects || rawCapture.rects || {})
    .map(([name, rect]) => ({ name, rect: normalizeRect(rect) }))
    .filter((entry) => isUsableRect(entry.rect));

  if (!rectEntries.length) {
    add("warning", `Missing rect evidence for ${label}`, "Topbar space waste needs bounding boxes for chrome and operational content.", "Record state.rects for topbar/main/content/conversation or equivalent anchors.", sourceFile);
    return;
  }

  const operationalRects = rectEntries.filter((entry) => isOperationalRectName(entry.name));
  const containerRects = rectEntries.filter((entry) => isContainerRectName(entry.name));
  const primaryRects = operationalRects.length ? operationalRects : containerRects;
  const chromeRects = rectEntries.filter((entry) => isChromeRectName(entry.name));
  const mainStart = primaryRects.length
    ? Math.min(...primaryRects.map((entry) => entry.rect.top))
    : Math.min(...rectEntries.map((entry) => entry.rect.top));
  const viewportKind = viewportWidth < 700 ? "mobile" : "desktop";
  const maxMainStartRatio = viewportKind === "mobile" ? 0.40 : 0.30;
  const maxMainStartPx = viewportKind === "mobile" ? 360 : 320;
  const allowedMainStart = Math.min(viewportHeight * maxMainStartRatio, maxMainStartPx);

  if (mainStart > allowedMainStart) {
    add(
      "error",
      `Operational content starts too late for ${label}`,
      `The first operational rect starts at ${round(mainStart)}px, beyond the ${round(allowedMainStart)}px ${viewportKind} limit.`,
      "Reduce topbar/chrome/secondary filters before the operational middle or make the first fold distribute useful content earlier.",
      sourceFile,
    );
  }

  for (const entry of chromeRects) {
    const rect = entry.rect;
    const topBand = rect.top <= viewportHeight * 0.22;
    const tallEnough = rect.height >= (viewportKind === "mobile" ? 96 : 80);
    if (!topBand || !tallEnough) continue;

    const widthRatio = rect.width / viewportWidth;
    const leftVoid = Math.max(0, rect.left);
    const rightVoid = Math.max(0, viewportWidth - rect.right);
    const sideVoidRatio = (leftVoid + rightVoid) / viewportWidth;
    const centralCardLike =
      widthRatio < 0.72 &&
      sideVoidRatio > 0.24 &&
      rect.left > viewportWidth * 0.08 &&
      rect.right < viewportWidth * 0.92;

    if (centralCardLike) {
      add(
        "error",
        `Top chrome is centered with large side voids for ${label}`,
        `${entry.name} uses ${round(widthRatio * 100)}% of viewport width while its side voids consume ${round(sideVoidRatio * 100)}%.`,
        "Spread useful controls/status across the band, collapse secondary chrome, or move the card out of the first operational fold.",
        sourceFile,
      );
    }
  }
}

function add(severity, what, why, remediation, file) {
  violations.push({ severity, what, why, remediation, filesAffected: [file], linesAffected: [] });
}

function numberOr(...values) {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

function normalizeRect(rect) {
  const left = Number(rect?.left ?? rect?.x ?? 0);
  const top = Number(rect?.top ?? rect?.y ?? 0);
  const width = Number(rect?.width ?? 0);
  const height = Number(rect?.height ?? 0);
  const right = Number(rect?.right ?? left + width);
  const bottom = Number(rect?.bottom ?? top + height);
  return { left, top, width: right - left || width, height: bottom - top || height, right, bottom };
}

function isUsableRect(rect) {
  return rect.width > 16 && rect.height > 16 && rect.bottom > 0 && rect.right > 0;
}

function isOperationalRectName(name) {
  const lower = String(name).toLowerCase();
  return OPERATIONAL_RECT_NAMES.some((token) => lower.includes(token));
}

function isContainerRectName(name) {
  const lower = String(name).toLowerCase();
  return CONTAINER_RECT_NAMES.some((token) => lower.includes(token));
}

function isChromeRectName(name) {
  const lower = String(name).toLowerCase();
  if (lower.includes("chat") || lower.includes("conversationheader")) return false;
  if (lower === "header") return true;
  return CHROME_RECT_NAMES.some((token) => lower.includes(token));
}

function round(value) {
  return Math.round(value * 10) / 10;
}
