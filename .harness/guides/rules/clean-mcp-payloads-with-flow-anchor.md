# Clean MCP payloads with flow anchors

Use this guide when `$ancora-fluxo`, meeting notes or visible cooperators are
active while MCP tools are being called.

## Rule

Keep conversational flow text out of technical MCP payloads.

`$ancora-fluxo` can stay active in chat. It should not be copied into:

- `judge_review.target`;
- `judge_record.result`;
- `session_append.event.args` unless it is explicitly the artifact being tested;
- sensor command strings;
- contract specs or tasks unless the flow text is the product requirement.

## Good split

Chat update:

```md
Fernanda do Fluxo: next: run build and visual QA.
```

MCP payload:

```json
{
  "kind": "tool_call",
  "tool": "npm --prefix app run build",
  "args": {
    "cwd": "C:\\CodexProjetos\\PremierAgenda",
    "result": "passed"
  }
}
```

## Why

Flow anchors help humans coordinate the work. MCP payloads are evidence for
tools, judges and future steering. Mixing them makes judges review ceremony
instead of code, hides real targets, and can turn a clean audit trail into a
chat transcript.

## Exception

If the task is to evaluate the flow protocol itself, include only the smallest
flow excerpt needed and label it as the target artifact.
