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

    def list_motorcycles(self) -> list[Motorcycle]:
        return self.repo.list_all()

    def get_motorcycle(self, motorcycle_id: uuid.UUID) -> Motorcycle:
        motorcycle = self.repo.get_by_id(motorcycle_id)
        if not motorcycle:
            raise not_found("Motorcycle")
        return motorcycle

    def list_by_client(self, client_id: uuid.UUID) -> list[Motorcycle]:
        return self.repo.list_by_client(client_id)

    def create_motorcycle(self, data: MotorcycleCreate) -> Motorcycle:
        motorcycle = Motorcycle(**data.model_dump())
        return self.repo.create(motorcycle)

    def update_motorcycle(self, motorcycle_id: uuid.UUID, data: MotorcycleUpdate) -> Motorcycle:
        motorcycle = self.get_motorcycle(motorcycle_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(motorcycle, field, value)
        return self.repo.update(motorcycle)

    def delete_motorcycle(self, motorcycle_id: uuid.UUID) -> None:
        motorcycle = self.get_motorcycle(motorcycle_id)
        self.repo.delete(motorcycle)
