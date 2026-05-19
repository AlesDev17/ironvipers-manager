from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.photos.schemas import PhotoCreate, PhotoResponse
from app.modules.photos.service import PhotoService
from app.shared.dependencies import get_current_user

router = APIRouter(tags=["photos"])


@router.post(
    "/service-orders/{order_id}/photos",
    response_model=PhotoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_photo(
    order_id: uuid.UUID,
    data: PhotoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return PhotoService(db).create_photo(order_id, data, current_user.id)


@router.get("/service-orders/{order_id}/photos", response_model=list[PhotoResponse])
def list_photos(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return PhotoService(db).list_by_order(order_id)


@router.delete("/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_photo(
    photo_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    PhotoService(db).delete_photo(photo_id)
