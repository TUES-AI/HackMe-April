import json
import os
import sqlite3
from pathlib import Path
from typing import Any


ROOT_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = ROOT_DIR / "data" / "hackme_portal.sqlite3"


SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_verified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_codes (
    email TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_tokens (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_used_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_user_id INTEGER NOT NULL UNIQUE,
    team_name TEXT NOT NULL UNIQUE,
    github_url TEXT NOT NULL,
    selected_tracks TEXT NOT NULL,
    player_count INTEGER NOT NULL,
    players TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
);
"""


def get_db_path() -> Path:
    raw = os.environ.get("HACKME_DB_PATH")
    return Path(raw).expanduser() if raw else DEFAULT_DB_PATH


def init_db() -> None:
    db_path = get_db_path()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.executescript(SCHEMA)
    conn.commit()
    conn.close()


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def row_to_dict(row: sqlite3.Row | None) -> dict[str, Any] | None:
    return dict(row) if row else None


def utc_timestamp() -> str:
    from .auth import utcnow

    return utcnow().isoformat()


def upsert_verification_code(email: str, code: str, expires_at: str) -> None:
    now = utc_timestamp()
    conn = connect()
    conn.execute(
        """
        INSERT INTO verification_codes (email, code, expires_at, created_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET code=excluded.code, expires_at=excluded.expires_at, created_at=excluded.created_at
        """,
        (email, code, expires_at, now),
    )
    conn.commit()
    conn.close()


def get_verification_code(email: str) -> dict[str, Any] | None:
    conn = connect()
    row = conn.execute("SELECT * FROM verification_codes WHERE email = ?", (email,)).fetchone()
    conn.close()
    return row_to_dict(row)


def delete_verification_code(email: str) -> None:
    conn = connect()
    conn.execute("DELETE FROM verification_codes WHERE email = ?", (email,))
    conn.commit()
    conn.close()


def get_user_by_email(email: str) -> dict[str, Any] | None:
    conn = connect()
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    return row_to_dict(row)


def get_user_by_token(token: str) -> dict[str, Any] | None:
    conn = connect()
    row = conn.execute(
        """
        SELECT users.*, auth_tokens.token AS auth_token, auth_tokens.expires_at AS token_expires_at
        FROM auth_tokens
        JOIN users ON users.id = auth_tokens.user_id
        WHERE auth_tokens.token = ?
        """,
        (token,),
    ).fetchone()
    conn.close()
    return row_to_dict(row)


def create_or_update_user(email: str, password_hash: str) -> dict[str, Any]:
    now = utc_timestamp()
    conn = connect()
    conn.execute(
        """
        INSERT INTO users (email, password_hash, is_verified, created_at, updated_at)
        VALUES (?, ?, 1, ?, ?)
        ON CONFLICT(email) DO UPDATE SET password_hash=excluded.password_hash, is_verified=1, updated_at=excluded.updated_at
        """,
        (email, password_hash, now, now),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    return row_to_dict(row) or {}


def create_auth_token(user_id: int, token: str, expires_at: str) -> None:
    now = utc_timestamp()
    conn = connect()
    conn.execute(
        "INSERT INTO auth_tokens (token, user_id, expires_at, created_at, last_used_at) VALUES (?, ?, ?, ?, ?)",
        (token, user_id, expires_at, now, now),
    )
    conn.commit()
    conn.close()


def touch_auth_token(token: str) -> None:
    conn = connect()
    conn.execute("UPDATE auth_tokens SET last_used_at = ? WHERE token = ?", (utc_timestamp(), token))
    conn.commit()
    conn.close()


def delete_auth_token(token: str) -> None:
    conn = connect()
    conn.execute("DELETE FROM auth_tokens WHERE token = ?", (token,))
    conn.commit()
    conn.close()


def delete_expired_auth_tokens(now_iso: str) -> None:
    conn = connect()
    conn.execute("DELETE FROM auth_tokens WHERE expires_at <= ?", (now_iso,))
    conn.commit()
    conn.close()


def serialize_team(row: sqlite3.Row | None) -> dict[str, Any] | None:
    data = row_to_dict(row)
    if not data:
        return None
    data["selected_tracks"] = json.loads(data.get("selected_tracks") or "[]")
    data["players"] = json.loads(data.get("players") or "[]")
    return data


def get_team_by_owner(owner_user_id: int) -> dict[str, Any] | None:
    conn = connect()
    row = conn.execute("SELECT * FROM teams WHERE owner_user_id = ?", (owner_user_id,)).fetchone()
    conn.close()
    return serialize_team(row)


def create_team(owner_user_id: int, team_name: str, github_url: str, selected_tracks: list[str], player_count: int, players: list[str]) -> dict[str, Any]:
    now = utc_timestamp()
    conn = connect()
    conn.execute(
        """
        INSERT INTO teams (owner_user_id, team_name, github_url, selected_tracks, player_count, players, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (owner_user_id, team_name, github_url, json.dumps(selected_tracks), player_count, json.dumps(players), now, now),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM teams WHERE owner_user_id = ?", (owner_user_id,)).fetchone()
    conn.close()
    return serialize_team(row) or {}


def update_team(owner_user_id: int, github_url: str, selected_tracks: list[str]) -> dict[str, Any] | None:
    conn = connect()
    conn.execute(
        "UPDATE teams SET github_url = ?, selected_tracks = ?, updated_at = ? WHERE owner_user_id = ?",
        (github_url, json.dumps(selected_tracks), utc_timestamp(), owner_user_id),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM teams WHERE owner_user_id = ?", (owner_user_id,)).fetchone()
    conn.close()
    return serialize_team(row)
