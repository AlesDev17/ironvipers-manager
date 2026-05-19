from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.shared.enums import UserRole


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: str | None = None
    role: UserRole = UserRole.MECHANIC


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    email: str
    phone: str | None
    role: UserRole
    is_active: bool
    created_at: datetime
