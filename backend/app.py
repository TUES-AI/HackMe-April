import os
from datetime import datetime
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from flask import Flask, jsonify, request

from . import auth, database
from .emailer import send_email


ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")


def json_error(message: str, status: int = 400):
    return jsonify({"error": message}), status


def user_payload(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": user["id"],
        "email": user["email"],
        "is_verified": bool(user["is_verified"]),
        "created_at": user["created_at"],
    }


def team_payload(team: dict[str, Any] | None) -> dict[str, Any] | None:
    if not team:
        return None
    return {
        "id": team["id"],
        "team_name": team["team_name"],
        "github_url": team["github_url"],
        "selected_tracks": team["selected_tracks"],
        "player_count": team["player_count"],
        "players": team["players"],
        "created_at": team["created_at"],
        "updated_at": team["updated_at"],
    }


def create_app(test_config: dict[str, Any] | None = None) -> Flask:
    app = Flask(__name__)
    app.config.update(
        SEND_EMAIL_FUNC=send_email,
        EXPOSE_DEV_CODE=os.environ.get("HACKME_EXPOSE_DEV_CODE", "false").lower() in ("1", "true", "yes"),
    )
    if test_config:
        app.config.update(test_config)

    if app.config.get("DATABASE_PATH"):
        os.environ["HACKME_DB_PATH"] = str(app.config["DATABASE_PATH"])

    database.init_db()

    @app.after_request
    def apply_cors(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, OPTIONS"
        response.headers["Access-Control-Max-Age"] = "86400"
        return response

    @app.route("/api/<path:_path>", methods=["OPTIONS"])
    def options_handler(_path: str):
        return ("", 204)

    def current_user_from_request() -> tuple[dict[str, Any] | None, str | None]:
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return None, None
        token = header.split(" ", 1)[1].strip()
        if not token:
            return None, None
        database.delete_expired_auth_tokens(auth.utcnow().isoformat())
        user = database.get_user_by_token(token)
        if not user:
            return None, token
        try:
            expires_at = datetime.fromisoformat(user["token_expires_at"])
        except Exception:
            database.delete_auth_token(token)
            return None, token
        if auth.utcnow() >= expires_at:
            database.delete_auth_token(token)
            return None, token
        database.touch_auth_token(token)
        return user, token

    def require_user() -> tuple[dict[str, Any] | None, str | None, Any | None]:
        user, token = current_user_from_request()
        if not user:
            return None, token, json_error("Authentication required", 401)
        return user, token, None

    def validate_github_url(value: str) -> str:
        github_url = (value or "").strip()
        if not github_url:
            raise ValueError("Team GitHub link is required")
        if "github.com" not in github_url:
            raise ValueError("Team GitHub link must point to GitHub")
        return github_url

    def validate_team_payload(payload: dict[str, Any], current_email: str, creation: bool) -> tuple[str | None, str, list[str], int | None, list[str] | None]:
        team_name = (payload.get("team_name") or "").strip()
        github_url = validate_github_url(payload.get("github_url") or "")
        selected_tracks = auth.validate_track_keys(payload.get("selected_tracks") or [])
        if not selected_tracks:
            raise ValueError("Choose at least one track")
        if not creation:
            return None, github_url, selected_tracks, None, None

        if len(team_name) < 2:
            raise ValueError("Team name must be at least 2 characters")
        try:
            player_count = int(payload.get("player_count") or 0)
        except Exception as exc:
            raise ValueError("Number of players must be between 1 and 4") from exc
        if player_count < 1 or player_count > 4:
            raise ValueError("Number of players must be between 1 and 4")

        raw_players = payload.get("players") or []
        cleaned_players = []
        for item in raw_players:
            email = auth.normalize_email(item)
            if email and email not in cleaned_players:
                cleaned_players.append(email)
        if not cleaned_players:
            cleaned_players = [current_email]
        if current_email not in cleaned_players:
            cleaned_players.insert(0, current_email)
        if cleaned_players[0] != current_email:
            cleaned_players = [current_email, *[email for email in cleaned_players if email != current_email]]
        cleaned_players = cleaned_players[:player_count]
        if len(cleaned_players) != player_count:
            raise ValueError("Fill a valid student email for each player slot")
        if len(set(cleaned_players)) != len(cleaned_players):
            raise ValueError("Player emails must be unique")
        for email in cleaned_players:
            if not auth.is_allowed_student_email(email):
                raise ValueError(f"Invalid TUES student email: {email}")
        return team_name, github_url, selected_tracks, player_count, cleaned_players

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"ok": True, "email_configured": bool(os.environ.get("TEACHER_EMAIL") and os.environ.get("TEACHER_PASSWORD"))})

    @app.route("/api/meta/tracks", methods=["GET"])
    def tracks():
        return jsonify({"tracks": auth.TRACK_OPTIONS})

    @app.route("/api/auth/send-code", methods=["POST"])
    def send_code():
        payload = request.get_json(force=True, silent=True) or {}
        email = auth.normalize_email(payload.get("email") or "")
        if not auth.is_allowed_student_email(email):
            return json_error("Use a valid TUES student email", 400)
        code = auth.generate_code()
        expires_at = auth.code_expiry_iso()
        database.upsert_verification_code(email, code, expires_at)
        app.config["SEND_EMAIL_FUNC"](
            to_email=email,
            subject="HackMe April verification code",
            body=f"Your HackMe April code is {code}. It expires in 5 minutes.",
        )
        response = {"ok": True, "expires_at": expires_at}
        if app.config.get("EXPOSE_DEV_CODE"):
            response["code"] = code
        return jsonify(response)

    @app.route("/api/auth/verify-code", methods=["POST"])
    def verify_code():
        payload = request.get_json(force=True, silent=True) or {}
        email = auth.normalize_email(payload.get("email") or "")
        code = (payload.get("code") or "").strip()
        password = (payload.get("password") or "").strip()

        if not auth.is_allowed_student_email(email):
            return json_error("Use a valid TUES student email", 400)
        if len(password) < 4:
            return json_error("Password must be at least 4 characters", 400)
        record = database.get_verification_code(email)
        if not record:
            return json_error("No verification request found for this email", 404)
        if code != record["code"]:
            return json_error("Invalid confirmation code", 400)
        if auth.utcnow() >= datetime.fromisoformat(record["expires_at"]):
            database.delete_verification_code(email)
            return json_error("Confirmation code expired", 400)

        user = database.create_or_update_user(email, auth.hash_password(password))
        database.delete_verification_code(email)
        token = auth.generate_token()
        database.create_auth_token(user["id"], token, auth.token_expiry_iso())
        return jsonify({"ok": True, "token": token, "user": user_payload(user)})

    @app.route("/api/auth/login", methods=["POST"])
    def login():
        payload = request.get_json(force=True, silent=True) or {}
        email = auth.normalize_email(payload.get("email") or "")
        password = (payload.get("password") or "").strip()

        if not auth.is_allowed_student_email(email):
            return json_error("Use a valid TUES student email", 400)
        if not password:
            return json_error("Password is required", 400)
        user = database.get_user_by_email(email)
        if not user or not bool(user["is_verified"]) or not auth.verify_password(password, user["password_hash"]):
            return json_error("Invalid email or password", 401)
        token = auth.generate_token()
        database.create_auth_token(user["id"], token, auth.token_expiry_iso())
        return jsonify({"ok": True, "token": token, "user": user_payload(user)})

    @app.route("/api/auth/logout", methods=["POST"])
    def logout():
        _, token = current_user_from_request()
        if token:
            database.delete_auth_token(token)
        return jsonify({"ok": True})

    @app.route("/api/auth/me", methods=["GET"])
    def me():
        user, _, error = require_user()
        if error:
            return error
        assert user is not None
        team = database.get_team_by_owner(user["id"])
        return jsonify({"user": user_payload(user), "team": team_payload(team)})

    @app.route("/api/team", methods=["GET"])
    def team_get():
        user, _, error = require_user()
        if error:
            return error
        assert user is not None
        team = database.get_team_by_owner(user["id"])
        return jsonify({"team": team_payload(team)})

    @app.route("/api/team", methods=["POST"])
    def team_create():
        user, _, error = require_user()
        if error:
            return error
        assert user is not None
        if database.get_team_by_owner(user["id"]):
            return json_error("You already registered a team", 409)
        payload = request.get_json(force=True, silent=True) or {}
        try:
            team_name, github_url, selected_tracks, player_count, players = validate_team_payload(payload, user["email"], creation=True)
            team = database.create_team(user["id"], team_name or "", github_url, selected_tracks, player_count or 1, players or [])
        except ValueError as exc:
            return json_error(str(exc), 400)
        except Exception as exc:
            if "UNIQUE constraint failed: teams.team_name" in str(exc):
                return json_error("Team name is already taken", 409)
            return json_error("Failed to create team", 500)
        return jsonify({"ok": True, "team": team_payload(team)})

    @app.route("/api/team", methods=["PATCH"])
    def team_update():
        user, _, error = require_user()
        if error:
            return error
        assert user is not None
        existing = database.get_team_by_owner(user["id"])
        if not existing:
            return json_error("Create a team first", 404)
        payload = request.get_json(force=True, silent=True) or {}
        try:
            _, github_url, selected_tracks, _, _ = validate_team_payload(payload, user["email"], creation=False)
        except ValueError as exc:
            return json_error(str(exc), 400)
        team = database.update_team(user["id"], github_url, selected_tracks)
        return jsonify({"ok": True, "team": team_payload(team)})

    return app


app = create_app()


if __name__ == "__main__":
    host = os.environ.get("HACKME_HOST", "127.0.0.1")
    port = int(os.environ.get("HACKME_PORT", "8787"))
    app.run(host=host, port=port, debug=False)
