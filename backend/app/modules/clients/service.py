from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.modules.clients.models import Client
from app.modules.clients.repository import ClientRepository
from app.modules.clients.schemas import ClientCreate, ClientUpdate
from app.shared.exceptions import not_found


class ClientService:
    def __init__(self, db: Session) -> None:
        self.repo = ClientRepository(db)

    def list_clients(self, tenant_id: uuid.UUID | None = None) -> list[Client]:
        return self.repo.list_all(tenant_id)

    def get_client(self, client_id: uuid.UUID, tenant_id: uuid.UUID | None = None) -> Client:
        client = self.repo.get_by_id(client_id)
        if not client:
            raise not_found("Client")
        if tenant_id is not None and client.tenant_id != tenant_id:
            raise not_found("Client")
        return client

    def create_client(self, data: ClientCreate, tenant_id: uuid.UUID | None = None) -> Client:
        client = Client(**data.model_dump(), tenant_id=tenant_id)
        return self.repo.create(client)

    def update_client(self, client_id: uuid.UUID, data: ClientUpdate, tenant_id: uuid.UUID | None = None) -> Client:
        client = self.get_client(client_id, tenant_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(client, field, value)
        return self.repo.update(client)

    def delete_client(self, client_id: uuid.UUID, tenant_id: uuid.UUID | None = None) -> None:
        client = self.get_client(client_id, tenant_id)
        self.repo.delete(client)
