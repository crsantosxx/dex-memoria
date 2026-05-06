const fs = require("fs");
const path = require("path");

const tool = "adaptive-self-evolution-loop";
const regulation = "maintainability";
const target = process.env.TARGET || process.argv[2] || "";
const violations = [];

function add(severity, what, why, remediation, file) {
  violations.push({ severity, what, why, remediation, filesAffected: file ? [file] : [], linesAffected: [] });
}

function readIfExists(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

if (!target) {
  add("error", "Missing adaptive loop target", "The adaptive loop must inspect the active round.", "Run with TARGET or argv[2] pointing at the current audit folder.", ".harness/scripts/check-adaptive-self-evolution-loop.cjs");
} else if (!fs.existsSync(target)) {
  add("error", "Adaptive loop target missing", "Cannot inspect absent self-evolution evidence.", "Pass an existing audit folder.", target);
} else {
  const root = path.resolve(target);
  const files = [
    path.join(root, "07-loop-control", "loop-control.yaml"),
    path.join(root, "08-learning", "parking-mining.yaml"),
    path.join(root, "09-meeting-contract", "two-chamber-meeting.yaml"),
    path.join(root, "10-self-evolution", "adaptive-loop.yaml")
  ];
  const texts = files.map((file) => ({ file, text: readIfExists(file) }));
  for (const item of texts) {
    if (!item.text) add("error", `Missing ${path.basename(item.file)}`, "Adaptive evolution needs loop, learning, meeting and selection artifacts.", "Create the required artifact before advancing the round.", item.file);
  }

  const adaptive = texts.find((item) => item.file.endsWith(path.join("10-self-evolution", "adaptive-loop.yaml"))).text;
  const requiredFields = [
    "observed_failure:",
    "divergence_source:",
    "convergence_decision:",
    "changed_surface:",
    "validation_evidence:",
    "selection_result:",
    "removed_or_parked:",
    "next_experiment:"
  ];
  for (const field of requiredFields) {
    if (!adaptive.toLowerCase().includes(field)) add("error", `Missing ${field}`, "The adaptive loop must be typed so it can become future rule/sensor/judge pressure.", "Add the required field to 10-self-evolution/adaptive-loop.yaml.", target);
  }
  if (!/(sensor|judge|rule|guide|task|flow_gate|contract|stop_rule)/i.test(adaptive)) {
    add("error", "No changed harness surface", "Self-evolution must change a future control surface, not only summarize the session.", "Name the rule, sensor, judge, guide, task, contract or stop_rule changed.", target);
  }
  if (!/(passed|passes|mcp|sensor_run|judge_review|manifest|report)/i.test(adaptive)) {
    add("error", "No validation evidence", "Adaptive changes must survive executable pressure before being kept.", "Record concrete MCP sensor/judge/artifact evidence.", target);
  }
  if (!/(park|remove|removed|discard|continue|kept|survive|selection)/i.test(adaptive)) {
    add("error", "No selection pressure", "The loop must state what continues and what is parked or removed.", "Add selection_result and removed_or_parked with real decisions.", target);
  }
}

const errors = violations.filter((violation) => violation.severity === "error").length;
console.log(JSON.stringify({
  tool,
  regulation,
  passed: errors === 0,
  summary: errors ? `${errors} adaptive self-evolution blocker(s)` : "adaptive self-evolution loop is present",
  inconclusive: false,
  violations
}));
process.exitCode = errors === 0 ? 0 : 1;
