# Session JSONL and evidence logging

Use this guide when a session file looks strange in an editor or when a run
needs a trustworthy audit trail.

## Rule

Session files are append-only JSONL, not JSON arrays.

The first line is a `SessionHeader`. Every following line is one `SessionEvent`.
Do not add commas, brackets or manual edits.

## Human reading model

Example:

```jsonl
{"session_id":"...","workflow":"PREVC","startedAt":"..."}
{"timestamp":"...","kind":"task_started","task_id":"login-slice"}
{"timestamp":"...","kind":"tool_call","tool":"npm run build","args":{"cwd":"app","result":"passed"}}
{"timestamp":"...","kind":"decision","what":"keep slice small","rationale":"login needs auth proof before role work"}
```

Line 1 says "what run is this?". Later lines say "what happened, in order?".

## What to log

Use `session_append` with `kind: "tool_call"` for commands the agent actually
ran, especially:

- build;
- lint;
- typecheck;
- visual QA;
- smoke MCP;
- `judge_review` / `judge_record` orchestration.

Use specific event kinds when available:

- `sensor_run` for normalized sensor outputs;
- `judge_review` for final judge verdict summaries;
- `decision` for choices and rationale;
- `human_intervention` when the human changes scope or confirms a risk.

## Evidence rule

A final answer should not claim a command passed unless either the command was
run in the current context or the session contains a matching `tool_call` event
with enough args/result to identify it.
