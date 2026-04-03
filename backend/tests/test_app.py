from pathlib import Path

import pytest

from backend.app import create_app


@pytest.fixture
def client(tmp_path: Path):
    outbox = []

    def fake_send_email(to_email: str, subject: str, body: str):
        outbox.append({"to": to_email, "subject": subject, "body": body})

    app = create_app(
        {
            "TESTING": True,
            "DATABASE_PATH": tmp_path / "test.sqlite3",
            "SEND_EMAIL_FUNC": fake_send_email,
            "EXPOSE_DEV_CODE": True,
        }
    )
    return app.test_client(), outbox


def test_full_auth_and_team_flow(client):
    http, outbox = client

    send = http.post("/api/auth/send-code", json={"email": "ivan.a.petrov.2024@elsys-bg.org"})
    assert send.status_code == 200
    send_payload = send.get_json()
    assert send_payload["ok"] is True
    assert send_payload["code"]
    assert outbox and outbox[0]["to"] == "ivan.a.petrov.2024@elsys-bg.org"

    verify = http.post(
        "/api/auth/verify-code",
        json={
            "email": "ivan.a.petrov.2024@elsys-bg.org",
            "code": send_payload["code"],
            "password": "1234",
        },
    )
    assert verify.status_code == 200
    verify_payload = verify.get_json()
    token = verify_payload["token"]
    assert verify_payload["user"]["email"] == "ivan.a.petrov.2024@elsys-bg.org"

    me = http.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.get_json()["team"] is None

    create_team = http.post(
        "/api/team",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "team_name": "Gradient Ninjas",
            "github_url": "https://github.com/TUES-AI/gradient-ninjas",
            "selected_tracks": ["autograd", "toolsmith"],
            "player_count": 2,
            "players": [
                "ivan.a.petrov.2024@elsys-bg.org",
                "maria.b.ivanova.2024@elsys-bg.org",
            ],
        },
    )
    assert create_team.status_code == 200
    create_payload = create_team.get_json()["team"]
    assert create_payload["team_name"] == "Gradient Ninjas"
    assert create_payload["selected_tracks"] == ["autograd", "toolsmith"]
    assert create_payload["players"][1] == "maria.b.ivanova.2024@elsys-bg.org"

    update_team = http.patch(
        "/api/team",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "github_url": "https://github.com/TUES-AI/gradient-ninjas-v2",
            "selected_tracks": ["game", "autograd"],
        },
    )
    assert update_team.status_code == 200
    updated = update_team.get_json()["team"]
    assert updated["github_url"].endswith("gradient-ninjas-v2")
    assert updated["selected_tracks"] == ["game", "autograd"]
    assert updated["team_name"] == "Gradient Ninjas"

    login = http.post(
        "/api/auth/login",
        json={"email": "ivan.a.petrov.2024@elsys-bg.org", "password": "1234"},
    )
    assert login.status_code == 200


def test_invalid_email_rejected(client):
    http, _ = client
    response = http.post("/api/auth/send-code", json={"email": "not-tues@example.com"})
    assert response.status_code == 400


def test_team_requires_auth(client):
    http, _ = client
    response = http.get("/api/team")
    assert response.status_code == 401
