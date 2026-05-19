from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


def test_login_success(client: TestClient, admin_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "adminpass123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@test.com"
    assert "password_hash" not in data["user"]


def test_login_invalid_credentials(client: TestClient, admin_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_login_unknown_email(client: TestClient):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@test.com", "password": "anypassword"},
    )
    assert response.status_code == 401


def test_get_me(client: TestClient, auth_headers: dict):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@test.com"
    assert "password_hash" not in data


def test_get_me_unauthenticated(client: TestClient):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
