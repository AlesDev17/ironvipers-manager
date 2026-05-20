from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.motorcycles.schemas import (
    MotorcycleCreate,
    MotorcycleResponse,
    MotorcycleUpdate,
)
from app.modules.motorcycles.service import MotorcycleService
from app.shared.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/motorcycles", tags=["motorcycles"])


@router.get("", response_model=list[MotorcycleResponse])
def list_motorcycles(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return MotorcycleService(db).list_motorcycles()


@router.post("", response_model=MotorcycleResponse, status_code=status.HTTP_201_CREATED)
def create_motorcycle(
    data: MotorcycleCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return MotorcycleService(db).create_motorcycle(data)


@router.get("/by-client/{client_id}", response_model=list[MotorcycleResponse])
def list_by_client(
    client_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return MotorcycleService(db).list_by_client(client_id)


@router.get("/{motorcycle_id}", response_model=MotorcycleResponse)
def get_motorcycle(
    motorcycle_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return MotorcycleService(db).get_motorcycle(motorcycle_id)


@router.put("/{motorcycle_id}", response_model=MotorcycleResponse)
def update_motorcycle(
    motorcycle_id: uuid.UUID,
    data: MotorcycleUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return MotorcycleService(db).update_motorcycle(motorcycle_id, data)


@router.delete("/{motorcycle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_motorcycle(
    motorcycle_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
):
    MotorcycleService(db).delete_motorcycle(motorcycle_id)
