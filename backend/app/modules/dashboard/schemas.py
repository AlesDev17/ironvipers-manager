from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.modules.parts.schemas import PartResponse
from app.shared.enums import OrderStatus


class DashboardSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    active_orders: int
    completed_orders: int
    todays_income: Decimal
    monthly_income: Decimal
    motorcycles_in_repair: int
    low_stock_parts: int
    pending_payments_total: Decimal
    waiting_authorization_count: int


class IncomeReport(BaseModel):
    today: Decimal
    month: Decimal
    year: Decimal


class OrderStatusCount(BaseModel):
    status: OrderStatus
    count: int
