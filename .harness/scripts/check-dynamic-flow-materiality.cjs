const fs = require("fs");
const path = require("path");

const tool = "dynamic-flow-materiality";
const regulation = "maintainability";
const target = process.env.TARGET || process.argv[2] || "";
const violations = [];

function add(severity, what, why, remediation, file) {
  violations.push({ severity, what, why, remediation, filesAffected: file ? [file] : [], linesAffected: [] });
}

function readText(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

if (!target) {
  add("error", "Missing flow materiality target", "A dynamic flow gate needs current meeting/session artifacts.", "Run with TARGET or argv[2] pointing at the active meeting or audit folder.", ".harness/scripts/check-dynamic-flow-materiality.cjs");
} else {
  const resolved = path.resolve(target);
  if (!fs.existsSync(resolved)) {
    add("error", "Flow materiality target missing", "Cannot inspect absent meeting/session artifact.", "Pass an existing meeting file or audit folder.", resolved);
  } else {
    const files = [];
    if (fs.statSync(resolved).isDirectory()) {
      function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) walk(full);
          else if (/\.(md|yaml|yml|json)$/i.test(entry.name)) files.push(full);
        }
      }
      walk(resolved);
    } else {
      files.push(resolved);
    }
    const text = files.map(readText).join("\n").toLowerCase();
    const required = [
      ["chato", "Chato divergence/material criticism is missing"],
      ["questionador", "Questionador divergence/material decision pressure is missing"],
      ["curioso", "Curioso real-use clarification is missing"],
      ["focus", "Convergence focus is missing"],
      ["non_focus", "Convergence non-focus is missing"],
      ["ready_criteria", "Ready criteria are missing"],
      ["material_credits", "Material credits are missing"],
      ["parking", "Parking output is missing"]
    ];
    for (const [token, message] of required) {
      if (!text.includes(token)) add("error", message, "Dynamic flow can become decorative without this material field.", "Record a typed convergence meeting with this field.", resolved);
    }
    if (/sem mudanca|no_change/.test(text) && /material_credits/.test(text)) {
      add("warning", "No-change and material credits both present", "The flow may be mixing a no-op retro with claimed contribution.", "Clarify whether the meeting changed anything or explicitly no-op'd.", resolved);
    }
  }
}

const errors = violations.filter((violation) => violation.severity === "error").length;
console.log(JSON.stringify({ tool, regulation, passed: errors === 0, summary: errors ? `${errors} flow materiality blocker(s)` : "dynamic flow has material divergence, convergence and credits", inconclusive: false, violations }));
process.exitCode = errors === 0 ? 0 : 1;
