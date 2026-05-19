from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.shared.enums import OrderStatus


class ServiceOrderCreate(BaseModel):
    motorcycle_id: uuid.UUID
    client_id: uuid.UUID
    problem_description: str | None = None
    estimated_delivery_date: datetime | None = None
    assigned_mechanic_id: uuid.UUID | None = None


class ServiceOrderUpdate(BaseModel):
    problem_description: str | None = None
    diagnosis: str | None = None
    work_performed: str | None = None
    labor_cost: Decimal | None = None
    estimated_delivery_date: datetime | None = None
    assigned_mechanic_id: uuid.UUID | None = None


class StatusUpdate(BaseModel):
    status: OrderStatus


class AssignMechanic(BaseModel):
    mechanic_id: uuid.UUID


class ServiceOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    motorcycle_id: uuid.UUID
    client_id: uuid.UUID
    assigned_mechanic_id: uuid.UUID | None
    status: OrderStatus
    entry_date: datetime
    estimated_delivery_date: datetime | None
    problem_description: str | None
    diagnosis: str | None
    work_performed: str | None
    labor_cost: Decimal
    parts_cost: Decimal
    total_cost: Decimal
    paid_amount: Decimal
    balance_due: Decimal
    created_at: datetime
    updated_at: datetime
    closed_at: datetime | None
