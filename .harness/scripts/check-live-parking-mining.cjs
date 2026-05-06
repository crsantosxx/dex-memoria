const fs = require("fs");
const path = require("path");

const tool = "live-parking-and-mining";
const regulation = "maintainability";
const target = process.env.TARGET || process.argv[2] || "";
const violations = [];

function add(severity, what, why, remediation, file) {
  violations.push({ severity, what, why, remediation, filesAffected: file ? [file] : [], linesAffected: [] });
}

function findArtifacts(root) {
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/(parking|garimpo|mining|learning|evolution).*\.(md|yaml|yml|json)$/i.test(entry.name)) files.push(full);
    }
  }
  if (fs.existsSync(root)) {
    const stat = fs.statSync(root);
    if (stat.isDirectory()) walk(root);
    else files.push(root);
  }
  return files;
}

function readYamlishValue(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*(.*)$`, "im"));
  return match ? match[1].trim() : "";
}

function countListIds(text, prefix) {
  const re = new RegExp(`id:\\s*${prefix}[-_A-Z0-9]+`, "gi");
  return (text.match(re) || []).length;
}

if (!target) {
  add("error", "Missing parking/mining target", "Learning gates must inspect the active round, not stale defaults.", "Run with TARGET or argv[2] pointing at the current audit folder.", ".harness/scripts/check-live-parking-mining.cjs");
} else if (!fs.existsSync(target)) {
  add("error", "Parking/mining target missing", "Cannot inspect absent learning artifacts.", "Pass an existing audit folder.", target);
} else {
  const files = findArtifacts(path.resolve(target));
  const text = files.map((file) => fs.readFileSync(file, "utf8")).join("\n").toLowerCase();
  const rawText = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  if (files.length === 0) {
    add("error", "No parking/mining artifact found", "A governed round without live learning cannot evolve.", "Create a typed parking/mining artifact for this round.", target);
  }
  for (const field of ["parking_items", "mined_learnings", "selection", "next_experiment"]) {
    if (!text.includes(`${field}:`)) {
      add("error", `Missing ${field}`, "Estacionamento/Garimpeiro must produce structured learning, not only prose.", "Add the field to a round learning artifact.", target);
    }
  }
  if (!/survive|survives|mutate|merge|park|die|dies|morre|fundir|estacionar|sobrevive/i.test(text)) {
    add("error", "No selection language found", "Learning exists but does not declare what survives, mutates, merges, parks or dies.", "Add explicit selection outcome.", target);
  }
  if (countListIds(rawText, "PARK") < 1) {
    add("error", "No typed parking item ids", "Parking needs addressable items, not only prose.", "Add at least one PARK-* id under parking_items.", target);
  }
  if (countListIds(rawText, "MINE") < 1) {
    add("error", "No typed mined learning ids", "Garimpo needs addressable learnings, not only prose.", "Add at least one MINE-* id under mined_learnings.", target);
  }
  for (const token of ["target:", "promote_to:"]) {
    if (!text.includes(token)) {
      add("error", `Missing ${token}`, "Learning must point to a concrete surface or promotion path.", "Add targets for parked items and promote_to for mined learnings.", target);
    }
  }
  const nextExperiment = readYamlishValue(rawText, "next_experiment").toLowerCase();
  if (!/(run|check|gate|sensor|judge|fail|block|compare|validar|rodar|verificar)/i.test(nextExperiment)) {
    add("error", "Next experiment is not operational", "The next experiment must be a testable action, not aspiration.", "Name a concrete gate, sensor, judge or check to run next.", target);
  }
  for (const domain of ["loop", "visual", "gov"]) {
    if (text.includes(`park-${domain}`) && !text.includes(`mine-${domain}`)) {
      add("error", `Missing mined learning for ${domain}`, "Each critical parked domain needs a corresponding learning or selection decision.", "Add a MINE-* item for the parked domain.", target);
    }
  }
}

const errors = violations.filter((violation) => violation.severity === "error").length;
console.log(JSON.stringify({
  tool,
  regulation,
  passed: errors === 0,
  summary: errors ? `${errors} parking/mining blocker(s)` : "live parking and mining artifact is present",
  inconclusive: false,
  violations
}));
process.exitCode = errors === 0 ? 0 : 1;
