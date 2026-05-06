const fs = require('fs');
const path = require('path');

const tool = 'judge-package-completeness';
const regulation = 'maintainability';
const target = process.env.TARGET || process.argv[2] || '.harness/judges';
const violations = [];

function frontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const out = {};
  if (!match) return out;

  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (item) out[item[1]] = item[2].replace(/^['"]|['"]$/g, '');
  }

  return out;
}

function addViolation(severity, what, why, remediation, filesAffected) {
  violations.push({
    severity,
    what,
    why,
    remediation,
    filesAffected,
    linesAffected: [],
  });
}

if (!fs.existsSync(target)) {
  addViolation(
    'error',
    'Judges directory missing',
    'Cannot validate judge packages.',
    `Create ${target} or pass TARGET.`,
    [target],
  );
} else {
  for (const file of fs.readdirSync(target).filter((name) => name.endsWith('.md')).sort()) {
    const base = file.slice(0, -3);
    const mdPath = path.join(target, file);
    const schemaPath = path.join(target, `${base}.schema.json`);
    const text = fs.readFileSync(mdPath, 'utf8');
    const meta = frontmatter(text);

    if (!fs.existsSync(schemaPath)) {
      addViolation(
        'error',
        `Missing schema for ${base}`,
        'Judge package must include .md and .schema.json.',
        `Create ${base}.schema.json with tool/regulation consts.`,
        [mdPath],
      );
      continue;
    }

    let schema;
    try {
      schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    } catch (error) {
      addViolation(
        'error',
        `Invalid schema JSON for ${base}`,
        error.message,
        'Fix JSON syntax before using this judge.',
        [schemaPath],
      );
      continue;
    }

    const toolConst = schema.properties && schema.properties.tool && schema.properties.tool.const;
    const regulationConst =
      schema.properties && schema.properties.regulation && schema.properties.regulation.const;

    if (meta.id !== toolConst) {
      addViolation(
        'error',
        `Judge id does not match schema tool const for ${base}`,
        'judge_review/judge_record need stable rubric identity.',
        'Make markdown id equal schema properties.tool.const.',
        [mdPath, schemaPath],
      );
    }

    if (meta.regulation !== regulationConst) {
      addViolation(
        'error',
        `Judge regulation does not match schema regulation const for ${base}`,
        'Regulation routing becomes ambiguous.',
        'Make markdown regulation equal schema properties.regulation.const.',
        [mdPath, schemaPath],
      );
    }

    if (!text.includes('<<<SCHEMA>>>')) {
      addViolation(
        'warning',
        `Judge prompt lacks schema placeholder for ${base}`,
        'Structured output may not be injected into the review prompt.',
        'Add the schema placeholder under the output schema section or document why this judge is unstructured.',
        [mdPath],
      );
    }
  }
}

console.log(
  JSON.stringify({
    tool,
    regulation,
    passed: violations.filter((violation) => violation.severity === 'error').length === 0,
    summary: violations.length ? `${violations.length} issue(s)` : 'judge packages complete',
    inconclusive: false,
    violations,
  }),
);
