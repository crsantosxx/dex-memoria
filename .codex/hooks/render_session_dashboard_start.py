#!/usr/bin/env python3
"""SessionStart hook template for the local session dashboard.

Codex hooks must print valid JSON on stdout. This wrapper starts the dashboard
watcher in the background and prints only the hook JSON envelope.
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


def is_pid_alive(pid: int) -> bool:
    try:
        result = subprocess.run(
            [
                "powershell",
                "-NoProfile",
                "-Command",
                f"$p = Get-CimInstance Win32_Process -Filter 'ProcessId = {pid}' -ErrorAction SilentlyContinue; "
                "if ($p -and $p.CommandLine -like '*watch-session-dashboard.ps1*') { exit 0 } else { exit 1 }",
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
        )
        return result.returncode == 0
    except Exception:
        return False


def main() -> int:
    payload = read_stdin_json()
    project_root = discover_project_root(payload)
    harness_root = Path(os.environ.get("HARNESS_ROOT") or project_root / ".harness").resolve()
    script = harness_root / ".local" / "dashboard" / "watch-session-dashboard.ps1"
    pid_file = harness_root / ".local" / "dashboard" / "session-dashboard-watch.pid"

    try:
        if pid_file.exists():
            try:
                pid = int(pid_file.read_text(encoding="utf-8").strip())
            except Exception:
                pid = 0
            if pid > 0 and is_pid_alive(pid):
                print(json.dumps({"continue": True}, ensure_ascii=False))
                return 0

        if script.exists():
            creationflags = 0
            if hasattr(subprocess, "CREATE_NO_WINDOW"):
                creationflags |= subprocess.CREATE_NO_WINDOW
            if hasattr(subprocess, "CREATE_NEW_PROCESS_GROUP"):
                creationflags |= subprocess.CREATE_NEW_PROCESS_GROUP

            subprocess.Popen(
                [
                    "powershell",
                    "-NoProfile",
                    "-ExecutionPolicy",
                    "Bypass",
                    "-File",
                    str(script),
                    "-HarnessRoot",
                    str(harness_root),
                    "-ProjectName",
                    project_root.name,
                    "-TimeZone",
                    os.environ.get("HARNESS_TIMEZONE", "America/Sao_Paulo"),
                    "-Language",
                    os.environ.get("HARNESS_LANGUAGE", "pt-BR"),
                    "-Locale",
                    os.environ.get("HARNESS_LOCALE", "pt-BR"),
                    "-IntervalSeconds",
                    os.environ.get("HARNESS_DASHBOARD_INTERVAL_SECONDS", "3"),
                    "-PidFile",
                    str(pid_file),
                ],
                cwd=str(project_root),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                stdin=subprocess.DEVNULL,
                creationflags=creationflags,
            )
    except Exception:
        # Optional observability should never block Codex.
        pass

    print(json.dumps({"continue": True}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
