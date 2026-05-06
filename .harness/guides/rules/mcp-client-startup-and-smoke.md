# MCP client startup and smoke

Use this guide when installing `dex-harness` in an external project or when a
client does not expose the MCP tools directly.

## Rule

Prove the MCP server with a real stdio client before treating the setup as
ready.

## Minimal external config

In the target project, point the client at the built server and the target
project harness:

```json
{
  "mcpServers": {
    "dex-harness": {
      "command": "node",
      "args": ["C:\\CodexProjetos\\dex-harness\\dist\\bin.js"],
      "env": {
        "HARNESS_ROOT": "C:\\CodexProjetos\\PremierAgenda\\.harness"
      }
    }
  }
}
```

Use absolute paths while the package is local. Use `dex-harness` or `npx
dex-harness` only after the npm package/install path is the thing being tested.

## Smoke command

From the `dex-harness` repo:

```powershell
npm run build
node scripts/mcp-smoke.mjs --harness-root "C:\CodexProjetos\PremierAgenda\.harness" --cwd "C:\CodexProjetos\PremierAgenda" --include-lists
```

The smoke must confirm:

- server name is `dex-harness`;
- tools are listed;
- resources are listed from the target `.harness/`;
- prompts are listed;
- optional `judge_list` and `sensor_list` calls return without error.

## If Codex does not expose direct tools

Treat that as client discovery friction, not as proof that the MCP server is
broken. Verify with the smoke script or with the MCP SDK over stdio using the
same `command`, `args`, `cwd` and `HARNESS_ROOT`.
