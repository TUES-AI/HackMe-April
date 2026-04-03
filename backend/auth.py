import random
import re
import secrets
from datetime import datetime, timedelta, timezone

from werkzeug.security import check_password_hash, generate_password_hash

ELSYS_EMAIL_REGEX = re.compile(
    r"^[A-Za-z]+(?:-[A-Za-z]+)*\.[A-Za-z]\.[A-Za-z]+(?:-[A-Za-z]+)*\.(201[5-9]|202[0-9]|2030)@elsys-bg\.org$"
)
ALLOWED_NON_ELSYS = {
    "ivan.iliev2103@gmail.com",
    "yoan.hristov7821@gmail.com",
}

TRACK_OPTIONS = [
    {"key": "crypto", "label": "Cipher Hunters"},
    {"key": "autograd", "label": "AutoGrad Scientist"},
    {"key": "game", "label": "Learning Enemy"},
    {"key": "toolsmith", "label": "Scratch for ML"},
]
TRACK_KEYS = {item["key"] for item in TRACK_OPTIONS}
VERIFICATION_WINDOW_SECONDS = 300
TOKEN_WINDOW_DAYS = 30


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def is_allowed_student_email(email: str) -> bool:
    normalized = normalize_email(email)
    return normalized in ALLOWED_NON_ELSYS or bool(ELSYS_EMAIL_REGEX.match(normalized))


def generate_code() -> str:
    return f"{random.randint(1000, 9999)}"


def code_expiry_iso() -> str:
    return (utcnow() + timedelta(seconds=VERIFICATION_WINDOW_SECONDS)).isoformat()


def token_expiry_iso() -> str:
    return (utcnow() + timedelta(days=TOKEN_WINDOW_DAYS)).isoformat()


def hash_password(password: str) -> str:
    return generate_password_hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return check_password_hash(password_hash, password)


def generate_token() -> str:
    return secrets.token_urlsafe(32)


def validate_track_keys(track_keys: list[str]) -> list[str]:
    cleaned = []
    for key in track_keys:
        normalized = (key or "").strip().lower()
        if normalized and normalized in TRACK_KEYS and normalized not in cleaned:
            cleaned.append(normalized)
    return cleaned
