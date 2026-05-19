from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.photos.models import MotorcyclePhoto


class PhotoRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, photo_id: uuid.UUID) -> MotorcyclePhoto | None:
        return self.db.get(MotorcyclePhoto, photo_id)

    def list_by_order(self, service_order_id: uuid.UUID) -> list[MotorcyclePhoto]:
        stmt = (
            select(MotorcyclePhoto)
            .where(MotorcyclePhoto.service_order_id == service_order_id)
            .order_by(MotorcyclePhoto.created_at.desc())
        )
        return list(self.db.execute(stmt).scalars().all())

    def create(self, photo: MotorcyclePhoto) -> MotorcyclePhoto:
        self.db.add(photo)
        self.db.commit()
        self.db.refresh(photo)
        return photo

    def delete(self, photo: MotorcyclePhoto) -> None:
        self.db.delete(photo)
        self.db.commit()
