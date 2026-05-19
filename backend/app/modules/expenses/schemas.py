from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.shared.enums import ExpenseCategory


class ExpenseCreate(BaseModel):
    concept: str
    amount: Decimal
    category: ExpenseCategory
    expense_date: date
    notes: str | None = None


class ExpenseUpdate(BaseModel):
    concept: str | None = None
    amount: Decimal | None = None
    category: ExpenseCategory | None = None
    expense_date: date | None = None
    notes: str | None = None


class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    concept: str
    amount: Decimal
    category: ExpenseCategory
    expense_date: date
    notes: str | None
    created_at: datetime
