const fs = require("fs");
const path = require("path");

const tool = "visual-regression-loop-stop";
const regulation = "fitness";
const target = process.env.TARGET || process.argv[2] || "";
const violations = [];

function add(severity, what, why, remediation, file) {
  violations.push({ severity, what, why, remediation, filesAffected: file ? [file] : [], linesAffected: [] });
}

function walkFiles(root) {
  if (!fs.existsSync(root)) return [];
  const stat = fs.statSync(root);
  if (stat.isFile()) return [root];
  const out = [];
  const skip = /[\\/](node_modules|dist|logs?|cache|\.local)[\\/]/i;
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (skip.test(full)) continue;
      if (entry.isDirectory()) walk(full);
      else if (/\.(jsonl|json|ya?ml|md|txt)$/i.test(entry.name)) out.push(full);
    }
  }
  walk(root);
  return out;
}

function readJsonLines(file) {
  const records = [];
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      records.push({ file, value: JSON.parse(line), text: line });
    } catch {
      records.push({ file, value: null, text: line });
    }
  }
  return records;
}

function readRecords(file) {
  const text = fs.readFileSync(file, "utf8");
  if (/\.jsonl$/i.test(file)) return readJsonLines(file);
  if (/\.json$/i.test(file)) {
    try {
      const value = JSON.parse(text);
      if (Array.isArray(value)) return value.map((item) => ({ file, value: item, text: JSON.stringify(item) }));
      return [{ file, value, text }];
    } catch {
      return [{ file, value: null, text }];
    }
  }
  return text.split(/\r?\n/).map((line) => ({ file, value: null, text: line })).filter((record) => record.text.trim());
}

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .replace(/^["'`]+|["'`,;:.]+$/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function extractKey(text, obj) {
  const direct = obj && (obj.finding || obj.issue || obj.achado || obj.target || obj.violation || obj.what);
  if (direct) return normalizeKey(direct);
  const patterns = [
    /\b(?:finding|achado|issue|violation|target|what)\s*[:=]\s*["']?([A-Za-z0-9_.-]{3,80})/i,
    /\b(?:same_finding|same-achado)\s*[:=]\s*["']?([A-Za-z0-9_.-]{3,80})/i,
    /\b(topChromeGap|topbarSpaceWaste|horizontalOverflow|composerReach|visualReady|readyBeforeScreenshot)\b/i,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) return normalizeKey(match[1]);
  }
  if (obj && obj.sensor && /visual|topbar|ready|composer|layout/i.test(String(obj.sensor))) {
    return normalizeKey(obj.sensor);
  }
  return "";
}

function isFailure(text, obj) {
  if (obj && obj.kind === "sensor_run" && obj.passed === false) return true;
  if (obj && obj.kind === "review_finding" && /fix_now|judge/i.test(String(obj.action || ""))) return true;
  return /\b(passed\s*[:=]\s*false|failed|fail|falhou|regress(?:ion|ao|ão)?|blocker|bloqueou)\b/i.test(text);
}

function hasLoopExitEvidence(allText) {
  const lower = allText.toLowerCase();
  const required = [
    /reuni[aã]o|meeting/,
    /hip[oó]tese causal|causal_hypothesis|detected_reason/,
    /proposta [uú]nica|single_proposal|selected_strategy/,
    /micro_tasks/,
    /gate mensur[aá]vel|measurable_gate|next_gate/,
    /desfazer|continuar|undo_when|continue_when|rollback|stop_rule/,
  ];
  return required.every((pattern) => pattern.test(lower));
}

if (!target) {
  add("error", "Missing regression loop target", "The stop rule needs a session or evidence artifact to inspect.", "Run with TARGET or argv[2] pointing at a session JSONL, round folder or evidence artifact.", ".harness/scripts/check-visual-regression-loop-stop.cjs");
} else if (!fs.existsSync(target)) {
  add("error", "Regression loop target missing", "Cannot inspect absent session/evidence.", "Pass an existing JSONL, YAML/JSON artifact or folder.", target);
} else {
  const files = walkFiles(path.resolve(target));
  const records = files.flatMap(readRecords);
  const allText = records.map((record) => record.text).join("\n");
  const failures = [];
  for (const record of records) {
    const obj = record.value;
    const text = record.text;
    if (!isFailure(text, obj)) continue;
    const key = extractKey(text, obj);
    if (!key || !/visual|top|chrome|bar|overflow|composer|ready|layout|gap|reach|density|waste/i.test(key)) continue;
    failures.push({ key, file: record.file, text });
  }

  let currentKey = "";
  let currentRun = 0;
  let maxRun = { key: "", count: 0, file: "" };
  for (const failure of failures) {
    if (failure.key === currentKey) currentRun += 1;
    else {
      currentKey = failure.key;
      currentRun = 1;
    }
    if (currentRun > maxRun.count) maxRun = { key: failure.key, count: currentRun, file: failure.file };
  }

  if (maxRun.count >= 3 && !hasLoopExitEvidence(allText)) {
    add(
      "error",
      `Three consecutive visual regressions for ${maxRun.key}`,
      "The same visual finding failed three times without a material strategy change record.",
      "Stop micro-recortes and record: meeting, causal_hypothesis, single_proposal, measurable_gate, continue_when/undo_when or stop_rule.",
      maxRun.file || target
    );
  }
}

const errors = violations.filter((violation) => violation.severity === "error").length;
console.log(JSON.stringify({
  tool,
  regulation,
  passed: errors === 0,
  summary: errors ? `${errors} visual regression loop blocker(s)` : "visual regression loop stop rule satisfied",
  inconclusive: false,
  violations
}));
process.exitCode = errors === 0 ? 0 : 1;
