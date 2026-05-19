from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.modules.users.models import User
from app.shared.enums import UserRole

# Use file-based SQLite so all connections share the same database
SQLITE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLITE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables immediately on conftest load
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Ensure tables exist for the entire test session."""
    yield
    Base.metadata.drop_all(bind=engine)
    import os
    if os.path.exists("./test.db"):
        os.remove("./test.db")


@pytest.fixture
def db() -> Session:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session")
def admin_user_data():
    """Creates the admin user once per session directly via SQLAlchemy."""
    db = TestingSessionLocal()
    try:
        existing = db.query(User).filter(User.email == "admin@test.com").first()
        if not existing:
            user = User(
                full_name="Test Admin",
                email="admin@test.com",
                password_hash=hash_password("adminpass123"),
                role=UserRole.ADMIN,
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return {"email": "admin@test.com", "password": "adminpass123"}
    finally:
        db.close()


@pytest.fixture
def admin_user(db: Session) -> User:
    return db.query(User).filter(User.email == "admin@test.com").first()


@pytest.fixture
def client(admin_user_data) -> TestClient:
    return TestClient(app)


@pytest.fixture
def auth_headers(client: TestClient, admin_user_data: dict) -> dict:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": admin_user_data["email"], "password": admin_user_data["password"]},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
