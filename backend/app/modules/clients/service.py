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

    def list_clients(self) -> list[Client]:
        return self.repo.list_all()

    def get_client(self, client_id: uuid.UUID) -> Client:
        client = self.repo.get_by_id(client_id)
        if not client:
            raise not_found("Client")
        return client

    def create_client(self, data: ClientCreate) -> Client:
        client = Client(**data.model_dump())
        return self.repo.create(client)

    def update_client(self, client_id: uuid.UUID, data: ClientUpdate) -> Client:
        client = self.get_client(client_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(client, field, value)
        return self.repo.update(client)

    def delete_client(self, client_id: uuid.UUID) -> None:
        client = self.get_client(client_id)
        self.repo.delete(client)
