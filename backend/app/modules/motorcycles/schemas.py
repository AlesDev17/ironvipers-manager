from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MotorcycleCreate(BaseModel):
    client_id: uuid.UUID
    brand: str
    model: str
    year: int
    plate: str | None = None
    vin: str | None = None
    color: str | None = None
    km: int | None = None
    notes: str | None = None


class MotorcycleUpdate(BaseModel):
    client_id: uuid.UUID | None = None
    brand: str | None = None
    model: str | None = None
    year: int | None = None
    plate: str | None = None
    vin: str | None = None
    color: str | None = None
    km: int | None = None
    notes: str | None = None


class MotorcycleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    client_id: uuid.UUID
    brand: str
    model: str
    year: int
    plate: str | None
    vin: str | None
    color: str | None
    km: int | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
