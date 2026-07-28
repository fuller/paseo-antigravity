#!/usr/bin/env python3
"""
agy-bridge.py - Lightweight, zero-dependency bridge between Paseo and Google Antigravity (agy).
Handles flag normalization, execution mode translation (Plan, Auto, Bypass, Accept Edits),
background auto-syncing of newly released Gemini models, and stdio streaming.
"""

import sys
import os
import signal
import subprocess
import json
import time
import threading
from pathlib import Path

# Unbuffer stdout/stderr to ensure real-time streaming to Paseo
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)
    sys.stderr.reconfigure(line_buffering=True)

# Graceful signal handling for early termination/cancellation
def handle_signal(sig, frame):
    sys.exit(0)

signal.signal(signal.SIGINT, handle_signal)
signal.signal(signal.SIGTERM, handle_signal)
if hasattr(signal, "SIGPIPE"):
    signal.signal(signal.SIGPIPE, signal.SIG_DFL)


def resolve_agy_bin():
    if "AGY_BIN" in os.environ and os.path.exists(os.environ["AGY_BIN"]):
        return os.environ["AGY_BIN"]
    
    candidates = [
        "/opt/homebrew/bin/agy",
        "/usr/local/bin/agy",
        os.path.expanduser("~/.local/bin/agy"),
        os.path.expanduser("~/.gemini/antigravity-cli/bin/agy")
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return "agy"


def auto_sync_models_async(agy_bin):
    def sync():
        try:
            config_path = Path.home() / ".paseo" / "config.json"
            if not config_path.exists():
                return
            
            with open(config_path, "r", encoding="utf-8") as f:
                config = json.load(f)
            
            provider = config.get("agents", {}).get("providers", {}).get("antigravity", {})
            last_sync = provider.get("_last_model_sync", 0)
            now = int(time.time())
            
            # Auto-sync at most once every 24 hours
            if now - last_sync < 86400:
                return
            
            res = subprocess.run([agy_bin, "models"], capture_output=True, text=True, timeout=10)
            if res.returncode != 0:
                return
            
            lines = [l.strip() for l in res.stdout.splitlines() if l.strip()]
            models = []
            for line in lines:
                is_default = line.startswith("*")
                model_id = line.lstrip("*").strip()
                models.append({
                    "id": model_id,
                    "label": model_id,
                    "isDefault": is_default
                })
            
            if models:
                provider["models"] = models
                provider["_last_model_sync"] = now
                with open(config_path, "w", encoding="utf-8") as f:
                    json.dump(config, f, indent=2)
        except Exception:
            pass

    t = threading.Thread(target=sync, daemon=True)
    t.start()


def normalize_args(raw_args):
    filtered_args = []
    i = 0
    has_output_format = False

    while i < len(raw_args):
        arg = raw_args[i]
        
        # Strip verbose flag
        if arg in ["-verbose", "--verbose"]:
            i += 1
            continue
        
        # Strip input-format flag
        if arg in ["-input-format", "--input-format"]:
            i += 2
            continue
        if arg.startswith("-input-format=") or arg.startswith("--input-format="):
            i += 1
            continue
        
        # Translate Paseo permission-mode flags to native agy flags
        if arg in ["--permission-mode", "-permission-mode"]:
            if i + 1 < len(raw_args):
                val = raw_args[i+1].lower()
                if val == "bypass":
                    filtered_args.append("--dangerously-skip-permissions")
                elif val in ["plan", "accept-edits"]:
                    filtered_args.extend(["--mode", val])
                elif val in ["auto"]:
                    filtered_args.extend(["--mode", "accept-edits"])
                i += 2
                continue
            i += 1
            continue
        
        if arg.startswith("--permission-mode=") or arg.startswith("-permission-mode="):
            val = arg.split("=", 1)[1].lower()
            if val == "bypass":
                filtered_args.append("--dangerously-skip-permissions")
            elif val in ["plan", "accept-edits"]:
                filtered_args.extend(["--mode", val])
            elif val in ["auto"]:
                filtered_args.extend(["--mode", "accept-edits"])
            i += 1
            continue

        # Track output-format flag
        if arg in ["--output-format", "-o"]:
            has_output_format = True
            filtered_args.append(arg)
            if i + 1 < len(raw_args):
                filtered_args.append(raw_args[i+1])
                i += 2
                continue
            i += 1
            continue
        if arg.startswith("--output-format="):
            has_output_format = True
            filtered_args.append(arg)
            i += 1
            continue

        filtered_args.append(arg)
        i += 1

    return filtered_args, has_output_format


def main():
    agy_bin = resolve_agy_bin()
    auto_sync_models_async(agy_bin)

    raw_args = sys.argv[1:]
    filtered_args, has_output_format = normalize_args(raw_args)

    cmd = [agy_bin]
    if not has_output_format:
        cmd.extend(["--output-format", "stream-json"])

    cmd.extend(filtered_args)

    # POSIX process replacement for maximum performance and zero memory overhead
    if sys.platform != "win32":
        try:
            os.execv(cmd[0], cmd)
        except OSError:
            pass

    # Windows fallback
    proc = subprocess.run(cmd)
    sys.exit(proc.returncode)


if __name__ == "__main__":
    main()
