from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.users.schemas import UserCreate, UserResponse, UserUpdate
from app.modules.users.service import UserService
from app.shared.dependencies import require_admin

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
):
    return UserService(db).list_users()


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
):
    return UserService(db).create_user(data)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
):
    return UserService(db).get_user(user_id)


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: uuid.UUID,
    data: UserUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
):
    return UserService(db).update_user(user_id, data)


@router.patch("/{user_id}/activate", response_model=UserResponse)
def activate_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
):
    return UserService(db).activate_user(user_id)


@router.patch("/{user_id}/deactivate", response_model=UserResponse)
def deactivate_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
):
    return UserService(db).deactivate_user(user_id)
