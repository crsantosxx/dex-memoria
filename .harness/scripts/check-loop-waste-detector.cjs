const fs = require("fs");
const path = require("path");

const tool = "loop-waste-detector";
const regulation = "maintainability";
const target = process.env.TARGET || process.argv[2] || "";
const violations = [];

function add(severity, what, why, remediation, file) {
  violations.push({ severity, what, why, remediation, filesAffected: file ? [file] : [], linesAffected: [] });
}

function loopFile(root) {
  if (!fs.existsSync(root)) return "";
  const stat = fs.statSync(root);
  if (stat.isFile()) return root;
  return path.join(root, "07-loop-control", "loop-control.yaml");
}

if (!target) {
  add("error", "Missing loop target", "Loop waste detection needs the active round artifact.", "Run with TARGET or argv[2] pointing at the active audit folder.", ".harness/scripts/check-loop-waste-detector.cjs");
} else {
  const file = loopFile(path.resolve(target));
  if (!file || !fs.existsSync(file)) {
    add("error", "Missing loop-control artifact", "Repeated failures need a typed loop-control artifact before more attempts.", "Create 07-loop-control/loop-control.yaml.", target);
  } else {
    const text = fs.readFileSync(file, "utf8");
    const attemptsBlock = /attempts:\s*([\s\S]*?)(?:\n[a-z_]+:|$)/i.exec(text);
    const attempts = attemptsBlock ? attemptsBlock[1].split(/\n/).filter((line) => /^\s*-\s+/.test(line)) : [];
    if (attempts.length >= 2) {
      for (const field of ["detected_reason:", "strategy_shift:", "stop_rule:", "next_gate:"]) {
        if (!text.toLowerCase().includes(field)) add("error", `Missing ${field}`, "A repeated loop must mutate strategy before another attempt.", "Add the required loop-control field.", file);
      }
      const shift = /strategy_shift:\s*(.+)/i.exec(text);
      if (!shift || shift[1].trim().length < 40) {
        add("error", "Weak strategy_shift", "The shift must name how the tactic, target, evidence, gate or owner changed.", "Replace generic retry language with a concrete strategy shift.", file);
      }
      if (!/(instead|instead of|rather than|mudar|trocar|sem \.git|canonical|target|gate|owner|evidence|artifact|alias|domain|strategy)/i.test(shift ? shift[1] : "")) {
        add("error", "Strategy shift does not show mutation", "The detector needs proof that the next attempt is not the same tactic again.", "Name the changed tactic, target, gate, owner or evidence.", file);
      }
    }
  }
}

const errors = violations.filter((violation) => violation.severity === "error").length;
console.log(JSON.stringify({
  tool,
  regulation,
  passed: errors === 0,
  summary: errors ? `${errors} loop waste blocker(s)` : "loop waste detector found a mutation path",
  inconclusive: false,
  violations
}));
process.exitCode = errors === 0 ? 0 : 1;
