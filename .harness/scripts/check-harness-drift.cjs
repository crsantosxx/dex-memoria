const fs = require("fs");
const path = require("path");

const tool = "harness-drift-guard";
const regulation = "maintainability";
const target = process.env.TARGET || process.argv[2] || process.cwd();
const violations = [];

function exists(p) {
  return fs.existsSync(p);
}

function walk(dir, predicate, out = []) {
  if (!exists(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, predicate, out);
    else if (predicate(full)) out.push(full);
  }
  return out;
}

function candidateDirs(...dirs) {
  return dirs.filter((dir, index, list) => dir && list.indexOf(dir) === index && exists(dir));
}

function parseTaskYaml(file) {
  const text = fs.readFileSync(file, "utf8");
  if (/^\s*tasks:\s*$/m.test(text)) {
    const tasks = [];
    const taskBlocks = text.split(/\r?\n(?=\s*-\s+id:\s*)/);
    for (const block of taskBlocks) {
      const id = scalarValue(block, "id");
      if (!id) continue;
      tasks.push({
        id,
        status: scalarValue(block, "status"),
        evidence: evidenceItems(block),
        text,
        file,
      });
    }
    return tasks;
  }

  return [{
    id: scalarValue(text, "id") || path.basename(file, ".yaml"),
    status: scalarValue(text, "status"),
    evidence: evidenceItems(text),
    text,
    file,
  }];
}

function scalarValue(text, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`^\\s*-?\\s*${escaped}:\\s*([^\\r\\n#]+)`, "m"));
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
}

function evidenceItems(text) {
  const evidenceLine = text.match(/^(\s*)evidence:\s*(\[\])?\s*$/m);
  if (!evidenceLine || evidenceLine[2]) return [];
  const indent = evidenceLine[1].length;
  const rest = text.slice(evidenceLine.index + evidenceLine[0].length).split(/\r?\n/);
  return rest.filter((line) => {
    const currentIndent = line.match(/^\s*/)[0].length;
    return currentIndent > indent && /^\s*-\s+/.test(line);
  });
}

function readJsonl(file) {
  if (!exists(file)) return [];
  return fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line)];
      } catch {
        return [];
      }
    });
}

const taskDirs = candidateDirs(
  process.env.TASKS_DIR,
  path.join(target, ".harness", "contracts", "tasks"),
  path.join(target, "contracts", "tasks"),
  target.endsWith(`${path.sep}tasks`) ? target : "",
);
const sessionFiles = process.env.SESSION_FILE
  ? process.env.SESSION_FILE.split(path.delimiter)
  : candidateDirs(
      path.join(target, ".harness", ".local", "sessions"),
      path.join(target, "sessions"),
    ).flatMap((dir) => walk(dir, (file) => file.endsWith(".jsonl")));
const steeringFiles = process.env.STEERING_FILE
  ? process.env.STEERING_FILE.split(path.delimiter)
  : [
      path.join(target, ".harness", ".local", "steering", "log.jsonl"),
      path.join(target, "steering", "log.jsonl"),
    ].filter(exists);

const tasks = new Map();
for (const dir of taskDirs) {
  for (const file of walk(dir, (name) => name.endsWith(".yaml") || name.endsWith(".yml"))) {
    for (const task of parseTaskYaml(file)) {
      tasks.set(task.id, task);
    }
  }
}

const completedInSession = new Set();
for (const file of sessionFiles) {
  for (const event of readJsonl(file)) {
    if (event.kind === "task_completed" && event.task_id) {
      completedInSession.add(event.task_id);
    }
  }
}

for (const taskId of completedInSession) {
  const task = tasks.get(taskId);
  if (!task) {
    violations.push({ severity: "warning", what: `Session completed unknown task ${taskId}`, why: "The session lifecycle and contract task store are not aligned.", remediation: "Create the task YAML or correct the session event.", filesAffected: sessionFiles, linesAffected: [] });
  } else if (task.status !== "completed") {
    violations.push({ severity: "error", what: `Session completed ${taskId} but task YAML is ${task.status || "missing status"}`, why: "A dashboard/session can look complete while the contract task remains pending.", remediation: "Complete the contract task with evidence or correct the session event.", filesAffected: [task.file, ...sessionFiles], linesAffected: [] });
  }
}

for (const task of tasks.values()) {
  if (task.status === "completed" && task.evidence.length === 0) {
    violations.push({ severity: "warning", what: `Completed task ${task.id} has no evidence`, why: "Completion without evidence is hard to audit and can hide stale artifacts.", remediation: "Attach concrete evidence to the task completion.", filesAffected: [task.file], linesAffected: [] });
  }
  for (const rel of evidencePathTokens(task.text)) {
    const full = path.isAbsolute(rel) ? rel : path.join(target, rel);
    if (!exists(full)) {
      violations.push({ severity: "warning", what: `Evidence path missing for ${task.id}: ${rel}`, why: "The task references an artifact that is not present under the target.", remediation: "Fix the evidence path or regenerate the artifact.", filesAffected: [task.file], linesAffected: [] });
    }
  }
}

for (const file of steeringFiles) {
  for (const event of readJsonl(file)) {
    const eventTarget = typeof event.target === "string" ? event.target : "";
    if (!eventTarget || /^[a-z]+:\/\//i.test(eventTarget)) continue;
    if (eventTarget.includes("*") || eventTarget.includes("{")) continue;
    const full = path.isAbsolute(eventTarget) ? eventTarget : path.join(target, eventTarget);
    if (!exists(full)) {
      violations.push({ severity: "warning", what: `Steering event target is missing: ${eventTarget}`, why: "Sensor/judge history may point at stale evidence.", remediation: "Re-run the gate against current evidence or correct the target.", filesAffected: [file], linesAffected: [] });
    }
  }
}

if (taskDirs.length === 0 && sessionFiles.length === 0 && steeringFiles.length === 0) {
  violations.push({ severity: "error", what: "No harness lifecycle artifacts found", why: "Cannot compare tasks, sessions, steering, or evidence.", remediation: "Run with TARGET at a harness project root or pass TASKS_DIR/SESSION_FILE/STEERING_FILE.", filesAffected: [target], linesAffected: [] });
}

function evidencePathTokens(text) {
  const tokens = new Set();
  const pattern = /(?:^|[\s"'])(\.harness\/[^\s"']+|output\/[^\s"']+|artifacts\/[^\s"']+)/g;
  let match;
  while ((match = pattern.exec(text.replaceAll("\\", "/"))) !== null) {
    tokens.add(match[1].replace(/[),.;:]+$/, ""));
  }
  return [...tokens];
}

const errors = violations.filter((v) => v.severity === "error").length;
console.log(JSON.stringify({ tool, regulation, passed: errors === 0, summary: violations.length ? `${violations.length} drift issue(s)` : "harness lifecycle artifacts are coherent", inconclusive: false, violations }));
