from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class TenantCreate(BaseModel):
    name: str
    owner_email: EmailStr
    admin_name: str
    admin_password: str
    subscription_expires_at: datetime | None = None


class TenantUpdate(BaseModel):
    name: str | None = None
    owner_email: EmailStr | None = None
    is_active: bool | None = None
    subscription_expires_at: datetime | None = None


class TenantResponse(BaseModel):
    id: uuid.UUID
    name: str
    owner_email: str
    is_active: bool
    subscription_expires_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class TenantWithAdminResponse(BaseModel):
    tenant: TenantResponse
    admin_email: str
    admin_temp_password: str
