const fs = require("fs");
const path = require("path");

const tool = "conversation-header-density";
const regulation = "fitness";
const target = process.env.TARGET || process.argv[2] || "";
const violations = [];

function add(severity, what, why, remediation, file, extra = {}) {
  violations.push({
    severity,
    what,
    why,
    remediation,
    filesAffected: file ? [file] : [],
    linesAffected: [],
    ...extra
  });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function findManifests(root) {
  const out = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name === "manifest.json") {
        out.push(full);
      }
    }
  }

  if (!fs.existsSync(root)) return out;
  const stat = fs.statSync(root);
  if (stat.isDirectory()) walk(root);
  else if (path.basename(root) === "manifest.json") out.push(root);
  return out;
}

function number(value) {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function boxHeight(box) {
  if (!box || typeof box !== "object") return null;
  return number(box.height) ?? ((number(box.bottom) ?? 0) - (number(box.top) ?? 0));
}

function boxTop(box) {
  return box && typeof box === "object" ? number(box.top) : null;
}

function inspectCapture(capture, manifestPath) {
  const state = capture.state || capture.metrics?.state || capture.metrics || {};
  const boxes = state.boxes || state.metrics?.boxes || {};
  const conversation = boxes.conversation || state.conversationColumn || state.conversation;
  const chatHeader = boxes.chatHeader || boxes.header || state.chatHeader;
  const thread = boxes.thread || state.chatThread || state.thread;
  const composer = boxes.composer || state.composer;

  if (!conversation || !chatHeader || !thread) return;

  const conversationHeight = boxHeight(conversation);
  const headerHeight = boxHeight(chatHeader);
  const threadHeight = boxHeight(thread);
  const composerHeight = boxHeight(composer);
  const conversationTop = boxTop(conversation);
  const threadTop = boxTop(thread);
  const preThreadHeight =
    conversationTop !== null && threadTop !== null ? threadTop - conversationTop : headerHeight;

  if (!conversationHeight || !headerHeight || !threadHeight) return;

  const slug = capture.slug || capture.viewport?.id || capture.viewport || path.basename(manifestPath, ".json");
  const viewportWidth = number(capture.width) || number(capture.viewport?.width) || number(state.viewport?.width);
  const isMobile = viewportWidth !== null && viewportWidth <= 480;
  const headerRatio = headerHeight / conversationHeight;
  const preThreadRatio = preThreadHeight / conversationHeight;
  const threadRatio = threadHeight / conversationHeight;
  const composerRatio = composerHeight ? composerHeight / conversationHeight : 0;
  const metrics = {
    slug,
    viewportWidth,
    conversationHeight,
    headerHeight,
    preThreadHeight,
    threadHeight,
    composerHeight,
    headerRatio: Number(headerRatio.toFixed(3)),
    preThreadRatio: Number(preThreadRatio.toFixed(3)),
    threadRatio: Number(threadRatio.toFixed(3)),
    composerRatio: Number(composerRatio.toFixed(3))
  };

  if (isMobile && preThreadRatio > 0.24) {
    add(
      "error",
      `Conversation thread starts too low for ${slug}`,
      "The active conversation header, badges, anchor or spacing consumes more than 24% of the conversation lane before the actual message thread starts.",
      "Compact the active conversation header/anchor area or move non-essential badges out of the vertical path before the thread.",
      capture.screenshot || capture.file || manifestPath,
      { metrics }
    );
  } else if (preThreadRatio > 0.18) {
    add(
      "warning",
      `Conversation pre-thread chrome is heavy for ${slug}`,
      "A large header/anchor area delays access to the real conversation content.",
      "Review whether badges, anchor controls and metadata can be flattened or moved inline.",
      capture.screenshot || capture.file || manifestPath,
      { metrics }
    );
  }

  if (headerRatio > 0.16) {
    add(
      isMobile ? "error" : "warning",
      `Conversation header is oversized for ${slug}`,
      "The chat header itself occupies a large share of the active conversation lane.",
      "Reduce header height, combine badges, or move secondary metadata to a less dominant region.",
      capture.screenshot || capture.file || manifestPath,
      { metrics }
    );
  }

  if (threadRatio < 0.22 && composerRatio > threadRatio) {
    add(
      "warning",
      `Conversation thread has less room than composer/header for ${slug}`,
      "The message thread is no longer the dominant content inside the active conversation card.",
      "Rebalance vertical allocation so the visible message thread remains the primary area.",
      capture.screenshot || capture.file || manifestPath,
      { metrics }
    );
  }
}

if (!target) {
  add(
    "error",
    "Missing conversation density target",
    "The sensor needs the current audit folder or manifest path.",
    "Run with TARGET or argv[2] pointing at the active visual audit artifact.",
    ".harness/scripts/check-conversation-header-density.cjs"
  );
} else {
  const manifests = findManifests(path.resolve(target));
  if (!manifests.length) {
    add(
      "error",
      "No manifest found",
      "Conversation header density needs machine-readable capture boxes.",
      "Capture visual evidence with conversation/chatHeader/thread boxes in manifest.json.",
      target
    );
  }

  for (const manifestPath of manifests) {
    const manifest = readJson(manifestPath);
    for (const capture of manifest.captures || []) {
      inspectCapture(capture, manifestPath);
    }
  }
}

const errors = violations.filter((violation) => violation.severity === "error").length;
console.log(
  JSON.stringify({
    tool,
    regulation,
    passed: errors === 0,
    summary: violations.length
      ? `${violations.length} conversation header density issue(s)`
      : "conversation header density is within thresholds",
    inconclusive: false,
    violations
  })
);

process.exitCode = errors === 0 ? 0 : 1;
