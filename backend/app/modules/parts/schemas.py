from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class PartCreate(BaseModel):
    name: str
    sku: str | None = None
    brand: str | None = None
    description: str | None = None
    stock_quantity: int = 0
    unit_cost: Decimal = Decimal("0")
    sale_price: Decimal = Decimal("0")
    minimum_stock: int = 0


class PartUpdate(BaseModel):
    name: str | None = None
    sku: str | None = None
    brand: str | None = None
    description: str | None = None
    stock_quantity: int | None = None
    unit_cost: Decimal | None = None
    sale_price: Decimal | None = None
    minimum_stock: int | None = None


class PartResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    sku: str | None
    brand: str | None
    description: str | None
    stock_quantity: int
    unit_cost: Decimal
    sale_price: Decimal
    minimum_stock: int
    created_at: datetime
    updated_at: datetime


class AddPartToOrder(BaseModel):
    part_id: uuid.UUID
    quantity: int


class ServiceOrderPartResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    service_order_id: uuid.UUID
    part_id: uuid.UUID
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    part: PartResponse | None = None
