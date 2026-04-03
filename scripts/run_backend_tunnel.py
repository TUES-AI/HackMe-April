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


def git_publish(message: str) -> None:
    subprocess.run(["git", "add", ".link"], cwd=ROOT_DIR, check=True)
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
