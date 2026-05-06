# No LLM In Judge Server

Judges are rendered by the server and executed by the connected MCP client.

Required behaviour:

- `judge_review` returns instructions, schema, context, and submission metadata.
- `judge_record` validates client-produced output against the rubric schema.
- `contract_spec_validate` returns judge checks as `pending:
  requires_agent_review`.
- The server must not read provider API keys, choose a default model, or call an
  LLM SDK for judge execution.

Evidence before changing this rule:

- A SPEC update.
- An ADR update.
- Tests proving the new boundary.
