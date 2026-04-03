import argparse
import os
import re
import subprocess
import sys
import time
import urllib.request
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent.parent
LINK_PATH = ROOT_DIR / ".link"
TUNNEL_REGEX = re.compile(r"https://[-a-z0-9]+\.trycloudflare\.com")
SAFE_AUTOCOMMIT_PATHS = {".link"}
BLOCKED_PATH_PATTERNS = [
    re.compile(r"(^|/)\.env($|\.)"),
    re.compile(r"(^|/).*\.db$"),
    re.compile(r"(^|/).*\.sqlite3$"),
    re.compile(r"(^|/)data/"),
    re.compile(r"(^|/)__pycache__/"),
    re.compile(r"(^|/).*\.pyc$"),
]


def wait_for_health(url: str, timeout: float = 30.0) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=2) as response:
                if response.status == 200:
                    return
        except Exception:
            time.sleep(0.5)
    raise RuntimeError("Backend did not become healthy in time")


def start_backend(python_bin: str, port: int) -> subprocess.Popen[str]:
    env = dict(**os.environ, HACKME_PORT=str(port))
    return subprocess.Popen(
        [python_bin, "-m", "backend.app"],
        cwd=ROOT_DIR,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )


def start_tunnel(port: int) -> subprocess.Popen[str]:
    return subprocess.Popen(
        ["cloudflared", "tunnel", "--url", f"http://127.0.0.1:{port}"],
        cwd=ROOT_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )


def extract_tunnel_url(process: subprocess.Popen[str], timeout: float = 30.0) -> str:
    deadline = time.time() + timeout
    lines = []
    while time.time() < deadline:
        line = process.stdout.readline() if process.stdout else ""
        if line:
            lines.append(line.rstrip())
            match = TUNNEL_REGEX.search(line)
            if match:
                return match.group(0)
        elif process.poll() is not None:
            break
    joined = "\n".join(lines)
    raise RuntimeError(f"Could not find tunnel URL in cloudflared output:\n{joined}")


def write_link(url: str) -> None:
    LINK_PATH.write_text(f"{url}\n", encoding="utf-8")


def git_lines(*args: str) -> list[str]:
    result = subprocess.run(
        ["git", *args],
        cwd=ROOT_DIR,
        check=True,
        capture_output=True,
        text=True,
    )
    return [line for line in result.stdout.splitlines() if line.strip()]


def has_blocked_path(paths: list[str]) -> str | None:
    for path in paths:
        normalized = path.strip()
        for pattern in BLOCKED_PATH_PATTERNS:
            if pattern.search(normalized):
                return normalized
    return None


def validate_staged_paths(paths: list[str]) -> None:
    blocked = has_blocked_path(paths)
    if blocked:
        raise RuntimeError(f"Refusing to commit blocked path: {blocked}")
    unexpected = [path for path in paths if path not in SAFE_AUTOCOMMIT_PATHS]
    if unexpected:
        joined = ", ".join(unexpected)
        raise RuntimeError(
            "Refusing to auto-commit because files other than .link are staged after git add .: "
            f"{joined}. Commit application/frontend/backend changes manually."
        )


def git_publish(message: str) -> None:
    previously_staged = git_lines("diff", "--cached", "--name-only")
    subprocess.run(["git", "add", "."], cwd=ROOT_DIR, check=True)
    staged_now = git_lines("diff", "--cached", "--name-only")
    try:
        validate_staged_paths(staged_now)
    except Exception:
        subprocess.run(["git", "restore", "--staged", "."], cwd=ROOT_DIR, check=True)
        if previously_staged:
            subprocess.run(["git", "add", "--", *previously_staged], cwd=ROOT_DIR, check=True)
        raise
    if not staged_now:
        raise RuntimeError("Nothing is staged for commit")
    subprocess.run(["git", "commit", "-m", message], cwd=ROOT_DIR, check=True)
    subprocess.run(["git", "push"], cwd=ROOT_DIR, check=True)


def stream_process_output(process: subprocess.Popen[str], prefix: str) -> None:
    if not process.stdout:
        return
    while process.poll() is None:
        line = process.stdout.readline()
        if line:
            print(f"[{prefix}] {line}", end="")
        else:
            time.sleep(0.2)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run Flask backend, expose it through cloudflared, and publish .link")
    parser.add_argument("--python", default=sys.executable, help="Python executable to use for the backend")
    parser.add_argument("--port", default=8787, type=int, help="Local backend port")
    parser.add_argument("--skip-git", action="store_true", help="Do not commit and push the .link file")
    parser.add_argument("--commit-message", default="update backend tunnel link", help="Commit message for .link updates")
    args = parser.parse_args()

    backend = start_backend(args.python, args.port)
    tunnel = None
    try:
        wait_for_health(f"http://127.0.0.1:{args.port}/api/health")
        tunnel = start_tunnel(args.port)
        tunnel_url = extract_tunnel_url(tunnel)
        write_link(tunnel_url)
        print(f"Tunnel URL written to {LINK_PATH}: {tunnel_url}")
        if not args.skip_git:
            git_publish(args.commit_message)
            print("Committed and pushed .link")
        print("Backend and tunnel are running. Press Ctrl+C to stop.")
        stream_process_output(backend, "backend")
    except KeyboardInterrupt:
        print("Stopping backend and tunnel...")
    finally:
        if tunnel and tunnel.poll() is None:
            tunnel.terminate()
        if backend.poll() is None:
            backend.terminate()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
