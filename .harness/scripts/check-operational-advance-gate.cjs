const fs = require("fs");
const path = require("path");

const tool = "operational-advance-gate";
const regulation = "behaviour";
const target = process.env.TARGET || process.argv[2] || "";
const violations = [];

function add(severity, what, why, remediation, file) {
  violations.push({ severity, what, why, remediation, filesAffected: file ? [file] : [], linesAffected: [] });
}

function normalize(text) {
  return String(text || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function eventText(ev) {
  return normalize(JSON.stringify(ev));
}

function readSessionFile(file) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) throw new Error(`empty session file: ${file}`);
  const header = JSON.parse(lines[0]);
  const events = [];
  for (const line of lines.slice(1)) {
    try {
      events.push(JSON.parse(line));
    } catch {
      // ignore malformed historical lines; the runtime parser remains stricter.
    }
  }
  return { header, events };
}

function newestSession(root) {
  const candidates = [];
  const sessionsDir = path.join(root, ".harness", ".local", "sessions");
  if (fs.existsSync(sessionsDir)) {
    for (const entry of fs.readdirSync(sessionsDir)) {
      if (entry.endsWith(".jsonl")) candidates.push(path.join(sessionsDir, entry));
    }
  }
  if (candidates.length === 0 && fs.existsSync(root)) {
    for (const entry of fs.readdirSync(root)) {
      if (entry.endsWith(".jsonl")) candidates.push(path.join(root, entry));
    }
  }
  return candidates.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0] || "";
}

function resolveSessionTarget(rawTarget) {
  if (!rawTarget) return "";
  const resolved = path.resolve(rawTarget);
  if (!fs.existsSync(resolved)) return resolved;
  const stat = fs.statSync(resolved);
  if (stat.isFile()) return resolved;
  return newestSession(resolved);
}

function isPrevcWorkflow(workflow) {
  return normalize(workflow).includes("prevc");
}

function hasPrevcBootstrap(header, events) {
  if (events.some((ev) => ev.kind === "task_started")) return true;
  const text = normalize([header.contract_id || "", ...events.map((ev) => JSON.stringify(ev))].join("\n"));
  return /\b(prd|plan|planejamento|plano|\.context\/plans|\.harness\/contracts)\b/.test(text) &&
    /\b(spec|contrato|contract)\b/.test(text) &&
    /\b(log|execution log|session log|registro de execucao|registro de execução)\b/.test(text);
}

function hasMeetingOrStrategyAfter(events, timestamp) {
  const afterMs = Date.parse(timestamp);
  return events.some((ev) => {
    if (Date.parse(ev.timestamp) <= afterMs) return false;
    if (ev.kind === "flow_gate" && ev.gate === "complete_when") return true;
    const text = eventText(ev);
    const meeting = text.includes("meeting") || text.includes("reuniao") || text.includes("mesa") || text.includes("convergencia") || text.includes("convergence");
    const strategy = text.includes("causal") || text.includes("hipotese") || text.includes("hypothesis") || text.includes("strategy_shift") || text.includes("estrategia") || text.includes("advance_when") || text.includes("stop_when");
    return meeting && strategy;
  });
}

function hasFailedCheckAfter(events, timestamp) {
  const afterMs = Date.parse(timestamp);
  return events.some((ev) => {
    if (Date.parse(ev.timestamp) <= afterMs) return false;
    if (ev.kind !== "sensor_run" && ev.kind !== "judge_review") return false;
    return !ev.passed || ev.violationCount > 0;
  });
}

function hasHumanContradictionAfter(events, timestamp) {
  const afterMs = Date.parse(timestamp);
  return events.some((ev) => {
    if (Date.parse(ev.timestamp) <= afterMs) return false;
    if (ev.kind !== "human_intervention" && ev.kind !== "review_finding") return false;
    const text = eventText(ev);
    return text.includes("continua") || text.includes("ainda") || text.includes("nao funcion") || text.includes("falso verde") || text.includes("cortad") || text.includes("ruim") || text.includes("falh");
  });
}

