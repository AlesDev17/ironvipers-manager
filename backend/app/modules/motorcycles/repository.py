from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.motorcycles.models import Motorcycle


class MotorcycleRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, motorcycle_id: uuid.UUID) -> Motorcycle | None:
        return self.db.get(Motorcycle, motorcycle_id)

    def list_all(self, tenant_id: uuid.UUID | None = None) -> list[Motorcycle]:
        stmt = select(Motorcycle)
        if tenant_id is not None:
            stmt = stmt.where(Motorcycle.tenant_id == tenant_id)
        stmt = stmt.order_by(Motorcycle.created_at.desc())
        return list(self.db.execute(stmt).scalars().all())

    def list_by_client(self, client_id: uuid.UUID, tenant_id: uuid.UUID | None = None) -> list[Motorcycle]:
        stmt = select(Motorcycle).where(Motorcycle.client_id == client_id)
        if tenant_id is not None:
            stmt = stmt.where(Motorcycle.tenant_id == tenant_id)
        stmt = stmt.order_by(Motorcycle.created_at.desc())
        return list(self.db.execute(stmt).scalars().all())

    def create(self, motorcycle: Motorcycle) -> Motorcycle:
        self.db.add(motorcycle)
        self.db.commit()
        self.db.refresh(motorcycle)
        return motorcycle

    def update(self, motorcycle: Motorcycle) -> Motorcycle:
        self.db.commit()
        self.db.refresh(motorcycle)
        return motorcycle

    def delete(self, motorcycle: Motorcycle) -> None:
        self.db.delete(motorcycle)
        self.db.commit()
