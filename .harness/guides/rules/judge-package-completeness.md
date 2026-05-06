# Judge Package Completeness

Use this rule whenever a judge rubric is created, edited, copied, or promoted
between a project harness and the main `dex-harness` repository.

## Required package

Every judge is a two-file package:

```text
.harness/judges/<judge-id>.md
.harness/judges/<judge-id>.schema.json
```

The package is incomplete if either file is missing.

## Contract

- The markdown frontmatter `id` must equal the schema `properties.tool.const`.
- The markdown frontmatter `regulation` must equal the schema
  `properties.regulation.const`.
- The schema must parse as JSON.
- The markdown prompt must include `<<<SCHEMA>>>` if it expects structured
  judge output.
- A project-specific judge stays local unless it is reusable across projects.
- A promoted judge must copy both files to the main `dex-harness`
  `.harness/judges/` directory.

## Gate

Run `judge-package-completeness` before declaring a judge ready or promoted.

Do not close the work as complete while the sensor reports:

- missing schema;
- invalid JSON schema;
- `id` different from `tool.const`;
- `regulation` different from `regulation.const`;
- markdown prompt missing the schema placeholder.

## Parking

If a proposed judge is useful but not yet mature, park it as a future judge
candidate instead of creating only a markdown prompt without a schema.

Parked follow-ups from the first contract repair:

- add a generator/template for new judge packages;
- wire `judge-package-completeness` into a broader CI or pre-commit path;
- add MCP-level validation before `judge_register` or future rubric promotion;
- add a migration/audit command that can scan arbitrary project harness roots.

These are not live tasks until a spec explicitly picks them up.
