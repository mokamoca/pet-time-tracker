from datetime import datetime, timedelta

from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session

from app.main import create_app
from app.utils import db as db_utils
from app.models import entities


def build_test_client():
    test_engine = create_engine("sqlite://")
    SQLModel.metadata.create_all(test_engine)

    def get_session_override():
        with Session(test_engine) as session:
            yield session

    app = create_app()
    app.dependency_overrides[db_utils.get_session] = get_session_override
    return TestClient(app)


def test_signup_login_and_activity_flow():
    client = build_test_client()
    # signup
    res = client.post("/auth/signup", json={"email": "a@example.com", "password": "secret123"})
    assert res.status_code == 200
    # login
    res = client.post("/auth/login/json", json={"email": "a@example.com", "password": "secret123"})
    assert res.status_code == 200
    tokens = res.json()
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}
    # create pet
    res = client.post("/pets", json={"name": "Milo"}, headers=headers)
    assert res.status_code == 200
    pet_id = res.json()["id"]
    # create activity
    now = datetime.utcnow().isoformat()
    payload = {
        "pet_id": pet_id,
        "type": "walk",
        "amount": 15,
        "unit": "min",
        "started_at": now,
        "source": "quick",
    }
    res = client.post("/activities", json=payload, headers=headers)
    assert res.status_code == 200
    # stats
    today = datetime.utcnow().date().isoformat()
    res = client.get(f"/stats/daily?date={today}", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["walk_min"] == 15
