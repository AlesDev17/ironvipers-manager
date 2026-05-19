from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.shared.enums import PhotoType


class PhotoCreate(BaseModel):
    motorcycle_id: uuid.UUID
    service_order_id: uuid.UUID | None = None
    photo_url: str
    photo_type: PhotoType
    description: str | None = None


class PhotoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    motorcycle_id: uuid.UUID
    service_order_id: uuid.UUID | None
    photo_url: str
    photo_type: PhotoType
    description: str | None
    uploaded_by_id: uuid.UUID | None
    created_at: datetime
