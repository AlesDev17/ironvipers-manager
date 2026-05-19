from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.shared.enums import PaymentMethod


class PaymentCreate(BaseModel):
    amount: Decimal
    payment_method: PaymentMethod
    payment_date: datetime | None = None
    notes: str | None = None


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    service_order_id: uuid.UUID
    amount: Decimal
    payment_method: PaymentMethod
    payment_date: datetime
    notes: str | None
    created_at: datetime
