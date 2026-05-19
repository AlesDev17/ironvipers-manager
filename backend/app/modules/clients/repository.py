from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.clients.models import Client


class ClientRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, client_id: uuid.UUID) -> Client | None:
        return self.db.get(Client, client_id)

    def list_all(self) -> list[Client]:
        stmt = select(Client).order_by(Client.created_at.desc())
        return list(self.db.execute(stmt).scalars().all())

    def create(self, client: Client) -> Client:
        self.db.add(client)
        self.db.commit()
        self.db.refresh(client)
        return client

    def update(self, client: Client) -> Client:
        self.db.commit()
        self.db.refresh(client)
        return client

    def delete(self, client: Client) -> None:
        self.db.delete(client)
        self.db.commit()
