from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.modules.motorcycles.models import Motorcycle
from app.modules.motorcycles.repository import MotorcycleRepository
from app.modules.motorcycles.schemas import MotorcycleCreate, MotorcycleUpdate
from app.shared.exceptions import not_found


class MotorcycleService:
    def __init__(self, db: Session) -> None:
        self.repo = MotorcycleRepository(db)

    def list_motorcycles(self, tenant_id: uuid.UUID | None = None) -> list[Motorcycle]:
        return self.repo.list_all(tenant_id)

    def get_motorcycle(self, motorcycle_id: uuid.UUID, tenant_id: uuid.UUID | None = None) -> Motorcycle:
        motorcycle = self.repo.get_by_id(motorcycle_id)
        if not motorcycle:
            raise not_found("Motorcycle")
        if tenant_id is not None and motorcycle.tenant_id != tenant_id:
            raise not_found("Motorcycle")
        return motorcycle

    def list_by_client(self, client_id: uuid.UUID, tenant_id: uuid.UUID | None = None) -> list[Motorcycle]:
        return self.repo.list_by_client(client_id, tenant_id)

    def create_motorcycle(self, data: MotorcycleCreate, tenant_id: uuid.UUID | None = None) -> Motorcycle:
        motorcycle = Motorcycle(**data.model_dump(), tenant_id=tenant_id)
        return self.repo.create(motorcycle)

    def update_motorcycle(self, motorcycle_id: uuid.UUID, data: MotorcycleUpdate, tenant_id: uuid.UUID | None = None) -> Motorcycle:
        motorcycle = self.get_motorcycle(motorcycle_id, tenant_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(motorcycle, field, value)
        return self.repo.update(motorcycle)

    def delete_motorcycle(self, motorcycle_id: uuid.UUID, tenant_id: uuid.UUID | None = None) -> None:
        motorcycle = self.get_motorcycle(motorcycle_id, tenant_id)
        self.repo.delete(motorcycle)