function hasPatchLoopSignal(events, timestamp) {
  const afterMs = Date.parse(timestamp);
  return events.some((ev) => {
    if (Date.parse(ev.timestamp) <= afterMs) return false;
    const text = eventText(ev);
    return text.includes("patch") || text.includes("ajuste") || text.includes("micro-ajuste") || text.includes("recorte pequeno") || text.includes("tentativa") || text.includes("diff");
  });
}

function repeatedReviewViolations(events, file) {
  const byTarget = new Map();
  for (const ev of events) {
    if (ev.kind !== "review_finding") continue;
    if (ev.action !== "fix_now") continue;
    if (!["P0", "P1", "P2"].includes(ev.severity)) continue;
    const targetName = String(ev.target || "").trim();
    const list = byTarget.get(targetName) || [];
    list.push(ev);
    byTarget.set(targetName, list);
  }

  for (const [targetName, findings] of byTarget) {
    if (findings.length < 2) continue;
    findings.sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
    const first = findings[0];
    const last = findings[findings.length - 1];
    if (!first || !last) continue;
    if (hasMeetingOrStrategyAfter(events, last.timestamp)) continue;

    const reviewers = [...new Set(findings.map((f) => f.reviewer))];
    let score = 2;
    const signals = ["repeated-fix-now-same-target"];
    if (findings.some((f) => f.severity === "P0" || f.severity === "P1")) { score += 1; signals.push("high-severity-review"); }
    if (reviewers.length >= 2) { score += 1; signals.push("multiple-reviewers"); }
    if (hasFailedCheckAfter(events, first.timestamp)) { score += 1; signals.push("failed-check-after-review"); }
    if (hasHumanContradictionAfter(events, first.timestamp)) { score += 1; signals.push("human-or-review-contradiction"); }
    if (hasPatchLoopSignal(events, first.timestamp)) { score += 1; signals.push("undersized-or-repeated-patch-loop"); }

    if (score >= 4) {
      add(
        "error",
        `Meeting required before advance_when for ${targetName}`,
        `Repeated review pressure scored ${score}/4 with ${signals.join(", ")}.`,
        "Record a structured meeting or regress_when with participants, causal_hypothesis, strategy_shift, advance_when and stop_when before advancing.",
        file
      );
    }
  }
}

if (!target) {
  add("error", "Missing session target", "Operational advance cannot be checked without a session JSONL or project root.", "Run with TARGET or argv[2] pointing to a session file, sessions dir or project root.", ".harness/scripts/check-operational-advance-gate.cjs");
} else {
  const sessionFile = resolveSessionTarget(target);
  if (!sessionFile || !fs.existsSync(sessionFile)) {
    add("error", "Session target missing", "Cannot inspect absent session evidence.", "Pass an existing session JSONL, sessions dir or project root.", target);
  } else {
    try {
      const { header, events } = readSessionFile(sessionFile);
      if (isPrevcWorkflow(header.workflow) && !hasPrevcBootstrap(header, events)) {
        add(
          "error",
          "PREVC bootstrap missing",
          "A PREVC session should not advance without plan/spec/log or a contract task bootstrap recorded in the session.",
          "Record a decision naming PRD/plan, SPEC and LOG artifacts, or start the relevant contract task, before advance_when.",
          sessionFile
        );
      }
      repeatedReviewViolations(events, sessionFile);
    } catch (err) {
      add("error", "Cannot parse session target", String(err.message || err), "Fix the session JSONL or pass a valid session target.", sessionFile);
    }
  }
}

const errors = violations.filter((violation) => violation.severity === "error").length;
console.log(JSON.stringify({
  tool,
  regulation,
  passed: errors === 0,
  summary: errors ? `${errors} operational advance blocker(s)` : "operational advance gate passed",
  inconclusive: false,
  violations
}));
process.exitCode = errors === 0 ? 0 : 1;
