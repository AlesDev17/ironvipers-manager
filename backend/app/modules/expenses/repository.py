from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.expenses.models import Expense


class ExpenseRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, expense_id: uuid.UUID) -> Expense | None:
        return self.db.get(Expense, expense_id)

    def list_all(self) -> list[Expense]:
        stmt = select(Expense).order_by(Expense.expense_date.desc())
        return list(self.db.execute(stmt).scalars().all())

    def create(self, expense: Expense) -> Expense:
        self.db.add(expense)
        self.db.commit()
        self.db.refresh(expense)
        return expense

    def update(self, expense: Expense) -> Expense:
        self.db.commit()
        self.db.refresh(expense)
        return expense

    def delete(self, expense: Expense) -> None:
        self.db.delete(expense)
        self.db.commit()
