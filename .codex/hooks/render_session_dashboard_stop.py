#!/usr/bin/env python3
"""Stop hook template for the local session dashboard.

Codex hooks must print valid JSON on stdout. The dashboard renderer may print
its output path, so this wrapper suppresses renderer output and prints only the
hook JSON envelope.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
import subprocess
import sys


def read_stdin_json() -> dict:
    try:
        raw = sys.stdin.read().strip()
        return json.loads(raw) if raw else {}
    except Exception:
        return {}


def discover_project_root(payload: dict) -> Path:
    env_root = os.environ.get("HARNESS_PROJECT_ROOT")
    if env_root:
        return Path(env_root).expanduser().resolve()

    cwd = payload.get("cwd")
    if isinstance(cwd, str) and cwd.strip():
        return Path(cwd).expanduser().resolve()

    here = Path(__file__).resolve()
    parts = {part.lower() for part in here.parts}
    if ".codex" in parts and "hooks" in parts:
        return here.parents[2]

    return Path.cwd().resolve()


def main() -> int:
    payload = read_stdin_json()
    project_root = discover_project_root(payload)
    harness_root = Path(os.environ.get("HARNESS_ROOT") or project_root / ".harness").resolve()
    script = harness_root / ".local" / "session-dashboard.ps1"

    try:
        if script.exists():
            subprocess.run(
                [
                    "powershell",
                    "-NoProfile",
                    "-ExecutionPolicy",
                    "Bypass",
                    "-File",
                    str(script),
                ],
                cwd=str(project_root),
                check=False,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
    except Exception:
        # Optional observability should never block Codex.
        pass

    print(json.dumps({"continue": True}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
