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

    def list_expenses(self, tenant_id: uuid.UUID | None = None) -> list[Expense]:
        return self.repo.list_all(tenant_id)

    def get_expense(self, expense_id: uuid.UUID, tenant_id: uuid.UUID | None = None) -> Expense:
        expense = self.repo.get_by_id(expense_id)
        if not expense:
            raise not_found("Expense")
        if tenant_id is not None and expense.tenant_id != tenant_id:
            raise not_found("Expense")
        return expense

    def create_expense(self, data: ExpenseCreate, tenant_id: uuid.UUID | None = None) -> Expense:
        expense = Expense(**data.model_dump(), tenant_id=tenant_id)
        return self.repo.create(expense)

    def update_expense(self, expense_id: uuid.UUID, data: ExpenseUpdate, tenant_id: uuid.UUID | None = None) -> Expense:
        expense = self.get_expense(expense_id, tenant_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(expense, field, value)
        return self.repo.update(expense)

    def delete_expense(self, expense_id: uuid.UUID, tenant_id: uuid.UUID | None = None) -> None:
        expense = self.get_expense(expense_id, tenant_id)
        self.repo.delete(expense)
