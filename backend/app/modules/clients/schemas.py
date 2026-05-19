from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class ClientCreate(BaseModel):
    full_name: str
    phone: str
    email: EmailStr | None = None
    address: str | None = None
    notes: str | None = None


class ClientUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    notes: str | None = None


class ClientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    phone: str
    email: str | None
    address: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
