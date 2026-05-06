# Verification Before MVP Claim

Do not call the MVP ready from reading alone. Run the local proof first.

Required checks:

- `npm run typecheck`
- `npm test`
- `npm run test:integration`
- `npm run build`
- `npm run smoke:mcp`

The smoke must start `node dist/bin.js` and verify:

- server name is `dex-harness`
- tools are at least 13
- resources are at least 3
- prompts are at least 2

If any command is skipped, the status is partial, not ready.
