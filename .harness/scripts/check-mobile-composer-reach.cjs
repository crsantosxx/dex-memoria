const fs = require("fs");
const path = require("path");
const { missingTargetViolation, normalizeCapture, resolveAfterTarget } = require("./visual-target-utils.cjs");

const tool = "mobile-composer-reach";
const regulation = "fitness";
const target = resolveAfterTarget();
const manifestPath = path.join(target, "manifest.json");
const violations = [];

function add(severity, what, why, remediation, file, extra = {}) {
  violations.push({ severity, what, why, remediation, filesAffected: file ? [file] : [], linesAffected: [], ...extra });
}

function number(value) {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function rectHeight(rect) {
  if (!rect || typeof rect !== "object") return null;
  return number(rect.height) ?? ((number(rect.bottom) ?? 0) - (number(rect.top) ?? 0));
}

function rectBottom(rect) {
  return rect && typeof rect === "object" ? number(rect.bottom) : null;
}

function rectRight(rect) {
  if (!rect || typeof rect !== "object") return null;
  return number(rect.right) ?? number(rect.rect?.right);
}

function rectLeft(rect) {
  if (!rect || typeof rect !== "object") return null;
  return number(rect.left) ?? number(rect.rect?.left);
}

function boxesFrom(capture) {
  const state = capture.state || capture.metrics?.state || capture.metrics || {};
  return {
    ...(state.rects || state.boxes || state.metrics?.boxes || {}),
    ...(state.composerReach || {})
  };
}

function scrollFrom(capture) {
  const state = capture.state || capture.metrics?.state || capture.metrics || {};
  return state.scroll || state.metrics?.scroll || {};
}

function firstBox(boxes, names) {
  for (const name of names) {
    if (boxes[name]) return boxes[name];
  }
  return null;
}

function isMobile(capture) {
  const state = capture.state || {};
  const width = number(capture.width) || number(capture.viewport?.width) || number(state.viewport?.width);
  const viewport = typeof capture.viewport === "string" ? capture.viewport.toLowerCase() : String(capture.viewport?.id || "");
  return viewport === "mobile" || (width !== null && width <= 480);
}

function isBenignOverflow(item) {
  const className = String(item?.className || "").toLowerCase();
  const id = String(item?.id || "").toLowerCase();
  const tag = String(item?.tag || "").toLowerCase();
  const right = rectRight(item);
  const left = rectLeft(item);
  const offLeft = right !== null && right <= 0 || left !== null && left < -24;
  const looksOffcanvas = className.includes("sidebar") || id.includes("sidebar") || tag === "aside";
  const explicitlyBenign = /benign|offcanvas|drawer-hidden/.test(className) || /benign|offcanvas|drawer-hidden/.test(id);
  return (offLeft && looksOffcanvas) || explicitlyBenign;
}

function hasFunctionalVerticalScroll(capture, composerBottom, viewportHeight) {
  const state = capture.state || capture.metrics?.state || capture.metrics || {};
  const scroll = scrollFrom(capture);
  const docScrollHeight =
    number(scroll.docScrollHeight) ||
    number(scroll.scrollHeight) ||
    number(state.docScrollHeight) ||
    number(state.scrollHeight);
  const docClientHeight =
    number(scroll.docClientHeight) ||
    number(scroll.clientHeight) ||
    number(state.docClientHeight) ||
    number(state.clientHeight) ||
    viewportHeight;
  const canScrollDocument =
    docScrollHeight !== null &&
    docClientHeight !== null &&
    docScrollHeight > docClientHeight + 24;
  const reachableByKnownDocumentScroll =
    canScrollDocument && composerBottom !== null && composerBottom <= docScrollHeight + 1;
  return { canScrollDocument, reachableByKnownDocumentScroll, docScrollHeight, docClientHeight };
}

if (!target) {
  violations.push(missingTargetViolation("check-mobile-composer-reach", "Run with TARGET or capture 04-after/manifest.json first."));
} else if (!fs.existsSync(manifestPath)) {
  add("error", "Missing manifest", "Cannot inspect mobile composer reach without machine-readable evidence.", "Write manifest.json with mobile rects.", manifestPath);
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const c of manifest.captures || []) {
    if (!isMobile(c)) continue;

    const capture = normalizeCapture(c);
    const label = capture.label;
    const boxes = boxesFrom(c);
    const composer = firstBox(boxes, ["composer", "liveComposer", "replyComposer"]);
    const conversation = firstBox(boxes, ["conversation", "conversationColumn", "threadPanel"]);
    const textarea = firstBox(boxes, ["textarea", "composerTextarea", "replyTextarea", "input"]);
    const primaryAction = firstBox(boxes, ["primaryAction", "sendButton", "submitButton", "composerPrimaryAction", "send"]);
    const options = firstBox(boxes, ["options", "composerOptions", "statusOptions", "quickActions"]);
    const status = firstBox(boxes, ["status", "composerStatus", "replyStatus", "planStatus"]);
    const viewportHeight = number(c.height) || number(c.viewport?.height) || number(c.state?.viewport?.height);

    const realOverflow = capture.overflow.filter((item) => !isBenignOverflow(item));
    if (realOverflow.length > 0) {
      add(
        "error",
        `Real horizontal overflow for ${label}`,
        "Mobile composer reach cannot be trusted while controls or filters escape viewport width.",
        "Fix horizontal constraints or mark the overflow benign with explicit offcanvas/benign metadata.",
        c.file || c.screenshot || manifestPath,
        { metrics: { overflowCount: realOverflow.length } }
      );
    }

    if (!composer || !viewportHeight) {
      add(
        "warning",
        `Missing composer reach boxes for ${label}`,
        "The sensor cannot prove textarea and primary action reach without composer and viewport metrics.",
        "Capture rects.composer plus textarea/primaryAction when available.",
        c.file || c.screenshot || manifestPath
      );
      continue;
    }

    const composerBottom = rectBottom(composer);
    const composerHeight = rectHeight(composer);
    const conversationHeight = rectHeight(conversation);
    const textareaHeight = rectHeight(textarea) || 0;
    const primaryActionHeight = rectHeight(primaryAction) || 0;
    const optionsHeight = rectHeight(options) || 0;
    const statusHeight = rectHeight(status) || 0;
    const fieldAndActionHeight = textareaHeight + primaryActionHeight;
    const secondaryHeight = optionsHeight + statusHeight;
    const composerViewportLimit = viewportHeight * 1.15;
    const composerRatio = conversationHeight ? composerHeight / conversationHeight : 0;
    const scrollMetrics = hasFunctionalVerticalScroll(c, composerBottom, viewportHeight);
    const metrics = {
      viewportHeight,
      composerBottom,
      composerHeight,
      conversationHeight,
      composerRatio: Number(composerRatio.toFixed(3)),
      textareaHeight,
      primaryActionHeight,
      fieldAndActionHeight,
      secondaryHeight,
      ...scrollMetrics
    };

    if (composerBottom !== null && composerBottom > composerViewportLimit) {
      if (!scrollMetrics.reachableByKnownDocumentScroll) {
        add(
          "error",
          `Mobile composer reach is not proven for ${label}`,
          "The textarea/action area exceeds the visible mobile area and the manifest does not prove functional vertical scroll reaches it.",
          "Capture scrollHeight/clientHeight evidence or fix the layout so textarea and primary action are reachable without relying on unproven scroll.",
          c.file || c.screenshot || manifestPath,
          { metrics }
        );
      } else if (!textarea && !primaryAction) {
        add(
          "warning",
          `Mobile composer relies on scroll but lacks field/action rects for ${label}`,
          "Document scroll appears functional, but the manifest does not prove the textarea and primary action themselves are reachable.",
          "Capture textarea and primary action bounding boxes after scroll validation.",
          c.file || c.screenshot || manifestPath,
          { metrics }
        );
      }
    }

    if (conversationHeight && composerRatio > 0.33) {
      add(
        "error",
        `Mobile composer consumes too much vertical lane for ${label}`,
        "The composer takes more than one third of the conversation area, which usually means options/status are crowding the primary reply path.",
        "Cap secondary composer content and prioritize textarea plus primary action.",
        c.file || c.screenshot || manifestPath,
        { metrics }
      );
    }

    if (secondaryHeight > 0 && fieldAndActionHeight > 0 && secondaryHeight > fieldAndActionHeight) {
      add(
        "error",
        `Mobile composer secondary controls dominate for ${label}`,
        "Options/status occupy more vertical space than the textarea plus primary action.",
        "Collapse secondary status/options and keep field plus primary action dominant.",
        c.file || c.screenshot || manifestPath,
        { metrics }
      );
    }
  }
}

const errors = violations.filter((v) => v.severity === "error").length;
console.log(JSON.stringify({
  tool,
  regulation,
  passed: errors === 0,
  summary: violations.length ? `${violations.length} mobile composer reach issue(s)` : "mobile composer reach is within thresholds",
  inconclusive: false,
  violations
}));
process.exitCode = errors === 0 ? 0 : 1;
