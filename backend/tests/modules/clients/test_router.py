from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


CLIENT_PAYLOAD = {
    "full_name": "Juan Perez",
    "phone": "5551234567",
    "email": "juan@example.com",
    "address": "Calle Reforma 123",
    "notes": "Cliente frecuente",
}


def test_create_client(client: TestClient, auth_headers: dict):
    response = client.post("/api/v1/clients/", json=CLIENT_PAYLOAD, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == CLIENT_PAYLOAD["full_name"]
    assert data["phone"] == CLIENT_PAYLOAD["phone"]
    assert "id" in data


def test_get_client(client: TestClient, auth_headers: dict):
    create_response = client.post(
        "/api/v1/clients/",
        json={**CLIENT_PAYLOAD, "email": "get_client@example.com"},
        headers=auth_headers,
    )
    assert create_response.status_code == 201
    client_id = create_response.json()["id"]

    response = client.get(f"/api/v1/clients/{client_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == client_id
    assert data["full_name"] == CLIENT_PAYLOAD["full_name"]


def test_get_client_not_found(client: TestClient, auth_headers: dict):
    fake_id = "00000000-0000-0000-0000-000000000000"
    response = client.get(f"/api/v1/clients/{fake_id}", headers=auth_headers)
    assert response.status_code == 404


def test_list_clients(client: TestClient, auth_headers: dict):
    response = client.get("/api/v1/clients/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_update_client(client: TestClient, auth_headers: dict):
    create_response = client.post(
        "/api/v1/clients/",
        json={**CLIENT_PAYLOAD, "email": "update_client@example.com"},
        headers=auth_headers,
    )
    assert create_response.status_code == 201
    client_id = create_response.json()["id"]

    update_response = client.put(
        f"/api/v1/clients/{client_id}",
        json={"full_name": "Juan Actualizado", "phone": "5559876543"},
        headers=auth_headers,
    )
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["full_name"] == "Juan Actualizado"
    assert data["phone"] == "5559876543"


def test_delete_client(client: TestClient, auth_headers: dict):
    create_response = client.post(
        "/api/v1/clients/",
        json={**CLIENT_PAYLOAD, "email": "delete_client@example.com"},
        headers=auth_headers,
    )
    assert create_response.status_code == 201
    client_id = create_response.json()["id"]

    delete_response = client.delete(f"/api/v1/clients/{client_id}", headers=auth_headers)
    assert delete_response.status_code == 204

    get_response = client.get(f"/api/v1/clients/{client_id}", headers=auth_headers)
    assert get_response.status_code == 404


def test_list_clients_unauthenticated(client: TestClient):
    response = client.get("/api/v1/clients/")
    assert response.status_code == 401
