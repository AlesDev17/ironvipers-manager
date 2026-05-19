from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.modules.expenses.models import Expense
from app.modules.expenses.repository import ExpenseRepository
from app.modules.expenses.schemas import ExpenseCreate, ExpenseUpdate
from app.shared.exceptions import not_found


class ExpenseService:
    def __init__(self, db: Session) -> None:
        self.repo = ExpenseRepository(db)

    def list_expenses(self) -> list[Expense]:
        return self.repo.list_all()

    def get_expense(self, expense_id: uuid.UUID) -> Expense:
        expense = self.repo.get_by_id(expense_id)
        if not expense:
            raise not_found("Expense")
        return expense

    def create_expense(self, data: ExpenseCreate) -> Expense:
        expense = Expense(**data.model_dump())
        return self.repo.create(expense)

    def update_expense(self, expense_id: uuid.UUID, data: ExpenseUpdate) -> Expense:
        expense = self.get_expense(expense_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(expense, field, value)
        return self.repo.update(expense)

    def delete_expense(self, expense_id: uuid.UUID) -> None:
        expense = self.get_expense(expense_id)
        self.repo.delete(expense)
