from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.parts.schemas import (
    AddPartToOrder,
    PartCreate,
    PartResponse,
    PartUpdate,
    ServiceOrderPartResponse,
)
from app.modules.parts.service import PartService
from app.shared.dependencies import get_current_user, require_admin

parts_router = APIRouter(prefix="/parts", tags=["parts"])
order_parts_router = APIRouter(prefix="/service-orders", tags=["parts"])


@parts_router.get("/", response_model=list[PartResponse])
def list_parts(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return PartService(db).list_parts()


@parts_router.post("/", response_model=PartResponse, status_code=status.HTTP_201_CREATED)
def create_part(
    data: PartCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
):
    return PartService(db).create_part(data)


@parts_router.get("/{part_id}", response_model=PartResponse)
def get_part(
    part_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return PartService(db).get_part(part_id)


@parts_router.put("/{part_id}", response_model=PartResponse)
def update_part(
    part_id: uuid.UUID,
    data: PartUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
):
    return PartService(db).update_part(part_id, data)


@parts_router.delete("/{part_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_part(
    part_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
):
    PartService(db).delete_part(part_id)


@order_parts_router.post(
    "/{order_id}/parts",
    response_model=ServiceOrderPartResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_part_to_order(
    order_id: uuid.UUID,
    data: AddPartToOrder,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return PartService(db).add_part_to_order(order_id, data, db)
