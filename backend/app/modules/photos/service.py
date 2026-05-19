from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.modules.photos.models import MotorcyclePhoto
from app.modules.photos.repository import PhotoRepository
from app.modules.photos.schemas import PhotoCreate
from app.shared.exceptions import not_found


class PhotoService:
    def __init__(self, db: Session) -> None:
        self.repo = PhotoRepository(db)

    def create_photo(
        self, order_id: uuid.UUID, data: PhotoCreate, uploader_id: uuid.UUID
    ) -> MotorcyclePhoto:
        photo = MotorcyclePhoto(
            motorcycle_id=data.motorcycle_id,
            service_order_id=order_id,
            photo_url=data.photo_url,
            photo_type=data.photo_type,
            description=data.description,
            uploaded_by_id=uploader_id,
        )
        return self.repo.create(photo)

    def list_by_order(self, order_id: uuid.UUID) -> list[MotorcyclePhoto]:
        return self.repo.list_by_order(order_id)

    def delete_photo(self, photo_id: uuid.UUID) -> None:
        photo = self.repo.get_by_id(photo_id)
        if not photo:
            raise not_found("Photo")
        self.repo.delete(photo)
