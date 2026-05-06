const fs = require("fs");
const path = require("path");

const tool = "bad-loop-guard";
const regulation = "maintainability";
const target = process.env.TARGET || process.argv[2] || "";
const violations = [];

function add(severity, what, why, remediation, file) {
  violations.push({ severity, what, why, remediation, filesAffected: file ? [file] : [], linesAffected: [] });
}

function findLoopFiles(root) {
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/loop-control\.(yaml|yml|json)$/i.test(entry.name)) {
        files.push(full);
      }
    }
  }
  if (fs.existsSync(root)) {
    const stat = fs.statSync(root);
    if (stat.isDirectory()) walk(root);
    else if (/loop-control\.(yaml|yml|json)$/i.test(root)) files.push(root);
  }
  return files;
}

if (!target) {
  add("error", "Missing loop guard target", "Loop detection cannot rely on stale defaults.", "Run with TARGET or argv[2] pointing at the current audit/session artifact.", ".harness/scripts/check-bad-loop-guard.cjs");
} else if (!fs.existsSync(target)) {
  add("error", "Loop guard target missing", "Cannot inspect absent loop-control evidence.", "Pass an existing audit folder or loop-control file.", target);
} else {
  const files = findLoopFiles(path.resolve(target));
  if (files.length === 0) {
    add("warning", "No loop-control artifact found", "If repeated failures occurred, the session has no typed proof of strategy shift.", "Create loop-control.yaml when the same tactic fails twice.", target);
  }
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8").toLowerCase();
    for (const field of ["repeated_failure", "attempts", "detected_reason", "strategy_shift", "stop_rule", "owner", "next_gate"]) {
      if (!text.includes(`${field}:`)) {
        add("error", `Missing ${field}`, "Loop-control artifacts must prove the loop was broken, not just noticed.", "Add the required field before attempting the tactic again.", file);
      }
    }
    if (/strategy_shift:\s*(null|none|n\/a|na)?\s*$/m.test(text)) {
      add("error", "Strategy shift is empty", "A loop guard without a changed tactic does not prevent wasted retries.", "Either record a real changed tactic or park the work.", file);
    }
  }
}

const errors = violations.filter((violation) => violation.severity === "error").length;
console.log(JSON.stringify({
  tool,
  regulation,
  passed: errors === 0,
  summary: errors ? `${errors} loop guard blocker(s)` : "bad loop guard has typed exit evidence",
  inconclusive: false,
  violations
}));
process.exitCode = errors === 0 ? 0 : 1;
